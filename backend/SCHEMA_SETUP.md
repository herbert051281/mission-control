# Mission Control Database Schema Setup

## Overview
This document describes the PostgreSQL schema for Mission Control (Task 1.4).

**Schema Files:**
- `/backend/src/db/migrations/001-init-schema.sql` — Complete DDL with 7 enums, 6 tables, indexes, and partitioning
- `/backend/src/db/migrations/index.ts` — Migration runner for executing SQL files
- `/backend/src/__tests__/schema.test.ts` — 30+ tests covering schema creation, constraints, and sample data

## Schema Components

### 1. Enums (7 total)
- `agent_status` — idle, running, waiting, completed, failed
- `mission_status` — intake, routed, in_progress, review, awaiting_approval, completed, failed
- `mission_priority` — low, medium, high, critical
- `activity_status` — initiated, in_progress, completed, failed
- `approval_type` — production, destructive, external, integration, skill
- `approval_status` — pending, approved, denied
- `deployment_state` — development, staging, production

### 2. Tables (6 total)

#### agents
- `id` UUID (PK, gen_random_uuid)
- `name` VARCHAR(255) NOT NULL
- `role` VARCHAR(255) NOT NULL
- `model` VARCHAR(255) NOT NULL
- `status` agent_status DEFAULT 'idle'
- `current_task` JSONB
- `last_completed_task` JSONB
- `last_updated` TIMESTAMP WITH TIME ZONE
- `created_at` TIMESTAMP WITH TIME ZONE
- **Indexes:** idx_agents_status, idx_agents_last_updated

#### missions
- `id` UUID (PK)
- `title` VARCHAR(255) NOT NULL
- `category` VARCHAR(255) NOT NULL
- `status` mission_status DEFAULT 'intake'
- `priority` mission_priority DEFAULT 'medium'
- `approval_required` BOOLEAN DEFAULT FALSE
- `summary` TEXT
- `details` JSONB
- `assigned_agents` UUID[] (array of agent IDs)
- `created_at` TIMESTAMP WITH TIME ZONE
- `updated_at` TIMESTAMP WITH TIME ZONE
- **Indexes:** idx_missions_status, idx_missions_priority, idx_missions_created_at, idx_missions_assigned_agents (GIN)

#### activity_logs (PARTITIONED by RANGE on timestamp)
- `id` UUID
- `timestamp` TIMESTAMP WITH TIME ZONE (partition key)
- `agent` VARCHAR(255)
- `action` VARCHAR(255)
- `target` VARCHAR(255)
- `status` activity_status DEFAULT 'initiated'
- `details` JSONB
- **Partitions:**
  - activity_logs_2026_03 (2026-03-01 to 2026-04-01)
  - activity_logs_2026_04 (2026-04-01 to 2026-05-01)
  - activity_logs_2026_05 (2026-05-01 to 2026-06-01)
  - activity_logs_2026_06 (2026-06-01 to 2026-07-01)
- **Indexes:** idx_activity_agent, idx_activity_action, idx_activity_target

#### approvals
- `id` UUID (PK)
- `mission_id` UUID NOT NULL (FK → missions.id)
- `type` approval_type NOT NULL
- `requested_by` VARCHAR(255) NOT NULL
- `status` approval_status DEFAULT 'pending'
- `requested_at` TIMESTAMP WITH TIME ZONE
- `resolved_at` TIMESTAMP WITH TIME ZONE
- `resolver` VARCHAR(255)
- `details` JSONB
- **Indexes:** idx_approvals_mission, idx_approvals_status, idx_approvals_requested_at

#### skills
- `id` UUID (PK)
- `name` VARCHAR(255) NOT NULL
- `version` VARCHAR(50) NOT NULL
- `owner` VARCHAR(255) NOT NULL
- `deployment_state` deployment_state DEFAULT 'development'
- `updated_at` TIMESTAMP WITH TIME ZONE
- `created_at` TIMESTAMP WITH TIME ZONE
- **Constraints:** UNIQUE(name, version)
- **Indexes:** idx_skills_owner, idx_skills_deployment_state, idx_skills_name_version (unique)

#### system_health
- `id` UUID (PK)
- `agent_availability` JSONB DEFAULT '{}'
- `queue_depth` INTEGER DEFAULT 0
- `last_heartbeat` TIMESTAMP WITH TIME ZONE
- `active_missions_count` INTEGER DEFAULT 0
- `recorded_at` TIMESTAMP WITH TIME ZONE
- **Indexes:** idx_system_health_recorded_at

## Setup Instructions

### Option 1: Using Docker (Recommended)

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Wait for database to be ready
docker-compose exec postgres pg_isready -U postgres

# Run migrations
npm run migrate

# Run tests
npm test -- schema.test.ts
```

### Option 2: Using Local PostgreSQL

```bash
# Create database
psql -U postgres -c "CREATE DATABASE mission_control;"

# Set DATABASE_URL in .env
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mission_control"

# Run migrations
npm run migrate

# Run tests
npm test -- schema.test.ts
```

### Option 3: Using psql Directly

```bash
# Apply schema directly
psql -U postgres -d mission_control -f src/db/migrations/001-init-schema.sql

# Verify schema
psql -U postgres -d mission_control -c "\dt"     # Tables
psql -U postgres -d mission_control -c "\di"     # Indexes
psql -U postgres -d mission_control -c "SELECT * FROM pg_type WHERE typtype = 'e';" # Enums
```

## Test Coverage

The test suite (`schema.test.ts`) includes 30+ tests covering:

1. **Enum Tests (7)** — Verify all enum values exist
2. **Table Existence Tests (6)** — Confirm all tables created
3. **Index Tests (6)** — Verify all indexes created
4. **Partition Tests (1)** — Confirm activity_logs partitions exist
5. **Data Insert Tests (6)** — Test inserting sample data into each table
6. **Constraint Tests (2)** — Test FK and UNIQUE constraints
7. **Default Value Tests (2)** — Verify column defaults work

### Running Tests

```bash
# Run schema tests only
npm test -- schema.test.ts

# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## Next Steps

After schema setup is complete:

1. **Task 1.5:** Implement Agent Registry API (endpoints for agent CRUD)
2. **Task 1.6:** Implement Mission Management API
3. **Task 1.7:** Implement Approvals System API
4. **Task 1.8:** Implement Activity Logging Service

## Verification Checklist

- [ ] PostgreSQL running on localhost:5432
- [ ] Database `mission_control` exists
- [ ] All migrations applied (001-init-schema.sql)
- [ ] Schema tests pass: `npm test -- schema.test.ts`
- [ ] All 6 tables exist in database
- [ ] All 7 enums created
- [ ] Activity logs partitioned by month
- [ ] Foreign key constraint on approvals → missions
- [ ] All indexes created

## Troubleshooting

**Database connection refused:**
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Start PostgreSQL with Docker
docker-compose up -d postgres
```

**Migration already exists error:**
The migration runner is idempotent and will skip if schema already exists. To reset:
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS mission_control; CREATE DATABASE mission_control;"
```

**Enum already exists:**
If running migrations multiple times, you may see "type already exists" errors. This is normal and expected (idempotent).

## Performance Notes

- Activity logs are **partitioned by month** for efficient querying and maintenance
- Indexes on all common filter columns (status, priority, timestamp, agent)
- GIN index on `assigned_agents` array for fast agent lookups
- Unique constraint on `(skills.name, skills.version)` for version control
