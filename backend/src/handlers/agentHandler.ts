import { Request, Response } from 'express';
import { query } from '../db/connection';
import { Agent } from '../types';
import { emitAgentStatusChanged } from '../websocket/events';

/**
 * Update agent status, current task, and last completed task
 * Validates status against enum, updates last_updated timestamp, returns 404 if not found
 */
export const updateAgentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, current_task, last_completed_task } = req.body;

    // Validate status is valid AgentStatus enum
    const validStatuses = ['idle', 'running', 'waiting', 'completed', 'failed'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const sql = `
      UPDATE agents
      SET status = $1,
          current_task = $2,
          last_completed_task = $3,
          last_updated = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const params = [status, current_task || null, last_completed_task || null, id];
    const result = await query(sql, params);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    const updatedAgent = result.rows[0] as Agent;

    // Emit agent status changed event
    emitAgentStatusChanged(updatedAgent);

    res.json(updatedAgent);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
