import React, { useCallback, useContext, useState } from 'react';
import type { ReactChildren } from '../types';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useAuthContext } from './auth-context';

export type SocketContextType = {
  socket: Socket | undefined;
  isConnected: boolean;
  onlineUsers: Set<string>;
  connect: (token: string) => void;
  disconnect: () => void;
};

const SocketContext = React.createContext<SocketContextType | null>(null);

export const SocketContextProvider = ({ children }: ReactChildren) => {
  const { user } = useAuthContext();
  const [socket, setSocket] = useState<Socket>();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineUsers, setOnlineUser] = useState<Set<string>>(new Set());

  const connect = useCallback(
    (token: string) => {
      if (!socket && user) {
        const newSocket = io(
          import.meta.env.VITE_API_URL || 'http://localhost:3000',
          {
            auth: { token: token },
            autoConnect: false,
            transports: ['websocket'],
          }
        );
        setSocket(newSocket);
        newSocket.connect();

        newSocket.on('connect', () => {
          setIsConnected(true);
        });
        newSocket.on('disconnect', () => {
          setIsConnected(false);
        });

        newSocket.on('online_users_list', ({ userIds }) => {
          setOnlineUser(new Set(userIds));
        });

        newSocket.on('user_online', ({ userId }) => {
          setOnlineUser((prev) => {
            const newSet = new Set(prev);
            newSet.add(userId);
            return newSet;
          });
        });

        newSocket.on('user_offline', ({ userId }) => {
          setOnlineUser((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        });
      } else {
        socket?.connect();
      }
    },
    [socket, user]
  );

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setIsConnected(false);
      setOnlineUser(new Set());
    }
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        connect,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('Context error');
  }
  return context;
};
