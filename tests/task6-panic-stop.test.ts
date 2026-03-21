import test from 'node:test';
import assert from 'node:assert/strict';
import { startService } from '../apps/companion-service/src/server.ts';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('panic stop cancels active task quickly and blocks queue execution', async () => {
  const { server, port } = await startService();

  try {
    const create = await fetch(`http://127.0.0.1:${port}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'read_status', riskLevel: 'low' }),
    });

    assert.equal(create.status, 201);
    const created = (await create.json()) as { task: { id: string } };

    const start = await fetch(`http://127.0.0.1:${port}/tasks/${created.task.id}/start`, {
      method: 'POST',
    });
    assert.equal(start.status, 202);

    const t0 = Date.now();
    const stop = await fetch(`http://127.0.0.1:${port}/panic-stop`, { method: 'POST' });
    const elapsed = Date.now() - t0;

    assert.equal(stop.status, 200);
    assert.ok(elapsed < 1000, `panic stop took too long: ${elapsed}ms`);

    await sleep(20);

    const taskStateResponse = await fetch(`http://127.0.0.1:${port}/tasks/${created.task.id}`);
    const taskState = (await taskStateResponse.json()) as { task: { state: string } };
    assert.equal(taskState.task.state, 'cancelled');

    const blocked = await fetch(`http://127.0.0.1:${port}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'read_status', riskLevel: 'low' }),
    });

    assert.equal(blocked.status, 423);
  } finally {
    server.close();
    await sleep(5);
  }
});
