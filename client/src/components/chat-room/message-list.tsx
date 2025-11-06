import {
  Box,
  CircularProgress,
  List,
  ListItem,
  Typography,
  type SxProps,
} from '@mui/material';
import type { Message } from '../../types';
import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';

type MessageListProps = {
  isLoading: boolean;
  data: Message[];
  sx: SxProps;
};

export const MessageList = ({ isLoading, data, sx }: MessageListProps) => {
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    lastMessageRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="info">No messages yet</Typography>
      </Box>
    );
  }

  return (
    <List
      sx={{
        ...sx,
        maxHeight: '100%',
        margin: '0 auto',
      }}
    >
      {[...data].reverse().map((message: Message) => (
        <ListItem key={message.id}>
          <MessageBubble message={message} />
        </ListItem>
      ))}
      <div ref={lastMessageRef} />
    </List>
  );
};
