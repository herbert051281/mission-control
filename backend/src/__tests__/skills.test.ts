/**
 * Skill Registry API Tests
 * Tests for skill CRUD operations and deployment state management
 */

import http from 'http';
import express, { Express } from 'express';
import { query } from '../db/connection';
import { createSkill, getSkills, updateSkillDeploymentState } from '../handlers/skillHandler';

// Mock the database connection
jest.mock('../db/connection', () => ({
  query: jest.fn(),
  connectDB: jest.fn(),
  closePool: jest.fn(),
}));

// Mock websocket events
jest.mock('../websocket/events', () => ({
  emitSkillDeployed: jest.fn(),
}));

describe('Skill Registry API', () => {
  jest.setTimeout(15000);
  let server: any;
  let app: Express;

  beforeAll((done) => {
    // Create Express app with skill routes
    app = express();
    app.use(express.json());

    app.post('/api/skills', createSkill);
    app.get('/api/skills', getSkills);
    app.patch('/api/skills/:id/deployment', updateSkillDeploymentState);

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
    jest.clearAllMocks();
  });

  // ============================================================================
  // POST /api/skills - Create Skill
  // ============================================================================

  describe('POST /api/skills', () => {
    it('should create a new skill with initial deployment state "development"', (done) => {
      const skillData = {
        name: 'mission-control-dashboard',
        version: '1.0.0',
        owner: 'davinci',
      };

      const mockSkill = {
        id: 'skill-1',
        name: 'mission-control-dashboard',
        version: '1.0.0',
        owner: 'davinci',
        deployment_state: 'development',
        updated_at: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockSkill],
        rowCount: 1,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills',
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
              expect(response.name).toBe('mission-control-dashboard');
              expect(response.version).toBe('1.0.0');
              expect(response.owner).toBe('davinci');
              expect(response.deployment_state).toBe('development');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.write(JSON.stringify(skillData));
      request.end();
    });

    it('should return 500 on database error', (done) => {
      const skillData = {
        name: 'failing-skill',
        version: '1.0.0',
        owner: 'davinci',
      };

      (query as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills',
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
              expect(res.statusCode).toBe(500);
              expect(response.error).toBe('Database connection failed');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.write(JSON.stringify(skillData));
      request.end();
    });
  });

  // ============================================================================
  // GET /api/skills - List Skills
  // ============================================================================

  describe('GET /api/skills', () => {
    it('should return all skills without filters', (done) => {
      const mockSkills = [
        {
          id: 'skill-1',
          name: 'mission-control-dashboard',
          version: '1.0.0',
          owner: 'davinci',
          deployment_state: 'development',
          updated_at: new Date(),
        },
        {
          id: 'skill-2',
          name: 'agent-orchestrator',
          version: '2.1.0',
          owner: 'kepler',
          deployment_state: 'staging',
          updated_at: new Date(),
        },
        {
          id: 'skill-3',
          name: 'data-analyzer',
          version: '3.0.0',
          owner: 'davinci',
          deployment_state: 'production',
          updated_at: new Date(),
        },
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: mockSkills,
        rowCount: 3,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills',
          method: 'GET',
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
              expect(response.skills).toHaveLength(3);
              expect(response.total).toBe(3);
              expect(response.skills[0].name).toBe('mission-control-dashboard');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.end();
    });

    it('should filter skills by owner', (done) => {
      const mockSkills = [
        {
          id: 'skill-1',
          name: 'mission-control-dashboard',
          version: '1.0.0',
          owner: 'davinci',
          deployment_state: 'development',
          updated_at: new Date(),
        },
        {
          id: 'skill-3',
          name: 'data-analyzer',
          version: '3.0.0',
          owner: 'davinci',
          deployment_state: 'production',
          updated_at: new Date(),
        },
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: mockSkills,
        rowCount: 2,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills?owner=davinci',
          method: 'GET',
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
              expect(response.skills).toHaveLength(2);
              expect(response.skills.every((s: any) => s.owner === 'davinci')).toBe(true);
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.end();
    });

    it('should filter skills by deployment_state', (done) => {
      const mockSkills = [
        {
          id: 'skill-2',
          name: 'agent-orchestrator',
          version: '2.1.0',
          owner: 'kepler',
          deployment_state: 'staging',
          updated_at: new Date(),
        },
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: mockSkills,
        rowCount: 1,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills?deployment_state=staging',
          method: 'GET',
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
              expect(response.skills).toHaveLength(1);
              expect(response.skills[0].deployment_state).toBe('staging');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.end();
    });

    it('should filter skills by both owner and deployment_state', (done) => {
      const mockSkills = [
        {
          id: 'skill-1',
          name: 'mission-control-dashboard',
          version: '1.0.0',
          owner: 'davinci',
          deployment_state: 'development',
          updated_at: new Date(),
        },
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: mockSkills,
        rowCount: 1,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills?owner=davinci&deployment_state=development',
          method: 'GET',
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
              expect(response.skills).toHaveLength(1);
              expect(response.skills[0].owner).toBe('davinci');
              expect(response.skills[0].deployment_state).toBe('development');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.end();
    });

    it('should support pagination with limit and offset', (done) => {
      const mockSkills = [
        {
          id: 'skill-2',
          name: 'agent-orchestrator',
          version: '2.1.0',
          owner: 'kepler',
          deployment_state: 'staging',
          updated_at: new Date(),
        },
        {
          id: 'skill-3',
          name: 'data-analyzer',
          version: '3.0.0',
          owner: 'davinci',
          deployment_state: 'production',
          updated_at: new Date(),
        },
      ];

      (query as jest.Mock).mockResolvedValueOnce({
        rows: mockSkills,
        rowCount: 2,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills?limit=2&offset=1',
          method: 'GET',
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
              expect(response.skills).toHaveLength(2);
              // Verify that query was called with correct pagination params
              expect((query as jest.Mock).mock.calls[0][1]).toContain(2); // limit
              expect((query as jest.Mock).mock.calls[0][1]).toContain(1); // offset
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.end();
    });
  });

  // ============================================================================
  // PATCH /api/skills/:id/deployment - Update Deployment State
  // ============================================================================

  describe('PATCH /api/skills/:id/deployment', () => {
    it('should update skill deployment state from development to staging', (done) => {
      const updateData = { deployment_state: 'staging' };

      const mockSkill = {
        id: 'skill-1',
        name: 'mission-control-dashboard',
        version: '1.0.0',
        owner: 'davinci',
        deployment_state: 'staging',
        updated_at: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockSkill],
        rowCount: 1,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills/skill-1/deployment',
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
              expect(response.deployment_state).toBe('staging');
              expect(response.name).toBe('mission-control-dashboard');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.write(JSON.stringify(updateData));
      request.end();
    });

    it('should update skill deployment state from staging to production', (done) => {
      const updateData = { deployment_state: 'production' };

      const mockSkill = {
        id: 'skill-2',
        name: 'agent-orchestrator',
        version: '2.1.0',
        owner: 'kepler',
        deployment_state: 'production',
        updated_at: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockSkill],
        rowCount: 1,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills/skill-2/deployment',
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
              expect(response.deployment_state).toBe('production');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.write(JSON.stringify(updateData));
      request.end();
    });

    it('should reject invalid deployment state with 400', (done) => {
      const updateData = { deployment_state: 'invalid_state' };

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills/skill-1/deployment',
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
              expect(response.error).toBe('Invalid deployment state');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.write(JSON.stringify(updateData));
      request.end();
    });

    it('should return 404 when skill not found', (done) => {
      const updateData = { deployment_state: 'staging' };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills/nonexistent-skill/deployment',
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
              expect(response.error).toBe('Skill not found');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.write(JSON.stringify(updateData));
      request.end();
    });

    it('should return 500 on database error during update', (done) => {
      const updateData = { deployment_state: 'staging' };

      (query as jest.Mock).mockRejectedValueOnce(new Error('Database connection error'));

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills/skill-1/deployment',
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
              expect(res.statusCode).toBe(500);
              expect(response.error).toBe('Database connection error');
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.write(JSON.stringify(updateData));
      request.end();
    });

    it('should emit skill:deployed event on successful state change', (done) => {
      const { emitSkillDeployed } = require('../websocket/events');
      const updateData = { deployment_state: 'production' };

      const mockSkill = {
        id: 'skill-3',
        name: 'data-analyzer',
        version: '3.0.0',
        owner: 'davinci',
        deployment_state: 'production',
        updated_at: new Date(),
      };

      (query as jest.Mock).mockResolvedValueOnce({
        rows: [mockSkill],
        rowCount: 1,
      });

      const request = http.request(
        {
          hostname: 'localhost',
          port: 3003,
          path: '/api/skills/skill-3/deployment',
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
              expect(res.statusCode).toBe(200);
              expect(emitSkillDeployed).toHaveBeenCalledWith(mockSkill);
              request.destroy();
              done();
            } catch (err) {
              request.destroy();
              done(err);
            }
          });
        }
      );

      request.write(JSON.stringify(updateData));
      request.end();
    });
  });
});
