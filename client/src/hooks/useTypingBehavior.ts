import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocketContext } from '../context/socket-context';

export const useTypingBehavior = (roomId: string) => {
  const { socket } = useSocketContext();
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      socket?.emit('typing_start', roomId);
      setIsTyping(true);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing_stop', roomId);
      setIsTyping(false);
    }, 2000);
  }, [isTyping, socket, roomId]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      socket?.emit('typing_stop', roomId);
      setIsTyping(false);
    }
  }, [isTyping, socket, roomId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  });

  return { handleTyping, stopTyping };
};
