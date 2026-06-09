import { io, Socket } from 'socket.io-client';
import { getAuth0Client } from '@spark-nest-ed/frontend-core-auth';

let socket: Socket | null = null;

export const initializeWebSocket = async () => {
  if (socket?.connected) {
    return socket;
  }

  const auth0 = getAuth0Client();
  const token = await auth0.getTokenSilently();

  socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:8000', {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected');
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return socket;
};

export const getWebSocket = () => {
  if (!socket) {
    throw new Error('WebSocket not initialized');
  }
  return socket;
};
