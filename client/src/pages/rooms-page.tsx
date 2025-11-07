import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import type { Room } from '../types';
import { RoomItem } from '../components/room-item';
import { useState } from 'react';
import { CreateRoomDialog } from '../components/create-room-dialog';
import { useAuthContext } from '../context/auth-context';
import AddIcon from '@mui/icons-material/Add';

export const RoomsPage = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user } = useAuthContext();
  const { data, isLoading } = useQuery({
    queryKey: ['get-all-rooms'],
    queryFn: async () => {
      const res = await apiClient.get('/rooms');
      return res.data;
    },
  });
  const { data: myRooms } = useQuery({
    queryKey: ['my-rooms', user?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/rooms?userId=${user?.id}`);
      return res.data;
    },
    enabled: !!user,
  });

  const myRoomIds = new Set(myRooms?.map((room: Room) => room.id) || []);

  if (isLoading) {
    return <CircularProgress />;
  }
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '50vh',
          gap: 2,
        }}
      >
        <Typography variant="h5">No rooms found</Typography>
        <Button
          variant="contained"
          onClick={() => setIsOpen(true)}
          sx={{ margin: 1 }}
        >
          Create a room
        </Button>
        <CreateRoomDialog onClose={() => setIsOpen(false)} open={isOpen} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box>
        <Typography>
          You are logged as <b>{user?.username.toUpperCase()}</b>
        </Typography>
        <Button
          variant="contained"
          onClick={() => setIsOpen(true)}
          sx={{ margin: 1 }}
          endIcon={<AddIcon sx={{ color: 'var(--font-color)' }} />}
        >
          Create a room
        </Button>
      </Box>
      <Stack spacing={2}>
        {data.map((room: Room) => (
          <RoomItem
            room={room}
            key={room.id}
            isMember={myRoomIds.has(room.id)}
          />
        ))}
      </Stack>
      <CreateRoomDialog onClose={() => setIsOpen(false)} open={isOpen} />
    </Box>
  );
};
