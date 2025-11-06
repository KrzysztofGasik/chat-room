import { Avatar, Badge, Box, Stack, Typography } from '@mui/material';
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
    <Stack
      sx={{
        position: 'relative',
        margin: '10px 0 0 30px',
        minWidth: '200px',
        display: 'flex',
      }}
    >
      <Badge
        variant="dot"
        color={`${isOnline ? 'success' : 'error'}`}
        sx={{
          position: 'absolute',
          left: -25,
          top: -15,
          '& .MuiBadge-dot': {
            height: 10,
            minWidth: 10,
            borderRadius: 10,
          },
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Avatar alt="avatar" src={`${user?.avatar}`} />
      </Badge>
      <Box
        sx={{
          backgroundColor: message.userId === user?.id ? '#1976d2' : '#2e7d32',
          padding: 1,
          borderRadius: 2,
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <Typography>{message.content}</Typography>
      </Box>
    </Stack>
  );
};
