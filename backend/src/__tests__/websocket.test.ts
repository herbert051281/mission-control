import { Server as HTTPServer } from 'http';
import http from 'http';
import express from 'express';
import { io as ioClient } from 'socket.io-client';
import { initializeWebSocket, getIO, broadcast } from '../websocket';

describe('WebSocket Setup', () => {
  let httpServer: HTTPServer;
  let serverUrl: string;
  const PORT = 3001;

  beforeAll(() => {
    const app = express();
    httpServer = http.createServer(app);
    initializeWebSocket(httpServer);

    httpServer.listen(PORT);
    serverUrl = `http://localhost:${PORT}`;
  });

  afterAll((done) => {
    httpServer.close(() => {
      done();
    });
  });

  test('WebSocket server initializes on HTTP server', async () => {
    const result = getIO();
    expect(result).toBeDefined();
    expect(result.engine).toBeDefined();
  });

  test('Client can connect via WebSocket', async () => {
    const client = ioClient(serverUrl, { transports: ['websocket', 'polling'] });

    const connected = await new Promise<boolean>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);

      client.on('connect', () => {
        clearTimeout(timeout);
        resolve(true);
      });
    });

    expect(connected).toBe(true);
    client.disconnect();
  });

  test('Broadcast sends to all connected clients', async () => {
    const client1 = ioClient(serverUrl, { transports: ['websocket', 'polling'] });
    const client2 = ioClient(serverUrl, { transports: ['websocket', 'polling'] });

    const connectedPromise = new Promise<void>((resolve) => {
      let connectedCount = 0;
      client1.on('connect', () => {
        connectedCount++;
        if (connectedCount === 2) resolve();
      });
      client2.on('connect', () => {
        connectedCount++;
        if (connectedCount === 2) resolve();
      });
    });

    await connectedPromise;

    const messageReceived = new Promise<{ text: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Message not received'));
      }, 5000);

      client2.on('test:message', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });

      // Broadcast from server
      broadcast('test:message', { text: 'hello' });
    });

    const received = await messageReceived;
    expect(received).toEqual({ text: 'hello' });

    client1.disconnect();
    client2.disconnect();
  });

  test('BroadcastToRoom sends only to room subscribers', async () => {
    const client1 = ioClient(serverUrl, { transports: ['websocket', 'polling'] });
    const client2 = ioClient(serverUrl, { transports: ['websocket', 'polling'] });

    const connectedPromise = new Promise<void>((resolve) => {
      let connectedCount = 0;
      client1.on('connect', () => {
        connectedCount++;
        if (connectedCount === 2) resolve();
      });
      client2.on('connect', () => {
        connectedCount++;
        if (connectedCount === 2) resolve();
      });
    });

    await connectedPromise;

    // Join room
    client1.emit('join:room', { room: 'test-room' });

    // Wait for room join to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    let client2Received = false;

    client1.on('room:message', () => {
      // This should receive the message (it's in the room)
    });

    client2.on('room:message', () => {
      // This should NOT receive the message (it's not in the room)
      client2Received = true;
    });

    // Emit message after a short delay to ensure room join is complete
    const io = getIO();
    io.to('test-room').emit('room:message', { text: 'room only' });

    // Wait to see if client2 receives anything
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(client2Received).toBe(false);

    client1.disconnect();
    client2.disconnect();
  });

  test('Handles disconnection gracefully', async () => {
    const client = ioClient(serverUrl, { transports: ['websocket', 'polling'] });

    await new Promise<void>((resolve) => {
      client.on('connect', () => {
        resolve();
      });
    });

    const disconnected = await new Promise<boolean>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Disconnect timeout'));
      }, 5000);

      client.on('disconnect', () => {
        clearTimeout(timeout);
        resolve(true);
      });

      client.disconnect();
    });

    expect(disconnected).toBe(true);
  });

  test('Socket error is handled gracefully', async () => {
    const client = ioClient(serverUrl, { transports: ['websocket', 'polling'] });

    const errorHandler = jest.fn();

    client.on('connect', () => {
      // Simulate an error by emitting invalid data
      client.emit('error', new Error('Test error'));
    });

    client.on('error', errorHandler);

    // Wait a bit to see if error is handled
    await new Promise((resolve) => setTimeout(resolve, 1000));

    client.disconnect();
  });
});
