import http from 'http';
import express from 'express';
import { query } from '../db/connection';
import { getSystemHealth } from '../handlers/healthHandler';

// Mock the query function
jest.mock('../db/connection', () => ({
  query: jest.fn(),
  connectDB: jest.fn(),
  closePool: jest.fn(),
}));

describe('Health Endpoint', () => {
  jest.setTimeout(10000);
  let server: any;

  beforeAll((done) => {
    // Create a minimal Express app with health routes
    const app = express();
    app.use(express.json());

    // Basic health route
    app.get('/api/health', async (_req, res) => {
      try {
        const result = await query('SELECT NOW() as timestamp');
        
        res.json({
          status: 'ok',
          timestamp: new Date(),
          database: 'connected',
          version: result.rows[0]?.timestamp,
        });
      } catch (error) {
        res.status(503).json({
          status: 'error',
          database: 'disconnected',
          error: (error as Error).message,
        });
      }
    });

    // System health route
    app.get('/api/health/system', getSystemHealth);

    server = app.listen(3001, done);
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return status ok when database is connected', (done) => {
      // Mock successful query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ timestamp: new Date().toISOString() }],
        rowCount: 1,
      });

      const request = http.get('http://localhost:3001/api/health', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.status).toBe('ok');
            expect(response.database).toBe('connected');
            expect(response.timestamp).toBeDefined();
            expect(response.version).toBeDefined();
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

    it('should return status error when database is disconnected', (done) => {
      // Mock failed query
      (query as jest.Mock).mockRejectedValueOnce(new Error('Connection refused'));

      const request = http.get('http://localhost:3001/api/health', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(503);
            expect(response.status).toBe('error');
            expect(response.database).toBe('disconnected');
            expect(response.error).toBe('Connection refused');
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

    it('should include timestamp in response', (done) => {
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ timestamp: '2026-03-25T05:13:00Z' }],
        rowCount: 1,
      });

      const request = http.get('http://localhost:3001/api/health', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(response.timestamp).toBeDefined();
            expect(response.version).toBe('2026-03-25T05:13:00Z');
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

  describe('Query Execution', () => {
    it('should execute SELECT NOW() query on health check', (done) => {
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ timestamp: new Date().toISOString() }],
      });

      const request = http.get('http://localhost:3001/api/health', (res) => {
        res.on('data', () => {
          // consume data
        });

        res.on('end', () => {
          expect(query).toHaveBeenCalledWith('SELECT NOW() as timestamp');
          request.destroy();
          done();
        });
      });

      request.on('error', (err) => {
        done(err);
      });
    });
  });

  describe('GET /api/health/system', () => {
    it('should return full system status with all required fields', (done) => {
      // Mock agents query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'agent-one', status: 'idle' },
          { id: 2, name: 'agent-two', status: 'running' },
        ],
      });

      // Mock missions query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ count: '3' }],
      });

      // Mock approvals query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ count: '2' }],
      });

      const request = http.get('http://localhost:3001/api/health/system', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.status).toBe('ok');
            expect(response.database).toBe('connected');
            expect(response).toHaveProperty('agent_availability');
            expect(response).toHaveProperty('queue_depth');
            expect(response).toHaveProperty('active_missions_count');
            expect(response).toHaveProperty('last_heartbeat');
            expect(response).toHaveProperty('timestamp');
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

    it('should reflect agent availability based on status', (done) => {
      // Mock agents: one idle, one running, one failed
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'agent-one', status: 'idle' },
          { id: 2, name: 'agent-two', status: 'running' },
          { id: 3, name: 'agent-three', status: 'failed' },
        ],
      });

      // Mock missions query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ count: '1' }],
      });

      // Mock approvals query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ count: '0' }],
      });

      const request = http.get('http://localhost:3001/api/health/system', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(response.agent_availability['agent-one']).toBe(true);
            expect(response.agent_availability['agent-two']).toBe(true);
            expect(response.agent_availability['agent-three']).toBe(false);
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

    it('should count queue depth from pending approvals', (done) => {
      // Mock agents query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 1, name: 'agent-one', status: 'idle' }],
      });

      // Mock missions query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ count: '1' }],
      });

      // Mock approvals query with multiple pending approvals
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ count: '5' }],
      });

      const request = http.get('http://localhost:3001/api/health/system', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(response.queue_depth).toBe(5);
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

    it('should count active missions in proper states', (done) => {
      // Mock agents query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 1, name: 'agent-one', status: 'idle' }],
      });

      // Mock missions query - should return count of intake, routed, in_progress, review, awaiting_approval
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ count: '7' }],
      });

      // Mock approvals query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ count: '2' }],
      });

      const request = http.get('http://localhost:3001/api/health/system', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(response.active_missions_count).toBe(7);
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

    it('should return 503 when database is disconnected', (done) => {
      // Mock agents query failure
      (query as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

      const request = http.get('http://localhost:3001/api/health/system', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(503);
            expect(response.status).toBe('error');
            expect(response.database).toBe('disconnected');
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

    it('should include timestamp and last_heartbeat in response', (done) => {
      // Mock agents query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 1, name: 'agent-one', status: 'idle' }],
      });

      // Mock missions query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ count: '0' }],
      });

      // Mock approvals query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ count: '0' }],
      });

      const request = http.get('http://localhost:3001/api/health/system', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(response.timestamp).toBeDefined();
            expect(response.last_heartbeat).toBeDefined();
            expect(new Date(response.timestamp).getTime()).toBeGreaterThan(0);
            expect(new Date(response.last_heartbeat).getTime()).toBeGreaterThan(0);
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

    it('should execute correct queries in proper sequence', (done) => {
      // Mock agents query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 1, name: 'agent-one', status: 'idle' }],
      });

      // Mock missions query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ count: '1' }],
      });

      // Mock approvals query
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [{ count: '1' }],
      });

      const request = http.get('http://localhost:3001/api/health/system', (res) => {
        res.on('data', () => {
          // consume data
        });

        res.on('end', () => {
          try {
            expect(query).toHaveBeenCalledTimes(3);
            expect(query).toHaveBeenNthCalledWith(1, 'SELECT id, name, status FROM agents');
            expect(query).toHaveBeenNthCalledWith(2, expect.stringContaining('SELECT COUNT(*) as count FROM missions'));
            expect(query).toHaveBeenNthCalledWith(3, expect.stringContaining('SELECT COUNT(*) as count FROM approvals'));
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
});
