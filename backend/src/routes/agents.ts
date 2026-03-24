import { Router } from 'express';
import { updateAgentStatus } from '../handlers/agentHandler';

const router = Router();

/**
 * POST /agents/:id/status
 * Updates an agent's status, current_task, and last_completed_task
 * 
 * Request body:
 * {
 *   status?: 'idle' | 'running' | 'waiting' | 'completed' | 'failed',
 *   current_task?: { id: string, title: string, started_at: Date },
 *   last_completed_task?: { id: string, title: string, completed_at: Date }
 * }
 * 
 * Returns: Updated Agent object
 * Errors:
 * - 400: Invalid status value
 * - 404: Agent not found
 * - 500: Database error
 */
router.post('/agents/:id/status', updateAgentStatus);

export default router;
