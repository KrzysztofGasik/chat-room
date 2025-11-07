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
import { useSnackbarContext } from '../context/snackbar-context';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';

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
  const { showSnackbar } = useSnackbarContext();

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
    onSuccess: (data: { name: string; description?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['get-all-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['my-rooms'] });
      showSnackbar(`Room ${data.name} created successfully`, 'success');
      reset();
      onClose();
    },
    onError: (data: { name: string; description?: string }) => {
      showSnackbar(`Room ${data.name} creation failed`, 'error');
    },
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg">
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
            {...register('name', {
              required: true,
            })}
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
            <Button
              onClick={onClose}
              variant="contained"
              endIcon={<CancelIcon sx={{ color: 'var(--font-color)' }} />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              endIcon={
                <AddCircleOutlineIcon sx={{ color: 'var(--font-color)' }} />
              }
            >
              Create
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};
