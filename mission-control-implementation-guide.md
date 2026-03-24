# Mission Control Implementation Quick Reference

**For:** Backend Development Team  
**Date:** March 2026  
**Status:** Implementation Guide

---

## Critical Decisions

### 1. **Event Ordering & Idempotency**
- **Decision:** Per-mission event ordering, global idempotency by event ID
- **Why:** Missions must progress deterministically; duplicate events must not break state
- **Implementation:** 
  - Use Redis for 24h idempotency window
  - Events within a mission processed sequentially by mission_id
  - Parallel processing OK across different missions

### 2. **Activity Log Immutability**
- **Decision:** Append-only, no UPDATE/DELETE on activity_logs table
- **Why:** Audit trail integrity, compliance
- **Implementation:**
  - Check constraint: `(no_update_allowed)`
  - No soft-deletes; archival only
  - Partitioned by month for management

### 3. **Agent Status vs. Actual State**
- **Decision:** Status reflects DESIRED state; heartbeat verifies ACTUAL state
- **Why:** Agents can fail; we need to detect it
- **Implementation:**
  - Agent.status = what we expect
  - Heartbeat failure → agent.status = UNAVAILABLE (after 3x heartbeat_interval)
  - Reconciliation job every 5 min checks discrepancies

### 4. **Approval SLA Model**
- **Decision:** Hard timeout with escalation, not automatic approval
- **Why:** Approvals are intentional; timeouts must alert, not auto-proceed
- **Implementation:**
  - Set timeout_at = NOW() + SLA duration
  - Cron job every 5 min checks expired approvals
  - EXPIRED status blocks mission progression
  - Send escalation notification

### 5. **Real-Time Architecture**
- **Decision:** WebSocket primary, polling fallback
- **Why:** Low-latency updates for live monitoring; fallback for poor connections
- **Implementation:**
  - WebSocket: bidirectional, <50ms roundtrip
  - Polling: every 5 sec, `/api/missions/{id}/changes?since=`
  - Clients auto-switch to polling on WS disconnect

### 6. **Authorization Model**
- **Decision:** Role-based (RBAC) for approval gates; agent-as-actor for operations
- **Why:** Humans approve; agents execute
- **Implementation:**
  - JWT contains `roles` array
  - Approval gates check `required_role`
  - Agents identified by agent_id, not role

---

## Data Model Essentials

### Agent Status Flow
```
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌─────────┐
│  IDLE   │────▶│ RUNNING │────▶│ WAITING  │────▶│COMPLETED│
└─────────┘     └────┬────┘     └──────────┘     └─────────┘
                     │
                     │ (3x heartbeat miss)
                     ▼
              ┌────────────┐
              │UNAVAILABLE │
              └────────────┘

Additional: FAILED (terminal)
```

### Mission Status + Approval Interaction
```
IN_PROGRESS
    │
    ├─ approval_required = false ──▶ COMPLETED
    │
    └─ approval_required = true
        │
        ▼
      REVIEW ──▶ create_approval_gate() ──▶ AWAITING_APPROVAL
                                              │
                                      ┌───────┴────────┐
                                      │                │
                                    APPROVE          DENY
                                      │                │
                                      ▼                ▼
                                  COMPLETED         FAILED
```

### Agent Assignment Strategy

**Default (auto):**
```python
def route_mission(mission):
    candidates = agents where:
        - status IN (IDLE, WAITING)
        - all required_capabilities in agent.capabilities
        - queue_position < max_concurrent_tasks
    
    if not candidates:
        mission.status = ROUTED  # Will retry when agent frees up
        return
    
    # Pick least-busy agent
    agent = min(candidates, key=lambda a: a.queue_position)
    assign(mission, agent)
    mission.status = ROUTED
```

---

## API Response Patterns

### Success Response
```json
{
  "data": {
    "id": "...",
    "status": "...",
    ...
  },
  "meta": {
    "timestamp": "2026-03-25T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid mission status transition",
    "details": {
      "current_status": "COMPLETED",
      "requested_status": "IN_PROGRESS",
      "allowed_transitions": ["CANCELLED"]
    }
  },
  "meta": {
    "timestamp": "2026-03-25T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "total": 500,
    "limit": 50,
    "offset": 0,
    "has_more": true
  },
  "meta": {
    "timestamp": "2026-03-25T12:00:00Z",
    "request_id": "req_abc123"
  }
}
```

---

## Critical Paths to Implement First

