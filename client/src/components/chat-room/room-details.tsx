import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  type SxProps,
} from '@mui/material';
import type { Room } from '../../types';
import { useNavigate } from 'react-router-dom';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

type RoomDetailsProps = {
  data: Room | undefined;
  sx: SxProps;
};

export const RoomDetails = ({ data, sx }: RoomDetailsProps) => {
  if (!data) return null;
  const navigate = useNavigate();
  const formattedDate = new Date(data.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <Card
      sx={{
        ...sx,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <CardContent>
        <Typography variant="h4">Room: {data?.name}</Typography>
        <Typography variant="h5">
          Description: {data?.description || '-'}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemText
              primary={`Created at: ${formattedDate}`}
              slotProps={{ primary: { variant: 'caption' } }}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText
              primary={`Created by: ${data?.createdBy?.username}`}
              slotProps={{ primary: { variant: 'caption' } }}
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 1 }} />
      </CardContent>
      <CardActions>
        <Button
          variant="outlined"
          color="error"
          onClick={() => navigate('/')}
          endIcon={<MeetingRoomIcon />}
        >
          Leave room
        </Button>
      </CardActions>
    </Card>
  );
};
