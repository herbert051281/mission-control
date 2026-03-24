/**
 * WebSocket Broadcasting Infrastructure
 * Central hub for real-time event distribution to connected clients
 * Uses socket.io for robust real-time communication
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

/**
 * Initialize WebSocket server with socket.io
 * @param httpServer HTTP server instance
 */
export const initializeWebSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Handle room joining
    socket.on('join:room', (data: { room: string }) => {
      socket.join(data.room);
      console.log(`✅ Client ${socket.id} joined room: ${data.room}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error: Error) => {
      console.error(`⚠️ Socket error (${socket.id}):`, error);
    });
  });

  return io;
};

/**
 * Get the initialized socket.io instance
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('WebSocket not initialized');
  }
  return io;
};

/**
 * Broadcast event to all connected clients
 * @param event Event type (e.g., 'mission:status:updated')
 * @param data Event payload
 */
export const broadcast = (event: string, data: unknown): void => {
  try {
    const socketIO = getIO();
    socketIO.emit(event, data);
    console.log(`✅ Broadcast '${event}' to all connected clients`);
  } catch (error) {
    console.warn(`Failed to broadcast event '${event}':`, error);
  }
};

/**
 * Broadcast event to a specific room
 * @param room Room name/ID
 * @param event Event type
 * @param data Event payload
 */
export const broadcastToRoom = (room: string, event: string, data: unknown): void => {
  try {
    const socketIO = getIO();
    socketIO.to(room).emit(event, data);
    console.log(`✅ Broadcast '${event}' to room '${room}'`);
  } catch (error) {
    console.warn(`Failed to broadcast to room '${room}':`, error);
  }
};

/**
 * Get number of connected clients (useful for monitoring)
 */
export const getConnectedClientCount = (): number => {
  if (!io) return 0;
  return io.engine.clientsCount;
};

/**
 * Shutdown WebSocket server gracefully
 */
export const shutdownWebSocketServer = (): void => {
  if (io) {
    io.close();
    console.log('✅ WebSocket server closed');
  }
};

export default { initializeWebSocket, getIO, broadcast, broadcastToRoom };