### 1. Agent Heartbeat Loop
```
Agent sends: POST /api/agents/{id}/heartbeat
Backend:
  1. Find agent by ID
  2. Update last_heartbeat
  3. Update status if needed (UNAVAILABLE → IDLE)
  4. Publish AGENT_HEARTBEAT event
  5. Return next interval

Time budget: <50ms
```

### 2. Mission Routing & Assignment
```
Trigger: POST /api/missions/{id}/route
Backend:
  1. Validate mission.status == INTAKE
  2. Find candidate agents
  3. Update agents[].current_task
  4. Update mission.assigned_agents
  5. Update mission.status = ROUTED
  6. Publish MISSION_ROUTED event
  7. Notify agent (webhook or next poll)

Time budget: <200ms
```

### 3. Mission Completion → Approval Gate
```
Trigger: PATCH /api/missions/{id}/status to REVIEW
Backend:
  1. Check approval_required flag
  2. If false: set status = COMPLETED → DONE
  3. If true:
     a. Create approval_gates (ordered)
     b. Create first approval record (PENDING)
     c. Set mission.status = AWAITING_APPROVAL
     d. Publish APPROVAL_REQUESTED event
  4. Return mission with approval details

Time budget: <300ms
```

### 4. Approval Decision → Mission Unblock
```
Trigger: POST /api/approvals/{id}/approve or /deny
Backend:
  1. Validate approver authorization
  2. Update approval.status
  3. Check if all gates satisfied
  4. If all gates approved:
     a. Update mission.status = COMPLETED
     b. Publish MISSION_COMPLETED event
  5. If any gate denied:
     a. Update mission.status = FAILED
     b. Publish MISSION_FAILED event
  6. Notify requester

Time budget: <300ms
```

---

## Testing Strategy

### Unit Tests (per component)
```python
# test_agent_registry.py
def test_agent_heartbeat_updates_timestamp()
def test_agent_status_transitions_valid()
def test_agent_unavailable_after_3_missed_beats()

# test_mission_lifecycle.py
def test_mission_status_flow_without_approval()
def test_mission_blocks_on_approval_required()
def test_mission_fails_if_approval_denied()

# test_approval_flow.py
def test_approval_gate_creation_ordered()
def test_approval_sla_enforced()
def test_approval_expiration_blocks_mission()

# test_activity_logging.py
def test_activity_log_immutable()
def test_activity_log_searchable_by_agent()
def test_activity_log_no_deletes_allowed()
```

### Integration Tests (end-to-end)
```python
# test_mission_end_to_end.py
def test_full_mission_lifecycle_no_approval():
    # 1. Create mission
    # 2. Route to agent
    # 3. Agent starts task
    # 4. Agent logs activity
    # 5. Agent marks complete
    # 6. Verify mission.status == COMPLETED

def test_full_mission_lifecycle_with_approval():
    # 1. Create mission with approval_required=true
    # 2. Route, start, complete
    # 3. Block on approval gate
    # 4. Approver approves
    # 5. Mission transitions to COMPLETED

def test_approval_denial_fails_mission():
    # 1. Create mission with approval
    # 2. Route, start, complete
    # 3. Approver denies
    # 4. Mission transitions to FAILED
    # 5. Requester notified
```

### Load Tests
```python
# test_load.py
def test_1000_concurrent_missions():
    # Create 1000 missions, assign, execute, complete
    # Measure: latency p50/p95/p99, throughput

def test_websocket_1000_concurrent_connections():
    # 1000 clients subscribe to missions
    # Publish 100 events/sec
    # Measure: latency, connection stability

def test_activity_log_5000_entries_per_second():
    # Ingest 5000 activity logs/sec
    # Query while writing
    # Measure: ingest latency, query latency
```

---

## Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Agent heartbeat | <50ms | p95 |
| Mission create | <100ms | p95 |
| Mission route | <200ms | p95 |
| Approval approve/deny | <300ms | p95 |
| Activity log ingest | <20ms | p95 |
| Mission query (w/ filters) | <100ms | p95 |
| WebSocket message latency | <500ms | p99 |
| Agent list (50 items) | <100ms | p95 |

---

## Common Pitfalls to Avoid

### ❌ Pitfall 1: Approvals Block Forever
**Problem:** Approval timeout not checked; mission stuck in AWAITING_APPROVAL  
**Solution:** Cron job every 5 min checks `timeout_at < NOW()` → auto-EXPIRE

### ❌ Pitfall 2: Agent Status Desync
**Problem:** Agent.status = RUNNING but agent crashed; mission blocked  
**Solution:** 3-strike heartbeat miss → auto-transition to UNAVAILABLE

