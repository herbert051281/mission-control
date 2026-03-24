import { Request, Response } from 'express';
import { query } from '../db/connection';
import { Skill } from '../types';
import { emitSkillDeployed } from '../websocket/events';

/**
 * Create a new skill
 * Emits skill:deployed event on successful creation
 */
export const createSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, version, owner, deployment_state } = req.body;

    if (!id || !name || !version || !owner || !deployment_state) {
      res.status(400).json({
        error: 'Missing required fields: id, name, version, owner, deployment_state',
      });
      return;
    }

    const sql = `
      INSERT INTO skills (id, name, version, owner, deployment_state)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query(sql, [id, name, version, owner, deployment_state]);
    const skill = result.rows[0] as Skill;

    // Emit skill deployed event
    emitSkillDeployed(skill);

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Update a skill's deployment state
 * Emits skill:deployed event on successful update
 */
export const updateSkillDeploymentState = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { deployment_state } = req.body;

    if (!deployment_state) {
      res.status(400).json({ error: 'Missing required field: deployment_state' });
      return;
    }

    const sql = `
      UPDATE skills
      SET deployment_state = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [deployment_state, id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    const skill = result.rows[0] as Skill;

    // Emit skill deployed event
    emitSkillDeployed(skill);

    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get skill by ID
 */
export const getSkillById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM skills WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get all skills with optional filtering
 */
export const getSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { owner, deployment_state, limit = 50, offset = 0 } = req.query;
    let sql = 'SELECT * FROM skills WHERE 1=1';
    const params: unknown[] = [];

    if (owner) {
      sql += ' AND owner = $' + (params.length + 1);
      params.push(owner);
    }

    if (deployment_state) {
      sql += ' AND deployment_state = $' + (params.length + 1);
      params.push(deployment_state);
    }

    sql += ' ORDER BY updated_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit as string, 10));
    params.push(parseInt(offset as string, 10));

    const result = await query(sql, params);
    const skills = result.rows as Skill[];

    res.json({
      skills,
      total: skills.length,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
