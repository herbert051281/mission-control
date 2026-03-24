import http from 'http';
import express from 'express';
import { randomUUID } from 'crypto';
import { query } from '../db/connection';

// Mock the query function
jest.mock('../db/connection', () => ({
  query: jest.fn(),
  connectDB: jest.fn(),
  closePool: jest.fn(),
}));

describe('Approval Gates API', () => {
  jest.setTimeout(15000);
  let server: any;
  let missionId: string;
  let approvalId: string;
  const {
    createApproval,
    getApprovals,
    approveApproval,
    denyApproval,
  } = require('../handlers/approvalHandler');

  beforeAll((done) => {
    // Generate test IDs
    missionId = randomUUID();
    approvalId = randomUUID();

    // Create a minimal Express app with approval routes
    const app = express();
    app.use(express.json());

    // Register routes
    app.post('/api/approvals', createApproval);
    app.get('/api/approvals', getApprovals);
    app.post('/api/approvals/:id/approve', approveApproval);
    app.post('/api/approvals/:id/deny', denyApproval);

    server = app.listen(3002, done);
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('POST /api/approvals', () => {
    it('should create approval request with pending status', (done) => {
      // Mock successful insertion
      const newApproval = {
        id: randomUUID(),
        mission_id: missionId,
        type: 'production',
        requested_by: 'agent-001',
        status: 'pending',
        requested_at: new Date(),
        resolved_at: null,
        resolver: null,
        details: { reason: 'Deploy to prod' },
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [newApproval],
        rowCount: 1,
      });

      const postData = JSON.stringify({
        mission_id: missionId,
        type: 'production',
        requested_by: 'agent-001',
        details: { reason: 'Deploy to prod' },
      });

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/approvals',
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
            expect(res.statusCode).toBe(201);
            expect(response.status).toBe('pending');
            expect(response.mission_id).toBe(missionId);
            expect(response.type).toBe('production');
            expect(response.requested_by).toBe('agent-001');
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

    it('should handle missing details gracefully', (done) => {
      const newApproval = {
        id: randomUUID(),
        mission_id: missionId,
        type: 'destructive',
        requested_by: 'agent-002',
        status: 'pending',
        requested_at: new Date(),
        resolved_at: null,
        resolver: null,
        details: {},
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [newApproval],
        rowCount: 1,
      });

      const postData = JSON.stringify({
        mission_id: missionId,
        type: 'destructive',
        requested_by: 'agent-002',
      });

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/approvals',
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
            expect(res.statusCode).toBe(201);
            expect(response.status).toBe('pending');
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

  describe('GET /api/approvals', () => {
    it('should return pending approvals', (done) => {
      const approvals = [
        {
          id: randomUUID(),
          mission_id: missionId,
          type: 'production',
          requested_by: 'agent-001',
          status: 'pending',
          requested_at: new Date(),
          resolved_at: null,
          resolver: null,
          details: {},
        },
        {
          id: randomUUID(),
          mission_id: missionId,
          type: 'destructive',
          requested_by: 'agent-002',
          status: 'pending',
          requested_at: new Date(),
          resolved_at: null,
          resolver: null,
          details: {},
        },
        {
          id: randomUUID(),
          mission_id: missionId,
          type: 'external',
          requested_by: 'agent-003',
          status: 'pending',
          requested_at: new Date(),
          resolved_at: null,
          resolver: null,
          details: {},
        },
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: approvals,
        rowCount: 3,
      });

      const request = http.get('http://localhost:3002/api/approvals', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            expect(res.statusCode).toBe(200);
            expect(response.approvals.length).toBe(3);
            expect(response.total).toBe(3);
            expect(response.approvals[0].status).toBe('pending');
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

    it('should support limit and offset pagination', (done) => {
      const approvals = [
        {
          id: randomUUID(),
          mission_id: missionId,
          type: 'production',
          requested_by: 'agent-001',
          status: 'pending',
          requested_at: new Date(),
          resolved_at: null,
          resolver: null,
          details: {},
        },
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: approvals,
        rowCount: 1,
      });

      const request = http.get(
        'http://localhost:3002/api/approvals?limit=1&offset=0',
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              expect(res.statusCode).toBe(200);
              expect(response.approvals.length).toBe(1);
              expect(query).toHaveBeenCalledWith(
                expect.stringContaining('LIMIT $2 OFFSET $3'),
                expect.arrayContaining(['pending', 1, 0])
              );
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

  describe('POST /api/approvals/:id/approve', () => {
    it('should approve an approval request', (done) => {
      const approvedApproval = {
        id: approvalId,
        mission_id: missionId,
        type: 'production',
        requested_by: 'agent-001',
        status: 'approved',
        requested_at: new Date(),
        resolved_at: new Date(),
        resolver: 'approver-001',
        details: {},
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [approvedApproval],
        rowCount: 1,
      });

      const postData = JSON.stringify({
        resolver: 'approver-001',
      });

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: `/api/approvals/${approvalId}/approve`,
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
            expect(response.status).toBe('approved');
            expect(response.resolver).toBe('approver-001');
            expect(response.resolved_at).toBeDefined();
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

    it('should return 404 when approval not found', (done) => {
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const postData = JSON.stringify({
        resolver: 'approver-001',
      });

      const nonExistentId = randomUUID();

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: `/api/approvals/${nonExistentId}/approve`,
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
            expect(response.error).toBe('Approval not found');
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

  describe('POST /api/approvals/:id/deny', () => {
    it('should deny an approval request', (done) => {
      const deniedApproval = {
        id: approvalId,
        mission_id: missionId,
        type: 'production',
        requested_by: 'agent-001',
        status: 'denied',
        requested_at: new Date(),
        resolved_at: new Date(),
        resolver: 'approver-001',
        details: {},
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [deniedApproval],
        rowCount: 1,
      });

      const postData = JSON.stringify({
        resolver: 'approver-001',
      });

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: `/api/approvals/${approvalId}/deny`,
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
            expect(response.status).toBe('denied');
            expect(response.resolver).toBe('approver-001');
            expect(response.resolved_at).toBeDefined();
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

    it('should return 404 when approval not found', (done) => {
      (query as jest.Mock).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const postData = JSON.stringify({
        resolver: 'approver-001',
      });

      const nonExistentId = randomUUID();

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: `/api/approvals/${nonExistentId}/deny`,
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
            expect(response.error).toBe('Approval not found');
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
