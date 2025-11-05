import { useParams } from 'react-router-dom';
import { RoomHeader } from '../components/chat-room/room-header';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { CircularProgress, Typography } from '@mui/material';
import { MessageList } from '../components/chat-room/message-list';
import type { Message, Room } from '../types';
import { MessageInput } from '../components/chat-room/message-input';
import { useSocketRoom } from '../hooks/useSocketRoom';
import { useEffect, useState } from 'react';

export const ChatRoomPage = () => {
  const params = useParams();
  const [userMap, setUserMap] = useState<Map<string, string>>(new Map());
  const { data, isLoading, isError } = useQuery({
    queryKey: ['get-room', params.id],
    queryFn: async () => {
      const res = await apiClient.get(`/rooms/${params.id}`);
      return res.data;
    },
  });

  const { data: messageData, isLoading: messageLoading } = useQuery({
    queryKey: ['messages', params.id],
    queryFn: async () => {
      const res = await apiClient.get(`/rooms/${params.id}/messages`);
      return res.data;
    },
    enabled: !!params.id,
  });

  useEffect(() => {
    const newMap = new Map<string, string>();
    if (!messageData?.messages) return;
    messageData.messages.forEach((message: Message) => {
      if (message.user) {
        newMap.set(message.user.id, message.user.username);
      }
    });
    setUserMap(newMap);
  }, [messageData]);

  const { typingUsers } = useSocketRoom(params?.id as string);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <p>Error</p>;
  }

  const getTypingText = () => {
    const typingUsernames = Array.from(typingUsers)
      .map((userId) => userMap.get(userId) || 'Someone')
      .filter((name) => name !== 'Someone'); // Only show if we know the name

    if (typingUsernames.length === 0) return null;

    return `${typingUsernames.join(', ')} ${
      typingUsernames.length === 1 ? 'is' : 'are'
    } typing...`;
  };

  const roomId = (data as Room).id;

  return (
    <>
      <RoomHeader data={data} />
      <MessageList
        isLoading={messageLoading}
        data={messageData?.messages || []}
      />
      {getTypingText() && (
        <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'gray' }}>
          {getTypingText()}
        </Typography>
      )}
      <MessageInput roomId={roomId} />
    </>
  );
};
