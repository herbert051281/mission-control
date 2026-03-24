# Quick Start - Mission Control Backend

## 🚀 Get Database Running (30 seconds)

```bash
cd backend

# 1. Start PostgreSQL
docker-compose up -d postgres

# Wait for it to be ready (~5-10 seconds)
docker-compose exec postgres pg_isready

# 2. Run migrations
npm run migrate

# 3. Run tests
npm test -- schema.test.ts
```

## ✅ Expected Output

```
✅ All migrations completed successfully
✅ Tests: 30 passed, 30 total
✅ Database ready with 6 tables, 7 enums, 21 indexes
```

## 📊 Schema Summary

| Table | Rows | Indexes | Key Purpose |
|-------|------|---------|------------|
| agents | - | 2 | Track AI agents and their status |
| missions | - | 4 | Store mission intake and routing |
| activity_logs | - | 3 | Log all agent actions (partitioned by month) |
| approvals | - | 3 | Track approval workflows |
| skills | - | 3 | Inventory agent skills and versions |
| system_health | - | 1 | Monitor queue depth and availability |

## 📁 Files Created (Task 1.4)

```
backend/
├── src/db/migrations/
│   ├── 001-init-schema.sql       ← Complete PostgreSQL DDL
│   └── index.ts                  ← Migration runner (npm run migrate)
├── src/__tests__/
│   └── schema.test.ts            ← 30+ schema tests (npm test)
├── docker-compose.yml            ← PostgreSQL container
├── SCHEMA_SETUP.md               ← Full documentation
├── TASK_1_4_SUMMARY.md           ← Detailed completion report
└── QUICK_START.md                ← This file
```

## 🛠️ Common Commands

```bash
# Development
npm run dev                    # Start server (requires DB)
npm run build                  # Build TypeScript
npm test                       # Run all tests
npm test -- schema.test.ts     # Run schema tests only
npm test -- --watch            # Watch mode

# Database
npm run migrate                # Apply schema migrations
docker-compose up -d postgres  # Start DB container
docker-compose down            # Stop DB container
docker-compose logs postgres   # View DB logs
```

## 🔍 Verify Schema with psql

```bash
# Connect to database
psql -U postgres -d mission_control

# List tables
\dt

# List indexes
\di

# List enums
SELECT * FROM pg_type WHERE typtype = 'e';

# Check activity_logs partitions
SELECT tablename FROM pg_tables WHERE tablename LIKE 'activity_logs%';
```

## 📝 Next: Task 1.5 - Agent Registry API

Once schema is set up, create:
- `GET /agents` — List all agents
- `GET /agents/:id` — Get agent details
- `POST /agents` — Create new agent
- `PATCH /agents/:id` — Update agent
- `DELETE /agents/:id` — Delete agent

## ⚠️ Troubleshooting

**"connect ECONNREFUSED"**
→ PostgreSQL not running: `docker-compose up -d postgres`

**"database mission_control does not exist"**
→ Created automatically by docker-compose. If not: `docker-compose restart postgres`

**Tests fail with "type already exists"**
→ Normal on re-runs. Drop & recreate: 
```bash
docker-compose exec postgres dropdb -U postgres mission_control
docker-compose exec postgres createdb -U postgres mission_control
npm run migrate
```

## 📚 Full Documentation

See `SCHEMA_SETUP.md` for comprehensive documentation including:
- Complete schema specifications
- 3 different setup approaches
- Test coverage details
- Performance notes on partitioning
- Detailed troubleshooting guide
