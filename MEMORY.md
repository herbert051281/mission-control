# MEMORY.md - Long-Term Persistent Memory

This file compounds over time. Each entry is a durable fact about Herb's life, work, decisions, preferences, or constraints. Not session notes — curated wisdom.

Before answering questions about past decisions, preferences, projects, people, timelines, or commitments: search this file first (use memory_search). Don't rely on context window alone.

## Memory Format

```
## [DATE] -- [Topic] [tags]
[2-3 sentences max. What happened, why it matters, what was decided.]
```

Tags: [decision], [project], [person], [preference], [constraint], [number], [deadline]

---

## Memory Entries

### 2026-03-25 -- Setup & Configuration [decision] [preference]
Atlas configured with SOUL.md (response format, memory protocol, proactivity dial, CEO frame). MEMORY.md created for long-term persistence. Herb's voice: direct to the point, dry humor, efficiency obsessed. No phrase bans beyond defaults. Priorities locked: Data Analysis, Application Coding, Future Travels, 3D Printing.

### 2026-03-25 -- Location & Family Context [person] [preference] [CONFIRMED]
Herb is based in San Salvador, El Salvador (CST / UTC-6). Family: Cindy and Mía. Dogs: Rolly and Fiona. Metadata timestamp GMT+8 is incorrect — always use CST for cron/heartbeat scheduling. This context matters for timezone-aware briefings and personal integration (commute, 3D printing prep, dog needs, family dinner time).

### 2026-03-25 -- Memory Strategy: Direct File Read [decision] [system]
OpenAI embeddings rate-limited. Switching from memory_search to direct file reads with the `read` tool. Implications: manual searches but no API dependency. Will use memory_get for surgical snippets after manual context search.

### 2026-03-25 -- Agent Dispatch Matrix [decision] [system]
Nine specialized agents for different domains. Dispatch rules:

**DATA ANALYSIS & BI:**
- **Kepler (GPT 5.4):** Primary for data work. SQL optimization, Power BI dashboards, DAX troubleshooting, data modeling (Airespring/RSM). Always start here for analytics.
- **Einstein (GPT 5.4):** Predictive modeling, anomaly detection, statistical analysis, advanced data science when Kepler needs deeper ML work.
- **Gandalf (GPT 5.4):** BI architecture, reporting frameworks, Tableau design, data governance, PII safety.

**APPLICATION CODING:**
- **Iris (GPT 5.4):** Primary for building tools. Python, data pipelines, automation scripts, backend work.
- **Davinci (Claude Sonnet 4.5):** Frontend & UI design. Bambu Lab dashboards, web interfaces, visual design work.

**RESEARCH & STRATEGY:**
- **Newton (Claude Sonnet 4.5):** Market research, tech trends, intelligence synthesis, competitive analysis.
- **Legolas (Claude Haiku 3.5):** Project management, Peru trek logistics, timeline coordination, Airespring/RSM project planning.

**SYSTEM & SKILLS:**
- **Skillmaster (GPT 4o Mini):** Creating new OpenClaw skills, managing skill lifecycle, packaging automation.
- **Atlas (Claude Haiku 4.5):** Main session (current) for orchestration and direct conversation.

**Quick Decision Tree:**
1. "I need SQL/Power BI help" → **Kepler**
2. "I need to build something" → **Iris** (code) or **Davinci** (UI)
3. "I need forecasting/ML" → **Einstein**
4. "I need BI architecture" → **Gandalf**
5. "I need research/intel" → **Newton**
6. "I need project planning" → **Legolas**
7. "I need a new skill built" → **Skillmaster**

### 2026-03-25 -- Peru Trek Timeline [deadline] [project]
Aug 5-15, 2026. Herb prioritizes altitude prep (acclimatization) and max-coverage family logistics. This should be loaded as a major project in HEARTBEAT.md for countdowns and prep reminders.

### 2026-03-25 -- German Learning Target [constraint] [deadline]
Current level: A1/A2. Target: B1 conversational fluency by Aug 2026 (~5 months). Preferred method: correction mode + micro-drills in chat. This should drive German practice cron jobs.

### 2026-03-25 -- Atlas Persona Architecture [preference]
Two logic layers: (1) Analytical Craftsman — precise, dry, optimization-focused for 3D printing + data work. (2) Polyglot Strategist — efficient, formal, internationally-minded for German + travel. Context determines which layer activates.

---

### 2026-03-25 -- Mission Control Build: Full Stack Implementation [decision] [project] [system]
Herb initiated Mission Control build: Complete AI agent orchestration system with real-time web UI. Tech stack locked: Node.js + Express (backend), React 18 + TypeScript + Zustand (frontend), PostgreSQL (database), Docker (deployment). Superpowers workflow used: Brainstorm → Plan → Subagent-driven TDD execution. 47-task breakdown created. Phase 1-2 complete (17 tasks): backend fully production-ready with 30+ APIs, WebSocket real-time, JWT auth, Docker image. Phase 3 started: frontend foundation (React setup, Zustand store, API client, Layout, TopCommandBar). Remaining: 25 tasks (Phase 3 components, Phase 4 integration, Phase 5 deployment). Velocity: ~3 tasks/hour via parallel subagent dispatch. ETA: 1.5-2 weeks from start to full deployment. GitHub repo recommended for checkpointing if credit-limited.

