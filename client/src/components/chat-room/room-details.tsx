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
import { useNavigate, useParams } from 'react-router-dom';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthContext } from '../../context/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { useSnackbarContext } from '../../context/snackbar-context';

type RoomDetailsProps = {
  data: Room | undefined;
  sx: SxProps;
};

export const RoomDetails = ({ data, sx }: RoomDetailsProps) => {
  const params = useParams();
  const { user } = useAuthContext();
  if (!data) return null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbarContext();
  const formattedDate = new Date(data.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const hasCreatedRoom = data.createdById === user?.id;
  const deleteRoomMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      const response = await apiClient.delete(`/rooms/${data.id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['my-rooms'] });
      showSnackbar(`Room deleted successfully`, 'success');
    },
    onError: () => {
      showSnackbar(`Room deletion failed`, 'error');
    },
  });
  const handleRemoveRoom = () => {
    deleteRoomMutation.mutate({ id: params.id as string });
    navigate('/');
  };

  return (
    <Card
      sx={{
        ...sx,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
      <CardActions
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
        disableSpacing
      >
        <Button
          variant="outlined"
          color="error"
          onClick={() => navigate('/')}
          endIcon={<MeetingRoomIcon />}
          fullWidth
        >
          Leave room
        </Button>
        {hasCreatedRoom && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleRemoveRoom}
            endIcon={<DeleteIcon />}
            fullWidth
          >
            Remove room
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
