import { Badge, Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { Room } from '../../types';

type RoomHeaderProps = {
  data: Room;
};

export const RoomHeader = ({ data }: RoomHeaderProps) => {
  if (!data) return null;
  const activeMembers = data?.roomMember?.length || 0;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <Typography variant="h2">{data?.name}</Typography>
      <Badge badgeContent={activeMembers} color="primary" showZero>
        <Typography>Active members</Typography>
      </Badge>
      <Button variant="contained">
        <Link to="/" style={{ color: '#fff' }}>
          Leave room
        </Link>
      </Button>
    </Box>
  );
};
