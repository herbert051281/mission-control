import { Request, Response } from 'express';
import { query } from '../db/connection';
import { ApprovalStatus, Approval } from '../types';
import { emitApprovalPending, emitApprovalResolved } from '../websocket/events';

export const createApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mission_id, type, requested_by, details } = req.body;

    const sql = `
      INSERT INTO approvals (mission_id, type, requested_by, details, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING id, mission_id, type, requested_by, status, requested_at, resolved_at, resolver, details
    `;
    const result = await query(sql, [mission_id, type, requested_by, details || {}]);
    const approval = result.rows[0] as Approval;

    // Emit approval pending event
    emitApprovalPending(approval);

    res.status(201).json(approval);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getApprovals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status = 'pending', limit = 10, offset = 0 } = req.query;

    const sql = `
      SELECT id, mission_id, type, requested_by, status, requested_at, resolved_at, resolver, details
      FROM approvals
      WHERE status = $1
      ORDER BY requested_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [
      status as ApprovalStatus,
      parseInt(limit as string, 10),
      parseInt(offset as string, 10),
    ]);
    res.json({ approvals: result.rows, total: result.rowCount });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const approveApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolver } = req.body;

    const sql = `
      UPDATE approvals
      SET status = 'approved', resolved_at = NOW(), resolver = $1
      WHERE id = $2
      RETURNING id, mission_id, type, requested_by, status, requested_at, resolved_at, resolver, details
    `;
    const result = await query(sql, [resolver, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Approval not found' });
      return;
    }
    const approval = result.rows[0] as Approval;

    // Emit approval resolved event
    emitApprovalResolved(approval);

    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const denyApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolver } = req.body;

    const sql = `
      UPDATE approvals
      SET status = 'denied', resolved_at = NOW(), resolver = $1
      WHERE id = $2
      RETURNING id, mission_id, type, requested_by, status, requested_at, resolved_at, resolver, details
    `;
    const result = await query(sql, [resolver, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Approval not found' });
      return;
    }
    const approval = result.rows[0] as Approval;

    // Emit approval resolved event
    emitApprovalResolved(approval);

    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