### ❌ Pitfall 3: Activity Log Queryability
**Problem:** Can't find agent actions after 1 month due to no indexing  
**Solution:** Index on (agent_id, timestamp), partition by month

### ❌ Pitfall 4: WebSocket Broadcast Storm
**Problem:** Broadcast every event to all clients → 1000 connections = 100K msgs/sec  
**Solution:** Subscribe to specific channels/missions, only send relevant events

### ❌ Pitfall 5: Duplicate Event Processing
**Problem:** Same event processed twice → mission status flip-flops  
**Solution:** Redis deduplication window (24h), idempotency keys

### ❌ Pitfall 6: Approval Cycle Deadlock
**Problem:** Gate 2 waits for Gate 1, but Gate 1 never completes  
**Solution:** Max depth = 5 gates, timeout cascades, clear error messaging

---

## Database Optimization Priorities

### Indexes (Create First)
```sql
-- These 5 cover 80% of queries
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_created_at ON missions(created_at DESC);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_activity_logs_agent_id ON activity_logs(agent_id, timestamp DESC);
CREATE INDEX idx_activity_logs_mission_id ON activity_logs(mission_id, timestamp DESC);
```

### N+1 Killers
```
❌ Don't: FOR EACH mission { SELECT agent FROM agents WHERE id = mission.assigned_agent }
✅ Do: SELECT * FROM agents WHERE id IN (SELECT unnest(assigned_agents) FROM missions)

❌ Don't: FOR EACH mission { SELECT approvals FROM approvals WHERE mission_id = mission.id }
✅ Do: SELECT * FROM approvals WHERE mission_id IN (...)

❌ Don't: FOR EACH activity { SELECT mission FROM missions WHERE id = activity.mission_id }
✅ Do: Denormalize mission_title into activity_logs
```

### Query Patterns
```sql
-- Denormalize common joins
ALTER TABLE activity_logs ADD COLUMN mission_title VARCHAR(500);
ALTER TABLE approvals ADD COLUMN mission_title VARCHAR(500);

-- This eliminates JOIN on missions for UI display
SELECT id, action, mission_title, timestamp FROM activity_logs WHERE agent_id = ?;
```

---

## Deployment Strategy

### Zero-Downtime Deployment

```
1. Blue/Green Setup
   - Current (Blue): Production
   - New (Green): Staging, fully warmed
   
2. Pre-Deploy
   - Run DB migrations on Green (in isolation)
   - Run smoke tests against Green
   - Monitor Green metrics
   
3. Cutover
   - Update load balancer: Blue → Green
   - Monitor error rate (5 min)
   
4. Rollback
   - If errors: Load balancer: Green → Blue
   - No data loss (DB already migrated)
```

### Database Migration Safety

```sql
-- ✅ Safe migrations (can be undone)
ALTER TABLE missions ADD COLUMN new_field VARCHAR(255) DEFAULT '';
CREATE INDEX idx_new_field ON missions(new_field);

-- ❌ Risky migrations (take time)
ALTER TABLE missions DROP COLUMN old_field;  -- Requires downtime

-- ✅ Safer approach: backfill separately
-- Day 1: Add column, stop writing to old_field
-- Day 2: Migrate data
-- Day 3: Drop old_field, remove code references
```

---

## Monitoring Dashboards to Build

### 1. Operations Dashboard (for Herb)
- Active missions (count, status breakdown)
- Agent health (% available, heartbeat failures)
- Approval queue (pending count, oldest SLA)
- Error rate (last hour, last 24h trend)
- Queue depth (current, moving avg)

### 2. Performance Dashboard
- API latency (p50, p95, p99 by endpoint)
- Database latency (query time, connection count)
- Event throughput (events/sec)
- WebSocket connections (current, peak)

### 3. Reliability Dashboard
- Error rate by operation (mission creation, approval, etc.)
- Agent failure rate (by agent)
- Approval denial rate (by type)
- Activity log ingest lag (if using async)

---

## Security Checklist

- [ ] JWT validation on all endpoints
- [ ] CORS headers configured (whitelist frontend origins)
- [ ] Rate limiting (100 req/min per IP)
- [ ] SQL injection: Use parameterized queries (no string concat)
- [ ] XSS: Never echo user input; use proper escaping
- [ ] CSRF: Include CSRF token in mutation requests
- [ ] Secrets: Use env vars, never commit to git
- [ ] Audit: Log all state-changing operations
- [ ] Data deletion: No hard deletes; soft deletes only with TTL
- [ ] Encryption: TLS for all transport, encrypt sensitive fields at rest

