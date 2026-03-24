import http from 'http';
import express, { Express } from 'express';
import { query } from '../db/connection';
import { getActivities, logActivity } from '../handlers/activityHandler';
import { ActivityLog, ActivityStatus } from '../types';

// Mock the query function
jest.mock('../db/connection', () => ({
  query: jest.fn(),
  connectDB: jest.fn(),
  closePool: jest.fn(),
}));

describe('Activity Logging API', () => {
  jest.setTimeout(10000);
  let server: any;
  let app: Express;

  beforeAll((done) => {
    // Create a minimal Express app with activity route
    app = express();
    app.use(express.json());

    // Activity route
    app.get('/api/activities', getActivities);

    server = app.listen(3002, done);
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('GET /api/activities', () => {
    it('should return empty initially', (done) => {
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const request = http.get('http://localhost:3002/api/activities', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.activities).toEqual([]);
            expect(response.total).toBe(0);
            expect(response.limit).toBe(50);
            expect(response.offset).toBe(0);
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

    it('should filter by agent', (done) => {
      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          timestamp: new Date(),
          agent: 'kepler',
          action: 'mission_created',
          target: 'mission-123',
          status: ActivityStatus.INITIATED,
          details: {}
        },
        {
          id: '2',
          timestamp: new Date(),
          agent: 'kepler',
          action: 'mission_updated',
          target: 'mission-123',
          status: ActivityStatus.IN_PROGRESS,
          details: {}
        }
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: mockActivities,
        rowCount: 2,
      });

      const request = http.get('http://localhost:3002/api/activities?agent=kepler', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.activities.length).toBe(2);
            expect(response.activities.every((a: any) => a.agent === 'kepler')).toBe(true);
            expect(query).toHaveBeenCalledWith(
              expect.stringContaining('AND agent = $1'),
              expect.arrayContaining(['kepler'])
            );
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

    it('should filter by action', (done) => {
      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          timestamp: new Date(),
          agent: 'iris',
          action: 'mission_created',
          target: 'mission-123',
          status: ActivityStatus.COMPLETED,
          details: {}
        }
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: mockActivities,
        rowCount: 1,
      });

      const request = http.get('http://localhost:3002/api/activities?action=mission_created', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.activities.length).toBe(1);
            expect(response.activities[0].action).toBe('mission_created');
            expect(query).toHaveBeenCalledWith(
              expect.stringContaining('AND action = $1'),
              expect.arrayContaining(['mission_created'])
            );
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

    it('should be searchable by mission (target)', (done) => {
      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          timestamp: new Date(),
          agent: 'iris',
          action: 'mission_created',
          target: 'mission-abc-123',
          status: ActivityStatus.INITIATED,
          details: {}
        },
        {
          id: '2',
          timestamp: new Date(),
          agent: 'kepler',
          action: 'mission_updated',
          target: 'mission-abc-123',
          status: ActivityStatus.IN_PROGRESS,
          details: {}
        },
        {
          id: '3',
          timestamp: new Date(),
          agent: 'atlas',
          action: 'mission_completed',
          target: 'mission-abc-123',
          status: ActivityStatus.COMPLETED,
          details: {}
        }
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: mockActivities,
        rowCount: 3,
      });

      const request = http.get('http://localhost:3002/api/activities?mission_id=mission-abc-123', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.activities.length).toBe(3);
            expect(response.activities.every((a: any) => a.target === 'mission-abc-123')).toBe(true);
            expect(query).toHaveBeenCalledWith(
              expect.stringContaining('AND target = $1'),
              expect.arrayContaining(['mission-abc-123'])
            );
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

    it('should filter by status', (done) => {
      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          timestamp: new Date(),
          agent: 'iris',
          action: 'mission_created',
          target: 'mission-123',
          status: ActivityStatus.COMPLETED,
          details: {}
        }
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: mockActivities,
        rowCount: 1,
      });

      const request = http.get('http://localhost:3002/api/activities?status=completed', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.activities.length).toBe(1);
            expect(response.activities[0].status).toBe('completed');
            expect(query).toHaveBeenCalledWith(
              expect.stringContaining('AND status = $1'),
              expect.arrayContaining(['completed'])
            );
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

    it('should support pagination with limit and offset', (done) => {
      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          timestamp: new Date(),
          agent: 'iris',
          action: 'mission_created',
          target: 'mission-123',
          status: ActivityStatus.COMPLETED,
          details: {}
        }
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: mockActivities,
        rowCount: 1,
      });

      const request = http.get('http://localhost:3002/api/activities?limit=10&offset=5', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.limit).toBe(10);
            expect(response.offset).toBe(5);
            expect(query).toHaveBeenCalledWith(
              expect.stringContaining('LIMIT $1 OFFSET $2'),
              expect.arrayContaining([10, 5])
            );
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

    it('should return activities ordered by timestamp DESC', (done) => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 60000);
      const earliest = new Date(now.getTime() - 120000);

      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          timestamp: now,
          agent: 'iris',
          action: 'mission_created',
          target: 'mission-123',
          status: ActivityStatus.COMPLETED,
          details: {}
        },
        {
          id: '2',
          timestamp: earlier,
          agent: 'kepler',
          action: 'mission_updated',
          target: 'mission-123',
          status: ActivityStatus.IN_PROGRESS,
          details: {}
        },
        {
          id: '3',
          timestamp: earliest,
          agent: 'atlas',
          action: 'mission_initiated',
          target: 'mission-123',
          status: ActivityStatus.INITIATED,
          details: {}
        }
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: mockActivities,
        rowCount: 3,
      });

      const request = http.get('http://localhost:3002/api/activities', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.activities.length).toBe(3);
            // Timestamps are serialized as ISO strings in JSON
            expect(response.activities[0].timestamp).toBe(now.toISOString());
            expect(response.activities[1].timestamp).toBe(earlier.toISOString());
            expect(response.activities[2].timestamp).toBe(earliest.toISOString());
            expect(query).toHaveBeenCalledWith(
              expect.stringContaining('ORDER BY timestamp DESC'),
              expect.any(Array)
            );
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

    it('should handle database errors gracefully', (done) => {
      (query as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

      const request = http.get('http://localhost:3002/api/activities', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(500);
            expect(response.error).toBe('Database connection failed');
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
  });

  describe('logActivity (internal function)', () => {
    it('should insert activity log and return created record', async () => {
      const mockActivity: ActivityLog = {
        id: '123',
        timestamp: new Date(),
        agent: 'iris',
        action: 'mission_created',
        target: 'mission-abc',
        status: ActivityStatus.INITIATED,
        details: { reason: 'user request' }
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockActivity],
        rowCount: 1,
      });

      const result = await logActivity('iris', 'mission_created', 'mission-abc', ActivityStatus.INITIATED, { reason: 'user request' });

      expect(result).toEqual(mockActivity);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO activity_logs'),
        ['iris', 'mission_created', 'mission-abc', 'initiated', { reason: 'user request' }]
      );
    });

    it('should handle activity logging errors', async () => {
      (query as jest.Mock).mockRejectedValueOnce(new Error('Insert failed'));

      await expect(
        logActivity('iris', 'mission_created', 'mission-abc', ActivityStatus.INITIATED)
      ).rejects.toThrow('Insert failed');
    });

    it('should use empty object for details if not provided', async () => {
      const mockActivity: ActivityLog = {
        id: '123',
        timestamp: new Date(),
        agent: 'iris',
        action: 'mission_created',
        target: 'mission-abc',
        status: ActivityStatus.INITIATED,
        details: {}
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockActivity],
        rowCount: 1,
      });

      const result = await logActivity('iris', 'mission_created', 'mission-abc', ActivityStatus.INITIATED);

      expect(result.details).toEqual({});
    });
  });
});
