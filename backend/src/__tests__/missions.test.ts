import http from 'http';
import express, { Express } from 'express';
import { query } from '../db/connection';
import {
  createMission,
  getMissions,
  getMissionById,
  updateMissionStatus
} from '../handlers/missionHandler';

// Mock the database connection
jest.mock('../db/connection', () => ({
  query: jest.fn(),
  connectDB: jest.fn(),
  closePool: jest.fn(),
}));

describe('Mission CRUD API', () => {
  jest.setTimeout(15000);
  let server: any;
  let app: Express;

  beforeAll((done) => {
    // Create Express app with mission routes
    app = express();
    app.use(express.json());

    app.post('/api/missions', createMission);
    app.get('/api/missions', getMissions);
    app.get('/api/missions/:id', getMissionById);
    app.patch('/api/missions/:id', updateMissionStatus);

    server = app.listen(3002, done);
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  // ============================================================================
  // POST /api/missions - Create Mission
  // ============================================================================

  describe('POST /api/missions', () => {
    it('should create a new mission with status "intake"', (done) => {
      const missionData = {
        title: 'Build Dashboard',
        category: 'BI',
        summary: 'Create new analytics dashboard',
        priority: 'high',
      };

      const mockMission = {
        id: 'mission-1',
        title: 'Build Dashboard',
        category: 'BI',
        summary: 'Create new analytics dashboard',
        priority: 'high',
        status: 'intake',
        approval_required: false,
        assigned_agents: [],
        details: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockMission],
        rowCount: 1,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3002,
          path: '/api/missions',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(201);
              expect(response.title).toBe('Build Dashboard');
              expect(response.status).toBe('intake');
              expect(response.priority).toBe('high');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });

      request.write(JSON.stringify(missionData));
      request.end();
    });

    it('should set default priority to "medium"', (done) => {
      const missionData = {
        title: 'Update API',
        category: 'Dev',
        summary: 'Update REST API endpoints',
      };

      const mockMission = {
        id: 'mission-2',
        title: 'Update API',
        category: 'Dev',
        summary: 'Update REST API endpoints',
        priority: 'medium',
        status: 'intake',
        approval_required: false,
        assigned_agents: [],
        details: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockMission],
        rowCount: 1,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3002,
          path: '/api/missions',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(201);
              expect(response.priority).toBe('medium');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });

      request.write(JSON.stringify(missionData));
      request.end();
    });

    it('should reject mission without required fields', (done) => {
      const missionData = {
        title: 'Incomplete Mission',
        // missing category and summary
      };

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3002,
          path: '/api/missions',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(400);
              expect(response.error).toContain('required fields');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });

      request.write(JSON.stringify(missionData));
      request.end();
    });
  });

  // ============================================================================
  // GET /api/missions - List All Missions
  // ============================================================================

  describe('GET /api/missions', () => {
    it('should return all missions with pagination', (done) => {
      const mockMissions = [
        {
          id: 'mission-1',
          title: 'Build Dashboard',
          category: 'BI',
          summary: 'Create new analytics dashboard',
          priority: 'high',
          status: 'intake',
          approval_required: false,
          assigned_agents: [],
          details: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'mission-2',
          title: 'Update API',
          category: 'Dev',
          summary: 'Update REST API endpoints',
          priority: 'medium',
          status: 'in_progress',
          approval_required: false,
          assigned_agents: ['agent-1'],
          details: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (query as jest.Mock)
        .mockResolvedValueOnce({
          rows: mockMissions,
          rowCount: 2,
        })
        .mockResolvedValueOnce({
          rows: [{ count: '5' }],
          rowCount: 1,
        });

      const request = http.get('http://localhost:3002/api/missions', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.missions).toHaveLength(2);
            expect(response.total).toBe(5);
            expect(response.limit).toBe(10);
            expect(response.offset).toBe(0);
            expect(response.missions[0].title).toBe('Build Dashboard');
            request.destroy();
            done();
          } catch (err) {
            request.destroy();
            done(err);
          }
        });
      });

      request.on('error', (err) => {
        done(err);
      });
    });

    it('should filter missions by status', (done) => {
      const mockMissions = [
        {
          id: 'mission-3',
          title: 'Review Data',
          category: 'QA',
          summary: 'Review data quality',
          priority: 'medium',
          status: 'review',
          approval_required: false,
          assigned_agents: [],
          details: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (query as jest.Mock)
        .mockResolvedValueOnce({
          rows: mockMissions,
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          rows: [{ count: '1' }],
          rowCount: 1,
        });

      const request = http.get(
        'http://localhost:3002/api/missions?status=review',
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(200);
              expect(response.missions).toHaveLength(1);
              expect(response.missions[0].status).toBe('review');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });
    });

    it('should filter missions by priority', (done) => {
      const mockMissions = [
        {
          id: 'mission-4',
          title: 'Critical Fix',
          category: 'Bug',
          summary: 'Fix critical production bug',
          priority: 'critical',
          status: 'in_progress',
          approval_required: false,
          assigned_agents: ['agent-2'],
          details: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (query as jest.Mock)
        .mockResolvedValueOnce({
          rows: mockMissions,
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          rows: [{ count: '1' }],
          rowCount: 1,
        });

      const request = http.get(
        'http://localhost:3002/api/missions?priority=critical',
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(200);
              expect(response.missions).toHaveLength(1);
              expect(response.missions[0].priority).toBe('critical');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });
    });

    it('should support pagination with limit and offset', (done) => {
      const mockMissions = [
        {
          id: 'mission-5',
          title: 'Task 1',
          category: 'General',
          summary: 'First task',
          priority: 'medium',
          status: 'intake',
          approval_required: false,
          assigned_agents: [],
          details: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (query as jest.Mock)
        .mockResolvedValueOnce({
          rows: mockMissions,
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          rows: [{ count: '10' }],
          rowCount: 1,
        });

      const request = http.get(
        'http://localhost:3002/api/missions?limit=1&offset=5',
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(200);
              expect(response.limit).toBe(1);
              expect(response.offset).toBe(5);
              expect(response.total).toBe(10);
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });
    });
  });

  // ============================================================================
  // GET /api/missions/:id - Get Single Mission
  // ============================================================================

  describe('GET /api/missions/:id', () => {
    it('should return a single mission by id', (done) => {
      const mockMission = {
        id: 'mission-123',
        title: 'Build Dashboard',
        category: 'BI',
        summary: 'Create new analytics dashboard',
        priority: 'high',
        status: 'intake',
        approval_required: false,
        assigned_agents: [],
        details: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockMission],
        rowCount: 1,
      });

      const request = http.get(
        'http://localhost:3002/api/missions/mission-123',
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(200);
              expect(response.id).toBe('mission-123');
              expect(response.title).toBe('Build Dashboard');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });
    });

    it('should return 404 when mission not found', (done) => {
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const request = http.get(
        'http://localhost:3002/api/missions/nonexistent',
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(404);
              expect(response.error).toBe('Mission not found');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });
    });
  });

  // ============================================================================
  // PATCH /api/missions/:id - Update Mission Status
  // ============================================================================

  describe('PATCH /api/missions/:id', () => {
    it('should update mission status to in_progress', (done) => {
      const updateData = {
        status: 'in_progress',
      };

      const mockUpdatedMission = {
        id: 'mission-1',
        title: 'Build Dashboard',
        category: 'BI',
        summary: 'Create new analytics dashboard',
        priority: 'high',
        status: 'in_progress',
        approval_required: false,
        assigned_agents: [],
        details: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockUpdatedMission],
        rowCount: 1,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3002,
          path: '/api/missions/mission-1',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(200);
              expect(response.status).toBe('in_progress');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });

      request.write(JSON.stringify(updateData));
      request.end();
    });

    it('should assign agents to mission', (done) => {
      const updateData = {
        status: 'routed',
        assigned_agents: ['agent-1', 'agent-2'],
      };

      const mockUpdatedMission = {
        id: 'mission-1',
        title: 'Build Dashboard',
        category: 'BI',
        summary: 'Create new analytics dashboard',
        priority: 'high',
        status: 'routed',
        approval_required: false,
        assigned_agents: ['agent-1', 'agent-2'],
        details: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockUpdatedMission],
        rowCount: 1,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3002,
          path: '/api/missions/mission-1',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(200);
              expect(response.assigned_agents).toContain('agent-1');
              expect(response.assigned_agents).toContain('agent-2');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });

      request.write(JSON.stringify(updateData));
      request.end();
    });

    it('should reject update without status field', (done) => {
      const updateData = {
        assigned_agents: ['agent-1'],
        // missing status
      };

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3002,
          path: '/api/missions/mission-1',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(400);
              expect(response.error).toContain('status');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });

      request.write(JSON.stringify(updateData));
      request.end();
    });

    it('should return 404 when mission to update not found', (done) => {
      const updateData = {
        status: 'in_progress',
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3002,
          path: '/api/missions/nonexistent',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(404);
              expect(response.error).toBe('Mission not found');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });

      request.write(JSON.stringify(updateData));
      request.end();
    });

    it('should update status to completed', (done) => {
      const updateData = {
        status: 'completed',
      };

      const mockUpdatedMission = {
        id: 'mission-1',
        title: 'Build Dashboard',
        category: 'BI',
        summary: 'Create new analytics dashboard',
        priority: 'high',
        status: 'completed',
        approval_required: false,
        assigned_agents: ['agent-1'],
        details: {},
        created_at: new Date(),
        updated_at: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockUpdatedMission],
        rowCount: 1,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3002,
          path: '/api/missions/mission-1',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(200);
              expect(response.status).toBe('completed');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.on('error', (err) => {
        done(err);
      });

      request.write(JSON.stringify(updateData));
      request.end();
    });
  });
});
