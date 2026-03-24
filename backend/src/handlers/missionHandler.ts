import { Request, Response } from 'express';
import { query } from '../db/connection';
import { Mission, MissionStatus } from '../types';
import {
  emitMissionStatusUpdated,
  emitMissionAssigned,
  emitMissionCompleted,
} from '../websocket/events';

export const createMission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, summary, details, priority = 'medium', approval_required = false } = req.body;

    // Validate required fields
    if (!title || !category || !summary) {
      res.status(400).json({ error: 'Missing required fields: title, category, summary' });
      return;
    }

    const sql = `
      INSERT INTO missions (title, category, summary, details, priority, approval_required, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await query(sql, [
      title,
      category,
      summary,
      details || {},
      priority,
      approval_required,
      MissionStatus.INTAKE
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getMissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10, offset = 0, status, priority } = req.query;
    let sql = 'SELECT * FROM missions';
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push('status = $' + (params.length + 1));
      params.push(status);
    }
    if (priority) {
      conditions.push('priority = $' + (params.length + 1));
      params.push(priority);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit as string, 10));
    params.push(parseInt(offset as string, 10));

    const result = await query(sql, params);
    const missions = result.rows as Mission[];

    const countSql = 'SELECT COUNT(*) as count FROM missions' +
      (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '');
    const countResult = await query(countSql, params.slice(0, params.length - 2));
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      missions,
      total,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10)
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getMissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM missions WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateMissionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, assigned_agents = [] } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Missing required field: status' });
      return;
    }

    const sql = `
      UPDATE missions
      SET status = $1, assigned_agents = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const result = await query(sql, [status, JSON.stringify(assigned_agents), id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }

    const updatedMission = result.rows[0] as Mission;

    // Emit mission status updated event
    emitMissionStatusUpdated(updatedMission);

    // Emit mission assigned event if agents were assigned
    if (assigned_agents && assigned_agents.length > 0) {
      emitMissionAssigned(id, assigned_agents);
    }

    // Emit mission completed event if status is completed
    if (status === MissionStatus.COMPLETED) {
      emitMissionCompleted(id);
    }

    res.json(updatedMission);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