---

## Scaling Indicators

**Scale up when:**
- API p95 latency > 200ms
- Database CPU > 70%
- WebSocket connections > 500
- Queue depth > 50

**Scale out (add instances) when:**
- All optimizations exhausted
- Need > 10K concurrent operations

---

## Rollout Timeline

```
Week 1-2: Phase 1 (Foundation)
  ✓ DB schema ready
  ✓ Basic CRUD APIs functional
  ✓ Swagger docs published
  
Week 2-3: Phase 2 (Core Logic)
  ✓ Mission routing working
  ✓ Agent heartbeat operational
  ✓ State machine tested
  
Week 3-4: Phase 3 (Approvals)
  ✓ Approval gates functional
  ✓ Multi-stage workflows operational
  ✓ SLA enforcement active
  
Week 4-5: Phase 4 (Real-Time)
  ✓ WebSocket streaming live
  ✓ Event bus functional
  ✓ Frontend can subscribe
  
Week 5-6: Phase 5 (Logging & Queries)
  ✓ Activity log indexed
  ✓ Search working
  ✓ Audit trail complete
  
Week 6-7: Phase 6 (Health & Monitoring)
  ✓ Health API live
  ✓ Alerts triggering
  ✓ Dashboards ready
  
Week 7-8: Phase 7 (Optimization & Hardening)
  ✓ Load testing passed
  ✓ Failover tested
  ✓ Production-ready
  
Week 8: Phase 8 (Handoff)
  ✓ Docs complete
  ✓ Runbooks written
  ✓ Knowledge transfer done
```

---

## Integration Checklist for Davinci (Frontend)

Frontend needs from backend before starting UI:

- [ ] Swagger API docs (OpenAPI spec)
- [ ] Agent status enum values
- [ ] Mission status enum values
- [ ] Approval type enum values
- [ ] Sample responses for each endpoint
- [ ] WebSocket event schema examples
- [ ] Error code reference (for UI error handling)
- [ ] Rate limit headers documented
- [ ] Authentication flow documented (JWT flow)
- [ ] Example agent heartbeat payload
- [ ] Approval context structure examples

---

## Troubleshooting Guide

### "Mission stuck in AWAITING_APPROVAL"
```
1. Check: SELECT * FROM approvals WHERE mission_id = ? ORDER BY requested_at;
2. Look for status = 'PENDING' and timeout_at < NOW()
3. If true: Run cron job OR manually expire approval
4. Verify: mission status should auto-update after approval expires
```

### "Agent reports heartbeat but shows offline"
```
1. Check: SELECT * FROM agents WHERE id = ? ORDER BY last_heartbeat DESC LIMIT 5;
2. Verify: last_heartbeat within heartbeat_interval_ms
3. Check: Agent.status = UNAVAILABLE (should be IDLE or RUNNING)
4. Fix: Manual status update (temporary) + investigate why heartbeat not recorded
```

### "WebSocket not receiving updates"
```
1. Check: Is client subscribed to correct mission/channel?
2. Check: Backend sending event? (query events table)
3. Check: Event routing correct? (verify event.mission_id matches subscription)
4. Check: Network: Any firewall blocking WS? (switch to polling)
```

### "Activity logs not searchable"
```
1. Check: Indexes exist? SELECT * FROM pg_indexes WHERE tablename = 'activity_logs';
2. Check: Query using indexed columns? (agent_id, mission_id, timestamp)
3. Check: Explain plan: EXPLAIN SELECT ... WHERE agent_id = ?;
4. Check: Table stats fresh? ANALYZE activity_logs;
```

---

## Questions for Herb Before Finalizing

1. **SLA Tolerance:** If approval times out, should we auto-fail the mission or escalate to human?
2. **Agent Availability:** If 1 of 3 assigned agents fails, should we auto-retry with remaining agents?
3. **Multi-Approval:** Can approvers be agents (e.g., "code-review-bot" approves before deploy)?
4. **Historical Data:** How long to keep activity logs? (7 days hot, then archive?)
5. **Approval Broadcast:** When approval requested, who should be notified? (email, in-app, webhook?)
6. **Cost Tracking:** Should we track cost per mission/agent? (for chargeback/analytics)
7. **Replay:** Do we need event replay capability? (for debugging failed missions)

---

**Created:** 2026-03-25  
**For:** Implementation Team + Davinci (Frontend)  
**Status:** Ready for Development
