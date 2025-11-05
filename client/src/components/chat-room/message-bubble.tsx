import { Badge, Box, Typography } from '@mui/material';
import type { Message } from '../../types';
import { useAuthContext } from '../../context/auth-context';
import { useSocketContext } from '../../context/socket-context';

type MessageBubbleProps = {
  message: Message;
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { user } = useAuthContext();
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.has(message.userId);
  return (
    <Badge variant="dot" color={`${isOnline ? 'success' : 'error'}`}>
      <Box
        sx={{
          backgroundColor: message.userId === user?.id ? '#1976d2' : '#2e7d32',
          padding: 1,
          borderRadius: 2,
          color: '#fff',
        }}
      >
        <Typography>{message.content}</Typography>
      </Box>
    </Badge>
  );
};
