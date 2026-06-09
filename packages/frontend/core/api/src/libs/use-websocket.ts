// libs/shared/api/src/lib/use-websocket.ts
import { useEffect, useState } from 'react';
import { getWebSocket } from './websocket-client';

export const useWebSocketEvent = <T>(event: string) => {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const socket = getWebSocket();

    const handler = (payload: T) => {
      setData(payload);
    };

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [event]);

  return data;
};
