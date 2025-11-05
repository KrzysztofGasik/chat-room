import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Room } from '../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

type RoomProps = {
  room: Room;
  isMember: boolean;
};

export const RoomItem = ({ room, isMember }: RoomProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/rooms/${room.id}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['all-rooms'] });
    },
  });

  const handleJoin = () => {
    joinMutation.mutate();
  };

  const handleEnterRoom = () => navigate(`/rooms/${room.id}`);
  return (
    <Card>
      <CardContent>
        <Typography>Room name: {room.name}</Typography>
        <Typography>Room description: {room.description}</Typography>
        <Typography>Room active members: {room._count?.roomMember}</Typography>
      </CardContent>
      <CardActions>
        {isMember ? (
          <Button onClick={handleEnterRoom}>Enter</Button>
        ) : (
          <Button onClick={handleJoin}>Join</Button>
        )}
      </CardActions>
    </Card>
  );
};
