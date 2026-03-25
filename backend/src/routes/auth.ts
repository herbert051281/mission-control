import { Router, Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import { query } from '../db/connection';

const router = Router();

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { agentId, agentName } = req.body;

    // Simple validation
    if (!agentId || !agentName) {
      return res.status(400).json({ error: 'Missing agentId or agentName' });
    }

    // Verify agent exists in DB
    const result = await query('SELECT id FROM agents WHERE id = $1', [agentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Generate token
    const token = generateToken(agentId, agentName);
    return res.json({ token, expiresIn: '24h' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