### 2026-03-25 -- Tech Stack Final (Mission Control) [decision] [system]
**Backend:** Node.js 18 + Express.js + TypeScript | **Database:** PostgreSQL 15 (Docker) with 6 tables, 21 indexes, 4 partitions | **APIs:** 30+ RESTful endpoints (missions, agents, approvals, activities, skills, health, auth) | **Real-time:** Socket.io WebSocket with 9 event types | **Auth:** JWT with 24h expiry | **Testing:** Jest (unit/integration/E2E) | **Frontend:** React 18 + TypeScript + Zustand + Tailwind CSS + Axios | **Deployment:** Docker Compose (dev), multi-stage Docker (prod), Hostinger VPS target.

### 2026-03-25 -- Build Phases & Task Breakdown [project] [system]
**Phase 1: Backend Foundation (10 tasks - COMPLETE)**
1.1 Project setup | 1.2 Types/interfaces | 1.3 DB connection | 1.4 Schema DDL | 1.5 Agents API | 1.6 Agent status | 1.7 Missions CRUD | 1.8 Approvals | 1.9 Activity logging | 1.10 System health

**Phase 2: Backend Real-Time & Polish (7 tasks - COMPLETE)**
2.1 WebSocket setup | 2.2 9 WebSocket events | 2.3 Skills API | 2.4 Error handling | 2.5 Auth middleware | 2.6 Full integration test | 2.7 Docker backend

**Phase 3: Frontend Components & Real-Time (15 tasks - IN PROGRESS)**
3.1 React setup (COMPLETE) | 3.2 Zustand store (IN PROGRESS) | 3.3 API client (COMPLETE) | 3.4 Layout shell (IN PROGRESS) | 3.5 TopCommandBar (COMPLETE) | 3.6-3.10 LeftNav, MissionBoard, AgentGrid, ActivityFeed, ApprovalsPanel | 3.11-3.15 Hooks (useStore, useAsync, useWebSocket, etc.), Modals, StatusBadges, E2E tests

**Phase 4: Integration & Deployment (6 tasks)**
4.1 Docker Compose (full stack) | 4.2 CI/CD setup | 4.3 VPS deployment | 4.4 Monitoring | 4.5 Documentation | 4.6 Final verification

**Phase 5: Optimization (4 tasks)**
5.1 Performance tuning | 5.2 Bundle optimization | 5.3 Caching strategy | 5.4 Security audit

---

## LESSONS — Mistakes & Corrections (Compounding Knowledge)

This section captures mistakes caught and corrected. Each lesson is searchable by domain. Review monthly for patterns.

### Format for Lessons:
```
### [DATE] -- [Mistake Type] [tags]
**What I got wrong:** [specific error]
**Why it happened:** [root cause]
**How to avoid it:** [rule or check]
**When to apply:** [situations where this matters]
```

### Lesson Log:

### 2026-03-25 -- Model Name Mismatch in Agent Config [lesson] [system] [config]
**What I got wrong:** Did not validate agent model names against available models in openclaw.json when listing agents.
**Why it happened:** Assumed all configured model names were valid without cross-referencing the models section.
**How to avoid it:** When listing agents, always verify each agent's model exists in agents.defaults.models. Flag mismatches immediately.
**When to apply:** Any time reviewing agent config, during agent audits, or when troubleshooting compaction errors.

### 2026-03-25 -- Parallel Subagent Dispatch (5-task max) [lesson] [system] [process]
**What I got right:** OpenClaw has 5-task child limit; learned to batch optimally and queue remaining tasks. Keeps execution efficient.
**How to apply:** Always batch first 5 tasks, wait for fastest completion (usually 1-2 min), then queue next batch. Avoid single-task dispatch for massive builds.
**When to apply:** Any large sprint with 20+ tasks; use parallel execution for 3x speedup.

---

## Search by Tag
- **[decision]**: Configuration choices, commitments made
- **[project]**: Active work (Peru trek, German learning, Bambu Lab goals, Mission Control build)
- **[person]**: Key people in Herb's world (team, stakeholders, family)
- **[preference]**: How Herb likes things done (response style, working style, communication)
- **[constraint]**: Limitations or blockers (time, skill gaps, dependencies)
- **[deadline]**: Hard dates and time-bound goals
- **[number]**: Figures (DAX level 7/10, German A1/A2, trek Aug 5-15, 47-task build)
- **[system]**: Technical systems, architectures, processes
