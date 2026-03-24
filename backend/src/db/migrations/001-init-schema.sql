-- Mission Control Database Schema
-- Created for Task 1.4: Database Schema (DDL)
-- All 6 tables, enums, indexes, and partitioning

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

-- Agent status enum
CREATE TYPE agent_status AS ENUM ('idle', 'running', 'waiting', 'completed', 'failed');

-- Mission status enum
CREATE TYPE mission_status AS ENUM ('intake', 'routed', 'in_progress', 'review', 'awaiting_approval', 'completed', 'failed');

-- Mission priority enum
CREATE TYPE mission_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Activity status enum
CREATE TYPE activity_status AS ENUM ('initiated', 'in_progress', 'completed', 'failed');

-- Approval type enum
CREATE TYPE approval_type AS ENUM ('production', 'destructive', 'external', 'integration', 'skill');

-- Approval status enum
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'denied');

-- Deployment state enum
CREATE TYPE deployment_state AS ENUM ('development', 'staging', 'production');

-- ============================================================================
-- 2. AGENTS TABLE
-- ============================================================================

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  status agent_status NOT NULL DEFAULT 'idle',
  current_task JSONB,
  last_completed_task JSONB,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_last_updated ON agents(last_updated DESC);

-- ============================================================================
-- 3. MISSIONS TABLE
-- ============================================================================

CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  status mission_status NOT NULL DEFAULT 'intake',
  priority mission_priority NOT NULL DEFAULT 'medium',
  approval_required BOOLEAN NOT NULL DEFAULT FALSE,
  summary TEXT,
  details JSONB,
  assigned_agents UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_priority ON missions(priority);
CREATE INDEX idx_missions_created_at ON missions(created_at DESC);
CREATE INDEX idx_missions_assigned_agents ON missions USING GIN(assigned_agents);

-- ============================================================================
-- 4. ACTIVITY LOGS TABLE (PARTITIONED BY MONTH)
-- ============================================================================

CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  agent VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  target VARCHAR(255),
  status activity_status NOT NULL DEFAULT 'initiated',
  details JSONB,
  PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Partitions for current and next 3 months
CREATE TABLE activity_logs_2026_03 PARTITION OF activity_logs
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE activity_logs_2026_04 PARTITION OF activity_logs
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE activity_logs_2026_05 PARTITION OF activity_logs
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE activity_logs_2026_06 PARTITION OF activity_logs
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE INDEX idx_activity_agent ON activity_logs(agent);
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_target ON activity_logs(target);

-- ============================================================================
-- 5. APPROVALS TABLE
-- ============================================================================

CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id),
  type approval_type NOT NULL,
  requested_by VARCHAR(255) NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolver VARCHAR(255),
  details JSONB
);

CREATE INDEX idx_approvals_mission ON approvals(mission_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_requested_at ON approvals(requested_at DESC);

-- ============================================================================
-- 6. SKILLS TABLE
-- ============================================================================

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  owner VARCHAR(255) NOT NULL,
  deployment_state deployment_state NOT NULL DEFAULT 'development',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_owner ON skills(owner);
CREATE INDEX idx_skills_deployment_state ON skills(deployment_state);
CREATE UNIQUE INDEX idx_skills_name_version ON skills(name, version);

-- ============================================================================
-- 7. SYSTEM HEALTH TABLE
-- ============================================================================

CREATE TABLE system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_availability JSONB NOT NULL DEFAULT '{}',
  queue_depth INTEGER NOT NULL DEFAULT 0,
  last_heartbeat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  active_missions_count INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_health_recorded_at ON system_health(recorded_at DESC);
