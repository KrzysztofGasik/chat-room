import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  type DialogProps,
} from '@mui/material';
import { useForm } from 'react-hook-form';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

type CreateRoomDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const CreateRoomDialog = ({ open, onClose }: CreateRoomDialogProps) => {
  const handleClose: DialogProps['onClose'] = (_, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    onClose();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = handleSubmit((data) => {
    createRoomMutation.mutate({
      name: data.name,
      description: data.description || undefined,
    });
  });

  const queryClient = useQueryClient();

  const createRoomMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await apiClient.post('/rooms', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['my-rooms'] });
      reset();
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography>Create new room</Typography>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <TextField
            label="Room name"
            type="text"
            fullWidth
            sx={{ margin: '1rem 0' }}
            {...register('name', { required: true })}
          />
          {errors.name && (
            <Typography color="error">Room name is required</Typography>
          )}
          <TextField
            label="Room description"
            type="text"
            fullWidth
            sx={{ margin: '1rem 0' }}
            {...register('description')}
          />
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};
