import { useParams } from 'react-router-dom';
import { RoomDetails } from '../components/chat-room/room-details';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { MessageList } from '../components/chat-room/message-list';
import type { Message, Room } from '../types';
import { MessageInput } from '../components/chat-room/message-input';
import { useSocketRoom } from '../hooks/useSocketRoom';
import { useEffect, useState } from 'react';
import { MembersList } from '../components/chat-room/members-list';
import { useSnackbarContext } from '../context/snackbar-context';

export const ChatRoomPage = () => {
  const params = useParams();
  const { showSnackbar } = useSnackbarContext();
  const [userMap, setUserMap] = useState<Map<string, string>>(new Map());
  const { data, isLoading, isError } = useQuery<Room>({
    queryKey: ['get-room', params.id],
    queryFn: async () => {
      const res = await apiClient.get(`/rooms/${params.id}`);
      return res.data;
    },
  });

  const {
    data: messageData,
    isLoading: messageLoading,
    isError: messageError,
  } = useQuery<{
    messages: Message[];
  }>({
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
    showSnackbar('Failed to fetch the room info');
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">Failed to load room</Typography>
      </Box>
    );
  }

  if (messageError) {
    showSnackbar('Failed to fetch the messages info');
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">Failed to load messages</Typography>
      </Box>
    );
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

  const roomId = data?.id;

  return (
    <Container maxWidth="lg" sx={{ height: '100%' }}>
      <Grid container sx={{ height: '100%' }} spacing={1}>
        <Grid size={{ xs: 12, md: 3 }}>
          <RoomDetails
            data={data}
            sx={{
              flex: '1 0 200px',
              position: { xs: 'static', md: 'sticky' },
              top: '64px',
              maxHeight: '100vh',
              overflowY: { xs: 'hidden', md: 'auto' },
            }}
          />
        </Grid>
        <Divider />
        <Grid size={{ xs: 6, md: 2 }}>
          <MembersList
            members={data?.roomMember}
            sx={{
              position: { xs: 'static', md: 'sticky' },
              top: '64px',
              maxHeight: '100vh',
              overflowY: { xs: 'hidden', md: 'auto' },
              display: { xs: 'none', md: 'block' },
            }}
          />
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 3,
              overflowY: 'auto',
              minHeight: 0,
            }}
          >
            <MessageList
              isLoading={messageLoading}
              data={messageData?.messages || []}
              sx={{}}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
            }}
          >
            {getTypingText() && (
              <Typography
                variant="body1"
                sx={{ fontStyle: 'italic', color: 'gray' }}
              >
                {getTypingText()}
              </Typography>
            )}
            <MessageInput roomId={roomId} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
