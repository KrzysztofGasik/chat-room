import { CircularProgress, List, ListItem } from '@mui/material';
import type { Message } from '../../types';
import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';

type MessageListProps = {
  isLoading: boolean;
  data: Message[];
};

export const MessageList = ({ isLoading, data }: MessageListProps) => {
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    lastMessageRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <List sx={{ maxHeight: '100%', overflow: 'auto' }}>
      {[...data].reverse().map((message: Message) => (
        <ListItem key={message.id}>
          <MessageBubble message={message} />
        </ListItem>
      ))}
      <div ref={lastMessageRef} />
    </List>
  );
};
