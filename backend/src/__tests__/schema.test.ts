import pool, { closePool } from '../db/connection';
import { runMigrations } from '../db/migrations';

describe('Database Schema (Task 1.4)', () => {
  beforeAll(async () => {
    // Drop schema if exists (for test isolation)
    const client = await pool.connect();
    try {
      await client.query('DROP SCHEMA IF EXISTS public CASCADE');
      await client.query('CREATE SCHEMA public');
    } finally {
      client.release();
    }

    // Run migrations
    await runMigrations();
  });

  afterAll(async () => {
    await closePool();
  });

  // ========================================================================
  // 1. TEST ENUMS
  // ========================================================================

  test('should create agent_status enum with all values', async () => {
    const result = await pool.query(
      `SELECT enum_range(NULL::agent_status) AS statuses`
    );
    const statuses = result.rows[0].statuses;
    expect(statuses).toContain('idle');
    expect(statuses).toContain('running');
    expect(statuses).toContain('waiting');
    expect(statuses).toContain('completed');
    expect(statuses).toContain('failed');
  });

  test('should create mission_status enum with all values', async () => {
    const result = await pool.query(
      `SELECT enum_range(NULL::mission_status) AS statuses`
    );
    const statuses = result.rows[0].statuses;
    expect(statuses).toContain('intake');
    expect(statuses).toContain('routed');
    expect(statuses).toContain('in_progress');
    expect(statuses).toContain('review');
    expect(statuses).toContain('awaiting_approval');
    expect(statuses).toContain('completed');
    expect(statuses).toContain('failed');
  });

  test('should create mission_priority enum with all values', async () => {
    const result = await pool.query(
      `SELECT enum_range(NULL::mission_priority) AS priorities`
    );
    const priorities = result.rows[0].priorities;
    expect(priorities).toContain('low');
    expect(priorities).toContain('medium');
    expect(priorities).toContain('high');
    expect(priorities).toContain('critical');
  });

  test('should create activity_status enum with all values', async () => {
    const result = await pool.query(
      `SELECT enum_range(NULL::activity_status) AS statuses`
    );
    const statuses = result.rows[0].statuses;
    expect(statuses).toContain('initiated');
    expect(statuses).toContain('in_progress');
    expect(statuses).toContain('completed');
    expect(statuses).toContain('failed');
  });

  test('should create approval_type enum with all values', async () => {
    const result = await pool.query(
      `SELECT enum_range(NULL::approval_type) AS types`
    );
    const types = result.rows[0].types;
    expect(types).toContain('production');
    expect(types).toContain('destructive');
    expect(types).toContain('external');
    expect(types).toContain('integration');
    expect(types).toContain('skill');
  });

  test('should create approval_status enum with all values', async () => {
    const result = await pool.query(
      `SELECT enum_range(NULL::approval_status) AS statuses`
    );
    const statuses = result.rows[0].statuses;
    expect(statuses).toContain('pending');
    expect(statuses).toContain('approved');
    expect(statuses).toContain('denied');
  });

  test('should create deployment_state enum with all values', async () => {
    const result = await pool.query(
      `SELECT enum_range(NULL::deployment_state) AS states`
    );
    const states = result.rows[0].states;
    expect(states).toContain('development');
    expect(states).toContain('staging');
    expect(states).toContain('production');
  });

  // ========================================================================
  // 2. TEST TABLES EXIST
  // ========================================================================

  test('should create agents table', async () => {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agents'
      ) AS exists`
    );
    expect(result.rows[0].exists).toBe(true);
  });

  test('should create missions table', async () => {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'missions'
      ) AS exists`
    );
    expect(result.rows[0].exists).toBe(true);
  });

  test('should create activity_logs table', async () => {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'activity_logs'
      ) AS exists`
    );
    expect(result.rows[0].exists).toBe(true);
  });

  test('should create approvals table', async () => {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'approvals'
      ) AS exists`
    );
    expect(result.rows[0].exists).toBe(true);
  });

  test('should create skills table', async () => {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'skills'
      ) AS exists`
    );
    expect(result.rows[0].exists).toBe(true);
  });

  test('should create system_health table', async () => {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'system_health'
      ) AS exists`
    );
    expect(result.rows[0].exists).toBe(true);
  });

  // ========================================================================
  // 3. TEST INDEXES
  // ========================================================================

  test('should create all agents indexes', async () => {
    const result = await pool.query(
      `SELECT indexname FROM pg_indexes 
       WHERE tablename = 'agents' AND schemaname = 'public'`
    );
    const indexNames = result.rows.map((r) => r.indexname);
    expect(indexNames).toContain('idx_agents_status');
    expect(indexNames).toContain('idx_agents_last_updated');
  });

  test('should create all missions indexes', async () => {
    const result = await pool.query(
      `SELECT indexname FROM pg_indexes 
       WHERE tablename = 'missions' AND schemaname = 'public'`
    );
    const indexNames = result.rows.map((r) => r.indexname);
    expect(indexNames).toContain('idx_missions_status');
    expect(indexNames).toContain('idx_missions_priority');
    expect(indexNames).toContain('idx_missions_created_at');
    expect(indexNames).toContain('idx_missions_assigned_agents');
  });

  test('should create all activity_logs indexes', async () => {
    const result = await pool.query(
      `SELECT indexname FROM pg_indexes 
       WHERE tablename = 'activity_logs' OR tablename LIKE 'activity_logs_%'`
    );
    const indexNames = result.rows.map((r) => r.indexname);
    expect(indexNames.length).toBeGreaterThan(0);
  });

  test('should create all approvals indexes', async () => {
    const result = await pool.query(
      `SELECT indexname FROM pg_indexes 
       WHERE tablename = 'approvals' AND schemaname = 'public'`
    );
    const indexNames = result.rows.map((r) => r.indexname);
    expect(indexNames).toContain('idx_approvals_mission');
    expect(indexNames).toContain('idx_approvals_status');
    expect(indexNames).toContain('idx_approvals_requested_at');
  });

  test('should create all skills indexes', async () => {
    const result = await pool.query(
      `SELECT indexname FROM pg_indexes 
       WHERE tablename = 'skills' AND schemaname = 'public'`
    );
    const indexNames = result.rows.map((r) => r.indexname);
    expect(indexNames).toContain('idx_skills_owner');
    expect(indexNames).toContain('idx_skills_deployment_state');
    expect(indexNames).toContain('idx_skills_name_version');
  });

  test('should create system_health index', async () => {
    const result = await pool.query(
      `SELECT indexname FROM pg_indexes 
       WHERE tablename = 'system_health' AND schemaname = 'public'`
    );
    const indexNames = result.rows.map((r) => r.indexname);
    expect(indexNames).toContain('idx_system_health_recorded_at');
  });

  // ========================================================================
  // 4. TEST PARTITIONS
  // ========================================================================

  test('should create activity_logs partitions', async () => {
    const result = await pool.query(
      `SELECT tablename FROM pg_tables 
       WHERE tablename LIKE 'activity_logs_%' AND schemaname = 'public'`
    );
    const partitions = result.rows.map((r) => r.tablename);
    expect(partitions).toContain('activity_logs_2026_03');
    expect(partitions).toContain('activity_logs_2026_04');
    expect(partitions).toContain('activity_logs_2026_05');
    expect(partitions).toContain('activity_logs_2026_06');
  });

  // ========================================================================
  // 5. TEST INSERT SAMPLE DATA
  // ========================================================================

  test('should insert sample data into agents table', async () => {
    const result = await pool.query(
      `INSERT INTO agents (name, role, model, status)
       VALUES ('Agent-1', 'executor', 'claude-3-haiku', 'idle')
       RETURNING id, name`
    );
    expect(result.rows[0]).toHaveProperty('id');
    expect(result.rows[0].name).toBe('Agent-1');
  });

  test('should insert sample data into missions table', async () => {
    const result = await pool.query(
      `INSERT INTO missions (title, category, status, priority)
       VALUES ('Test Mission', 'data_analysis', 'intake', 'high')
       RETURNING id, title`
    );
    expect(result.rows[0]).toHaveProperty('id');
    expect(result.rows[0].title).toBe('Test Mission');
  });

  test('should insert sample data into activity_logs table', async () => {
    const result = await pool.query(
      `INSERT INTO activity_logs (timestamp, agent, action, target, status)
       VALUES (NOW(), 'Agent-1', 'execute_task', 'mission-1', 'in_progress')
       RETURNING id, agent`
    );
    expect(result.rows[0]).toHaveProperty('id');
    expect(result.rows[0].agent).toBe('Agent-1');
  });

  test('should insert sample data into approvals table', async () => {
    const mission = await pool.query(
      `SELECT id FROM missions LIMIT 1`
    );
    const missionId = mission.rows[0].id;

    const result = await pool.query(
      `INSERT INTO approvals (mission_id, type, requested_by, status)
       VALUES ($1, 'production', 'admin', 'pending')
       RETURNING id, type`,
      [missionId]
    );
    expect(result.rows[0]).toHaveProperty('id');
    expect(result.rows[0].type).toBe('production');
  });

  test('should insert sample data into skills table', async () => {
    const result = await pool.query(
      `INSERT INTO skills (name, version, owner, deployment_state)
       VALUES ('test-skill', '1.0.0', 'owner-1', 'development')
       RETURNING id, name, version`
    );
    expect(result.rows[0]).toHaveProperty('id');
    expect(result.rows[0].name).toBe('test-skill');
    expect(result.rows[0].version).toBe('1.0.0');
  });

  test('should insert sample data into system_health table', async () => {
    const result = await pool.query(
      `INSERT INTO system_health (agent_availability, queue_depth, active_missions_count)
       VALUES ('{"available": 5}', 10, 3)
       RETURNING id, queue_depth`
    );
    expect(result.rows[0]).toHaveProperty('id');
    expect(result.rows[0].queue_depth).toBe(10);
  });

  // ========================================================================
  // 6. TEST CONSTRAINTS
  // ========================================================================

  test('should enforce foreign key constraint on approvals', async () => {
    await expect(
      pool.query(
        `INSERT INTO approvals (mission_id, type, requested_by, status)
         VALUES ('00000000-0000-0000-0000-000000000000', 'production', 'admin', 'pending')`
      )
    ).rejects.toThrow();
  });

  test('should enforce unique constraint on skills (name, version)', async () => {
    await pool.query(
      `INSERT INTO skills (name, version, owner, deployment_state)
       VALUES ('unique-skill', '1.0.0', 'owner-1', 'development')`
    );

    await expect(
      pool.query(
        `INSERT INTO skills (name, version, owner, deployment_state)
         VALUES ('unique-skill', '1.0.0', 'owner-2', 'staging')`
      )
    ).rejects.toThrow();
  });

  // ========================================================================
  // 7. TEST DEFAULT VALUES
  // ========================================================================

  test('should use default values for agent status', async () => {
    const result = await pool.query(
      `INSERT INTO agents (name, role, model)
       VALUES ('Agent-Default', 'executor', 'claude-3')
       RETURNING status`
    );
    expect(result.rows[0].status).toBe('idle');
  });

  test('should use default values for mission status', async () => {
    const result = await pool.query(
      `INSERT INTO missions (title, category)
       VALUES ('Default Mission', 'test')
       RETURNING status, priority`
    );
    expect(result.rows[0].status).toBe('intake');
    expect(result.rows[0].priority).toBe('medium');
  });
});
