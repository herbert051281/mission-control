import { Router, Response } from 'express';
import { query } from '../db/connection';
import { getSystemHealth } from '../handlers/healthHandler';

const router = Router();

router.get('/health', async (_req, res: Response) => {
  try {
    // Test database connection
    const result = await query('SELECT NOW() as timestamp');
    
    res.json({
      status: 'ok',
      timestamp: new Date(),
      database: 'connected',
      version: result.rows[0]?.timestamp,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: (error as Error).message,
    });
  }
});

router.get('/health/system', getSystemHealth);

export default router;
