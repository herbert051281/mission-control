import express, { Express } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import agentsRouter from './routes/agents';
import activityRouter from './routes/activity';
import missionsRouter from './routes/missions';
import approvalsRouter from './routes/approvals';
import skillsRouter from './routes/skills';
import { connectDB } from './db/connection';
import { errorHandler } from './middleware/errorHandler';
import { initializeWebSocket } from './websocket';

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 3000;

// Initialize WebSocket
initializeWebSocket(httpServer);

// Middleware
app.use(express.json());

// CORS middleware
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check route (mounted at /api)
app.use('/api', healthRouter);

// Auth routes (mounted at /api)
app.use('/api', authRouter);

// Agents API routes (mounted at /api)
app.use('/api', agentsRouter);

// Activity logging routes (mounted at /api)
app.use('/api', activityRouter);

// Mission CRUD routes (mounted at /api)
app.use('/api', missionsRouter);

// Approval Gates routes (mounted at /api)
app.use('/api', approvalsRouter);

// Skill Registry routes (mounted at /api)
app.use('/api', skillsRouter);

// Error handler MUST be last
app.use(errorHandler);

// Start server only if not in test environment or if explicitly required
let server: any;

if (process.env.NODE_ENV !== 'test') {
  server = httpServer.listen(port, async () => {
    try {
      await connectDB();
      console.log(`✅ Server running on port ${port} with WebSocket support`);
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

export { app, httpServer };
export default app;
