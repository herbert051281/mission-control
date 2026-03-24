import { Request, Response } from 'express';
import { query } from '../db/connection';
import { ActivityLog, ActivityStatus } from '../types';
import { emitActivityCreated } from '../websocket/events';

export const getActivities = async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0, agent, action, mission_id, status } = req.query;
    let sql = 'SELECT * FROM activity_logs WHERE 1=1';
    const params: unknown[] = [];

    if (agent) {
      sql += ' AND agent = $' + (params.length + 1);
      params.push(agent);
    }
    if (action) {
      sql += ' AND action = $' + (params.length + 1);
      params.push(action);
    }
    if (mission_id) {
      sql += ' AND target = $' + (params.length + 1);
      params.push(mission_id);
    }
    if (status) {
      sql += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    sql += ' ORDER BY timestamp DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit as string, 10));
    params.push(parseInt(offset as string, 10));

    const result = await query(sql, params);
    const activities = result.rows as ActivityLog[];

    res.json({
      activities,
      total: activities.length,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10)
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const logActivity = async (
  agent: string,
  action: string,
  target: string,
  status: ActivityStatus,
  details?: Record<string, unknown>
): Promise<ActivityLog> => {
  try {
    const sql = `
      INSERT INTO activity_logs (agent, action, target, status, details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query(sql, [agent, action, target, status, details || {}]);
    const activity = result.rows[0] as ActivityLog;

    // Emit activity created event
    emitActivityCreated(activity);

    return activity;
  } catch (error) {
    console.error('Failed to log activity:', error);
    throw error;
  }
};
