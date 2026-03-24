import request from 'supertest';
import express, { Express } from 'express';
import { errorHandler } from '../middleware/errorHandler';

// Mock the database connection BEFORE importing handlers
jest.mock('../db/connection', () => ({
  query: jest.fn(),
  connectDB: jest.fn(),
  closePool: jest.fn(),
}));

// Import handlers AFTER mocking
import { query } from '../db/connection';
import {
  createMission,
  getMissions,
  getMissionById,
  updateMissionStatus,
} from '../handlers/missionHandler';
import { updateAgentStatus } from '../handlers/agentHandler';
import {
  createApproval,
  getApprovals,
  approveApproval,
} from '../handlers/approvalHandler';
import { getActivities } from '../handlers/activityHandler';
import { getSystemHealth } from '../handlers/healthHandler';

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('Full System Integration', () => {
  jest.setTimeout(30000);
  let server: any;
  let app: Express;

  beforeAll((done) => {
    // Create Express app with all routes
    app = express();
    app.use(express.json());

    // Mount all handlers
    app.post('/api/missions', createMission);
    app.get('/api/missions', getMissions);
    app.get('/api/missions/:id', getMissionById);
    app.patch('/api/missions/:id', updateMissionStatus);

    app.post('/api/agents/:id/status', updateAgentStatus);

    app.post('/api/approvals', createApproval);
    app.get('/api/approvals', getApprovals);
    app.post('/api/approvals/:id/approve', approveApproval);

    app.get('/api/activities', getActivities);
    app.get('/api/health/system', getSystemHealth);

    // Error handler must be last
    app.use(errorHandler);

    server = app.listen(3003, done);
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('Complete mission workflow: create → assign → approve → complete', async () => {
    const missionId = 'mission-123';
    const agentId = 'agent-456';

    // 1. Create mission - mock successful response
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: missionId,
          title: 'Build Dashboard',
          category: 'BI',
          summary: 'Create new analytics dashboard',
          priority: 'high',
          approval_required: true,
          status: 'intake',
          created_at: new Date(),
          assigned_agents: [],
        },
      ],
      rowCount: 1,
    } as any);

    const missionResponse = await request(app)
      .post('/api/missions')
      .send({
        title: 'Build Dashboard',
        category: 'BI',
        summary: 'Create new analytics dashboard',
        priority: 'high',
        approval_required: true,
      });
    expect(missionResponse.status).toBe(201);
    expect(missionResponse.body.id).toBe(missionId);
    expect(missionResponse.body.status).toBe('intake');

    // 2. Verify mission in pipeline
    // getMissions makes TWO queries: one to get missions, one to count
    mockQuery.mockResolvedValueOnce({
      rows: [missionResponse.body],
      rowCount: 1,
    } as any);
    mockQuery.mockResolvedValueOnce({
      rows: [{ count: 1 }],
      rowCount: 1,
    } as any);

    const listResponse = await request(app).get('/api/missions?status=intake');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.missions).toContainEqual(
      expect.objectContaining({ id: missionId })
    );

    // 4. Assign agents to mission
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          ...missionResponse.body,
          status: 'routed',
          assigned_agents: [agentId],
        },
      ],
      rowCount: 1,
    } as any);

    const assignResponse = await request(app)
      .patch(`/api/missions/${missionId}`)
      .send({
        status: 'routed',
        assigned_agents: [agentId],
      });
    expect(assignResponse.status).toBe(200);
    expect(assignResponse.body.assigned_agents).toContain(agentId);
    expect(assignResponse.body.status).toBe('routed');

    // 5. Create approval
    const approvalId = 'approval-789';
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: approvalId,
          mission_id: missionId,
          type: 'production',
          requested_by: agentId,
          status: 'pending',
          requested_at: new Date(),
          resolved_at: null,
          resolver: null,
          details: {},
        },
      ],
      rowCount: 1,
    } as any);

    const approvalResponse = await request(app)
      .post('/api/approvals')
      .send({
        mission_id: missionId,
        type: 'production',
        requested_by: agentId,
      });
    expect(approvalResponse.status).toBe(201);
    expect(approvalResponse.body.id).toBe(approvalId);
    expect(approvalResponse.body.status).toBe('pending');

    // 6. Approve
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          ...approvalResponse.body,
          status: 'approved',
          resolved_at: new Date(),
          resolver: agentId,
        },
      ],
      rowCount: 1,
    } as any);

    const approveResponse = await request(app)
      .post(`/api/approvals/${approvalId}/approve`)
      .send({ resolver: agentId });
    expect(approveResponse.status).toBe(200);
    expect(approveResponse.body.status).toBe('approved');

    // 7. Update agent status
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: agentId,
          name: 'test-agent',
          role: 'Test',
          model: 'GPT-4',
          status: 'running',
          current_task: null,
          last_completed_task: null,
          last_updated: new Date(),
        },
      ],
      rowCount: 1,
    } as any);

    const statusUpdateResponse = await request(app)
      .post(`/api/agents/${agentId}/status`)
      .send({ status: 'running' });
    expect(statusUpdateResponse.status).toBe(200);
    expect(statusUpdateResponse.body.status).toBe('running');

    // 8. Complete mission
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          ...assignResponse.body,
          status: 'completed',
        },
      ],
      rowCount: 1,
    } as any);

    const completeResponse = await request(app)
      .patch(`/api/missions/${missionId}`)
      .send({ status: 'completed' });
    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.status).toBe('completed');

    // 9. Verify activity log
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: '1', mission_id: missionId, action: 'created', timestamp: new Date() },
        { id: '2', mission_id: missionId, action: 'routed', timestamp: new Date() },
        { id: '3', mission_id: missionId, action: 'approved', timestamp: new Date() },
      ],
      rowCount: 3,
    } as any);

    const activitiesResponse = await request(app).get('/api/activities');
    expect(activitiesResponse.status).toBe(200);
    expect(activitiesResponse.body.activities.length).toBeGreaterThan(0);

    // 10. Check system health
    // getSystemHealth makes THREE queries: agents, active missions, pending approvals
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: agentId, name: 'test-agent', status: 'running' }
      ],
      rowCount: 1,
    } as any);
    mockQuery.mockResolvedValueOnce({
      rows: [{ count: 1 }],
      rowCount: 1,
    } as any);
    mockQuery.mockResolvedValueOnce({
      rows: [{ count: 0 }],
      rowCount: 1,
    } as any);

    const healthResponse = await request(app).get('/api/health/system');
    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body).toHaveProperty('agent_availability');
    expect(healthResponse.body).toHaveProperty('queue_depth');
    expect(healthResponse.body).toHaveProperty('active_missions_count');
  });

  test('Concurrent missions don\'t interfere', async () => {
    const mission1 = { id: 'mission-1', title: 'Mission 1', category: 'BI', priority: 'high', status: 'intake', assigned_agents: [], created_at: new Date(), summary: 'Test 1' };
    const mission2 = { id: 'mission-2', title: 'Mission 2', category: 'Coding', priority: 'medium', status: 'intake', assigned_agents: [], created_at: new Date(), summary: 'Test 2' };
    const mission3 = { id: 'mission-3', title: 'Mission 3', category: 'Research', priority: 'low', status: 'intake', assigned_agents: [], created_at: new Date(), summary: 'Test 3' };

    // Mock responses for concurrent mission creation
    mockQuery.mockResolvedValueOnce({ rows: [mission1], rowCount: 1 } as any);
    mockQuery.mockResolvedValueOnce({ rows: [mission2], rowCount: 1 } as any);
    mockQuery.mockResolvedValueOnce({ rows: [mission3], rowCount: 1 } as any);

    // Create 3 missions simultaneously
    const missions = await Promise.all([
      request(app).post('/api/missions').send({ title: 'Mission 1', category: 'BI', priority: 'high', summary: 'Test 1' }),
      request(app).post('/api/missions').send({ title: 'Mission 2', category: 'Coding', priority: 'medium', summary: 'Test 2' }),
      request(app).post('/api/missions').send({ title: 'Mission 3', category: 'Research', priority: 'low', summary: 'Test 3' }),
    ]);

    // Verify all responses are 201
    missions.forEach((m) => {
      expect(m.status).toBe(201);
    });

    expect(missions.map(m => m.body.id)).toHaveLength(3);

    // Verify all 3 in database
    // getMissions makes TWO queries
    mockQuery.mockResolvedValueOnce({
      rows: [mission1, mission2, mission3],
      rowCount: 3,
    } as any);
    mockQuery.mockResolvedValueOnce({
      rows: [{ count: 3 }],
      rowCount: 1,
    } as any);

    const listResponse = await request(app).get('/api/missions');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.total).toBe(3);
  });

  test('Error handling throughout workflow', async () => {
    // Try invalid mission - handler should validate required fields
    const invalidResponse = await request(app)
      .post('/api/missions')
      .send({ title: 'Test' }); // Missing required fields
    expect(invalidResponse.status).toBeGreaterThanOrEqual(400);

    // Try missing mission with PATCH
    mockQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    } as any);

    const missingMissionResponse = await request(app)
      .patch('/api/missions/non-existent-id')
      .send({ status: 'completed' });
    expect(missingMissionResponse.status).toBe(404);
  });
});
