import test from 'node:test';
import assert from 'node:assert/strict';
import { startService } from '../apps/companion-service/src/server.ts';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('pending action can be approved through API', async () => {
  const { server, port } = await startService();

  try {
    const createResponse = await fetch(`http://127.0.0.1:${port}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'ui_click', riskLevel: 'medium' }),
    });

    assert.equal(createResponse.status, 202);
    const created = (await createResponse.json()) as { task: { id: string; state: string } };
    assert.equal(created.task.state, 'pending_approval');

    const approveResponse = await fetch(`http://127.0.0.1:${port}/tasks/${created.task.id}/approve`, {
      method: 'POST',
    });

    assert.equal(approveResponse.status, 200);
    const approved = (await approveResponse.json()) as { task: { state: string } };
    assert.equal(approved.task.state, 'queued');
  } finally {
    server.close();
    await wait(5);
  }
});

test('pending action can be denied through API', async () => {
  const { server, port } = await startService();

  try {
    const createResponse = await fetch(`http://127.0.0.1:${port}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'ui_click', riskLevel: 'medium' }),
    });

    assert.equal(createResponse.status, 202);
    const created = (await createResponse.json()) as { task: { id: string; state: string } };

    const denyResponse = await fetch(`http://127.0.0.1:${port}/tasks/${created.task.id}/deny`, {
      method: 'POST',
    });

    assert.equal(denyResponse.status, 200);
    const denied = (await denyResponse.json()) as { task: { state: string } };
    assert.equal(denied.task.state, 'cancelled');
  } finally {
    server.close();
    await wait(5);
  }
});
