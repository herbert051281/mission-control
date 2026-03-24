import { Request, Response } from 'express';
import { query } from '../db/connection';
import { SystemHealth } from '../types';
import { emitHealthUpdated } from '../websocket/events';

/**
 * Get comprehensive system health status including agent availability,
 * active missions count, and approval queue depth
 * Returns 503 if database is unavailable
 */
export const getSystemHealth = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Get agent availability
    const agentsResult = await query('SELECT id, name, status FROM agents');
    const agent_availability: Record<string, boolean> = {};
    agentsResult.rows.forEach((agent: any) => {
      agent_availability[agent.name.toLowerCase()] = agent.status !== 'failed';
    });

    // Get active missions count (intake, routed, in_progress, review, awaiting_approval)
    const missionsResult = await query(`
      SELECT COUNT(*) as count FROM missions
      WHERE status IN ('intake', 'routed', 'in_progress', 'review', 'awaiting_approval')
    `);
    const active_missions_count = parseInt(missionsResult.rows[0].count, 10);

    // Get pending approvals (queue depth)
    const approvalsResult = await query(`
      SELECT COUNT(*) as count FROM approvals WHERE status = 'pending'
    `);
    const queue_depth = parseInt(approvalsResult.rows[0].count, 10);

    const healthStatus: SystemHealth = {
      agent_availability,
      queue_depth,
      active_missions_count,
      last_heartbeat: new Date(),
    };

    // Emit health updated event
    emitHealthUpdated(healthStatus);

    res.json({
      status: 'ok',
      timestamp: new Date(),
      database: 'connected',
      ...healthStatus,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: (error as Error).message,
    });
  }
};
