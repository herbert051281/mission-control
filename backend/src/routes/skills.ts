/**
 * Skill Registry Routes
 * API endpoints for skill CRUD and deployment state management
 */

import { Router } from 'express';
import { createSkill, getSkills, updateSkillDeploymentState } from '../handlers/skillHandler';

const router = Router();

// POST /api/skills - Register a new skill
router.post('/skills', createSkill);

// GET /api/skills - List all skills with optional filtering
router.get('/skills', getSkills);

// PATCH /api/skills/:id/deployment - Update deployment state
router.patch('/skills/:id/deployment', updateSkillDeploymentState);

export default router;
