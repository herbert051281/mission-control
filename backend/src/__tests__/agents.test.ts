import http from 'http';
import express from 'express';
import { query } from '../db/connection';

// Mock the query function
jest.mock('../db/connection', () => ({
  query: jest.fn(),
  connectDB: jest.fn(),
  closePool: jest.fn(),
}));

// Import handler after mocking
import { updateAgentStatus } from '../handlers/agentHandler';

describe('Agent Status Endpoint', () => {
  jest.setTimeout(10000);
  let server: any;

  beforeAll((done) => {
    // Create a minimal Express app with agents route
    const app = express();
    app.use(express.json());

    // POST /api/agents/:id/status route
    app.post('/api/agents/:id/status', updateAgentStatus);

    server = app.listen(3002, done);
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

  describe('POST /api/agents/:id/status', () => {
    it('should update agent status from idle to running', (done) => {
      const mockAgent = {
        id: 'kepler',
        name: 'Kepler',
        role: 'analyst',
        model: 'gpt-4',
        status: 'running',
        last_updated: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockAgent],
        rowCount: 1,
      });

      const postData = JSON.stringify({ status: 'running' });

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/agents/kepler/status',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.id).toBe('kepler');
            expect(response.status).toBe('running');
            expect(query).toHaveBeenCalledWith(
              expect.stringContaining('UPDATE agents'),
              expect.arrayContaining(['running', null, null, 'kepler'])
            );
            done();
          } catch (err) {
            done(err);
          }
        });
      });

      req.on('error', (err) => {
        done(err);
      });

      req.write(postData);
      req.end();
    });

    it('should update agent status with current_task', (done) => {
      const currentTask = {
        id: 'task-1',
        title: 'Data Analysis',
        started_at: new Date(),
      };

      const mockAgent = {
        id: 'kepler',
        name: 'Kepler',
        role: 'analyst',
        model: 'gpt-4',
        status: 'running',
        current_task: currentTask,
        last_updated: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockAgent],
        rowCount: 1,
      });

      const postData = JSON.stringify({
        status: 'running',
        current_task: currentTask,
      });

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/agents/kepler/status',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.id).toBe('kepler');
            expect(response.status).toBe('running');
            expect(response.current_task.id).toBe('task-1');
            expect(response.current_task.title).toBe('Data Analysis');
            expect(response.current_task.started_at).toBeDefined();
            // Verify query was called with UPDATE statement
            expect(query).toHaveBeenCalledWith(
              expect.stringContaining('UPDATE agents'),
              expect.anything()
            );
            done();
          } catch (err) {
            done(err);
          }
        });
      });

      req.on('error', (err) => {
        done(err);
      });

      req.write(postData);
      req.end();
    });

    it('should update agent status with last_completed_task', (done) => {
      const lastCompletedTask = {
        id: 'task-0',
        title: 'Model Setup',
        completed_at: new Date(),
      };

      const mockAgent = {
        id: 'kepler',
        name: 'Kepler',
        role: 'analyst',
        model: 'gpt-4',
        status: 'completed',
        last_completed_task: lastCompletedTask,
        last_updated: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockAgent],
        rowCount: 1,
      });

      const postData = JSON.stringify({
        status: 'completed',
        last_completed_task: lastCompletedTask,
      });

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/agents/kepler/status',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.id).toBe('kepler');
            expect(response.status).toBe('completed');
            expect(response.last_completed_task.id).toBe('task-0');
            expect(response.last_completed_task.title).toBe('Model Setup');
            expect(response.last_completed_task.completed_at).toBeDefined();
            done();
          } catch (err) {
            done(err);
          }
        });
      });

      req.on('error', (err) => {
        done(err);
      });

      req.write(postData);
      req.end();
    });

    it('should return 404 when agent not found', (done) => {
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const postData = JSON.stringify({ status: 'running' });

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/agents/nonexistent/status',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(404);
            expect(response.error).toBe('Agent not found');
            done();
          } catch (err) {
            done(err);
          }
        });
      });

      req.on('error', (err) => {
        done(err);
      });

      req.write(postData);
      req.end();
    });

    it('should return 400 when status is invalid', (done) => {
      const postData = JSON.stringify({ status: 'invalid-status' });

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/agents/kepler/status',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(400);
            expect(response.error).toBe('Invalid status');
            expect(query).not.toHaveBeenCalled();
            done();
          } catch (err) {
            done(err);
          }
        });
      });

      req.on('error', (err) => {
        done(err);
      });

      req.write(postData);
      req.end();
    });

    it('should return 500 when query throws error', (done) => {
      (query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const postData = JSON.stringify({ status: 'running' });

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/agents/kepler/status',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const errorResponse = JSON.parse(data);
            expect(res.statusCode).toBe(500);
            expect(errorResponse.error).toBe('Database error');
            done();
          } catch (err) {
            done(err);
          }
        });
      });

      req.on('error', (err) => {
        done(err);
      });

      req.write(postData);
      req.end();
    });

    it('should update last_updated timestamp on status change', (done) => {
      const mockAgent = {
        id: 'kepler',
        name: 'Kepler',
        role: 'analyst',
        model: 'gpt-4',
        status: 'running',
        last_updated: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockAgent],
        rowCount: 1,
      });

      const postData = JSON.stringify({ status: 'running' });

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/agents/kepler/status',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            JSON.parse(data); // Verify valid JSON response
            expect(res.statusCode).toBe(200);
            // Verify that NOW() is being called in the SQL (for last_updated)
            expect(query).toHaveBeenCalledWith(
              expect.stringContaining('last_updated = NOW()'),
              expect.anything()
            );
            done();
          } catch (err) {
            done(err);
          }
        });
      });

      req.on('error', (err) => {
        done(err);
      });

      req.write(postData);
      req.end();
    });
  });
});
