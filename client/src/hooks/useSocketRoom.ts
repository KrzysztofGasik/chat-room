import { useEffect, useState } from 'react';
import { useSocketContext } from '../context/socket-context';
import { useAuthContext } from '../context/auth-context';
import { useQueryClient } from '@tanstack/react-query';

export const useSocketRoom = (roomId: string) => {
  const { socket, connect, disconnect } = useSocketContext();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { user, token } = useAuthContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (token) {
      connect(token);
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      socket.emit('join_room', roomId);
    };

    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    };

    const handleUserStartTyping = (data: { userId: string }) => {
      if (data.userId !== user?.id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.add(data.userId);
          return newSet;
        });
      }
    };
    const handleUserStoppedTyping = (data: { userId: string }) => {
      if (data.userId !== user?.id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('new_message', handleNewMessage);
    socket.on('user_start_typing', handleUserStartTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('new_message', handleNewMessage);
      socket.off('user_start_typing', handleUserStartTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
      socket.emit('leave_room', roomId);
    };
  }, [socket, roomId, queryClient, user]);

  return { typingUsers };
};
