import test from 'node:test';
import assert from 'node:assert/strict';
import { SqliteAuditLog } from '../packages/audit/src/sqlite-audit-log.ts';
import { startService } from '../apps/companion-service/src/server.ts';

test('sqlite audit log inserts and retrieves events in order', () => {
  const audit = new SqliteAuditLog(':memory:');
  audit.init();

  audit.append({ type: 'task.created', payload: { taskId: '1' } });
  audit.append({ type: 'task.started', payload: { taskId: '1' } });

  const events = audit.list();
  assert.equal(events.length, 2);
  assert.equal(events[0]?.type, 'task.created');
  assert.equal(events[1]?.type, 'task.started');
  assert.equal(events[0]?.id < events[1]?.id, true);
});

test('service writes queue and execution events to audit log', async () => {
  const audit = new SqliteAuditLog(':memory:');
  audit.init();

  const { server, port } = await startService({ auditLog: audit });
  try {
    const create = await fetch(`http://127.0.0.1:${port}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'read_status', riskLevel: 'low' }),
    });
    assert.equal(create.status, 201);
    const created = (await create.json()) as { task: { id: string } };

    const started = await fetch(`http://127.0.0.1:${port}/tasks/${created.task.id}/start`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ durationMs: 10 }),
    });
    assert.equal(started.status, 202);

    await new Promise((resolve) => setTimeout(resolve, 30));

    const eventTypes = audit.list().map((e) => e.type);
    assert.ok(eventTypes.includes('task.created'));
    assert.ok(eventTypes.includes('task.running'));
    assert.ok(eventTypes.includes('task.done'));
  } finally {
    server.close();
  }
});
