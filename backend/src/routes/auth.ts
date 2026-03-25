import { Router, Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import { query } from '../db/connection';

const router = Router();

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password, agentId, agentName } = req.body;

    // Support both username/password (demo) and agentId/agentName (production)
    if (username && password) {
      // Demo login - accept any admin/admin
      if (username === 'admin' && password === 'admin') {
        const token = generateToken('admin-agent', 'Admin');
        return res.json({ token, agent_id: 'admin-agent', agent_name: 'Admin', expiresIn: '24h' });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (agentId && agentName) {
      // Production login - verify against DB
      const result = await query('SELECT id FROM agents WHERE id = $1', [agentId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Generate token
      const token = generateToken(agentId, agentName);
      return res.json({ token, agent_id: agentId, agent_name: agentName, expiresIn: '24h' });
    }

    return res.status(400).json({ error: 'Missing credentials' });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
