import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { TaskQueue } from './task-queue.ts';
import { evaluatePolicy, type PolicyRule, type RiskLevel } from '../../../packages/policy-engine/src/index.ts';
import samplePolicy from '../../../packages/policy-engine/policy.sample.json' with { type: 'json' };

type AuditLog = {
  append: (event: { type: string; payload: unknown; timestamp?: number }) => unknown;
};

type StartOptions = {
  port?: number;
  host?: string;
  auditLog?: AuditLog;
};

export type ServiceHandle = {
  server: Server;
  host: '127.0.0.1';
  port: number;
};

const LOCALHOST = '127.0.0.1' as const;
const policy = samplePolicy as PolicyRule[];

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Uint8Array);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
}

export async function startService(options: StartOptions = {}): Promise<ServiceHandle> {
  const requestedHost = options.host ?? LOCALHOST;

  if (requestedHost !== LOCALHOST) {
    throw new Error('localhost only policy: service must bind to 127.0.0.1');
  }

  const queue = new TaskQueue();
  const runningControllers = new Map<string, { controller: AbortController; timer: ReturnType<typeof setTimeout> }>();
  let panicStopped = false;
  const auditLog = options.auditLog;

  const logEvent = (type: string, payload: unknown) => {
    auditLog?.append({ type, payload, timestamp: Date.now() });
  };

  const cancelTaskIfPossible = (taskId: string) => {
    const task = queue.get(taskId);
    if (!task) {
      return;
    }

    if (['queued', 'pending_approval', 'running'].includes(task.state)) {
      const cancelled = queue.transition(task.id, 'cancelled');
      logEvent('task.cancelled', { taskId: cancelled.id, action: cancelled.action });
    }
  };

  const startSyntheticExecution = (taskId: string, durationMs = 5_000) => {
    const task = queue.get(taskId);
    if (!task) {
      throw new Error('task_not_found');
    }

    if (task.state !== 'queued') {
      throw new Error('task_not_queued');
    }

    const running = queue.transition(taskId, 'running');
    logEvent('task.running', { taskId: running.id, action: running.action });
    const controller = new AbortController();

    const timer = setTimeout(() => {
      if (controller.signal.aborted) {
        return;
      }

      const done = queue.transition(taskId, 'done');
      logEvent('task.done', { taskId: done.id, action: done.action });
      runningControllers.delete(taskId);
    }, durationMs);

    controller.signal.addEventListener('abort', () => {
      clearTimeout(timer);
      runningControllers.delete(taskId);
      cancelTaskIfPossible(taskId);
    });

    runningControllers.set(taskId, { controller, timer });
  };

  const panicStop = () => {
    panicStopped = true;

    for (const [id, ctx] of runningControllers) {
      ctx.controller.abort();
      runningControllers.delete(id);
    }

    for (const task of queue.all()) {
      cancelTaskIfPossible(task.id);
    }
  };

  const server = createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      sendJson(res, 200, { status: 'healthy' });
      return;
    }

    if (req.method === 'POST' && req.url === '/tasks') {
      if (panicStopped) {
        sendJson(res, 423, { error: 'panic_stopped' });
        return;
      }

      const body = await readBody(req);
      const action = body.action as string;
      const riskLevel = body.riskLevel as RiskLevel;
      const decision = evaluatePolicy(policy, { action, riskLevel });

      if (decision.decision === 'deny') {
        sendJson(res, 403, { decision: 'deny' });
        return;
      }

      const task = queue.enqueue({ action, riskLevel });
      logEvent('task.created', { taskId: task.id, action: task.action, riskLevel: task.riskLevel });

      if (decision.decision === 'approval_required') {
        const pending = queue.transition(task.id, 'pending_approval');
        logEvent('task.pending_approval', { taskId: pending.id, action: pending.action });
        sendJson(res, 202, { decision: 'approval_required', task: pending });
        return;
      }

      sendJson(res, 201, { decision: 'allow', task });
      return;
    }

    const approveMatch = req.url?.match(/^\/tasks\/([^/]+)\/approve$/);
    if (req.method === 'POST' && approveMatch) {
      const task = queue.get(approveMatch[1]);
      if (!task || task.state !== 'pending_approval') {
        sendJson(res, 404, { error: 'pending_task_not_found' });
        return;
      }

      const updated = queue.transition(task.id, 'queued');
      logEvent('task.approved', { taskId: updated.id, action: updated.action });
      sendJson(res, 200, { task: updated });
      return;
    }

    const denyMatch = req.url?.match(/^\/tasks\/([^/]+)\/deny$/);
    if (req.method === 'POST' && denyMatch) {
      const task = queue.get(denyMatch[1]);
      if (!task || task.state !== 'pending_approval') {
        sendJson(res, 404, { error: 'pending_task_not_found' });
        return;
      }

      const updated = queue.transition(task.id, 'cancelled');
      logEvent('task.denied', { taskId: updated.id, action: updated.action });
      sendJson(res, 200, { task: updated });
      return;
    }

    const startMatch = req.url?.match(/^\/tasks\/([^/]+)\/start$/);
    if (req.method === 'POST' && startMatch) {
      if (panicStopped) {
        sendJson(res, 423, { error: 'panic_stopped' });
        return;
      }

      const body = await readBody(req);
      const durationMs = typeof body.durationMs === 'number' ? body.durationMs : undefined;

      try {
        startSyntheticExecution(startMatch[1], durationMs);
      } catch (error) {
        sendJson(res, 400, { error: (error as Error).message });
        return;
      }

      sendJson(res, 202, { task: queue.get(startMatch[1]) });
      return;
    }

    if (req.method === 'POST' && req.url === '/panic-stop') {
      panicStop();
      logEvent('panic.stop', { status: 'stopped' });
      sendJson(res, 200, { status: 'stopped' });
      return;
    }

    const taskMatch = req.url?.match(/^\/tasks\/([^/]+)$/);
    if (req.method === 'GET' && taskMatch) {
      const task = queue.get(taskMatch[1]);
      if (!task) {
        sendJson(res, 404, { error: 'task_not_found' });
        return;
      }

      sendJson(res, 200, { task });
      return;
    }

    sendJson(res, 404, { error: 'not_found' });
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(options.port ?? 0, LOCALHOST, () => {
      server.off('error', reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('failed to bind service address');
  }

  return {
    server,
    host: LOCALHOST,
    port: address.port,
  };
}
