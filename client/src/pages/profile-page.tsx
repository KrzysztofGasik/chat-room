import { useForm } from 'react-hook-form';
import { useAuthContext } from '../context/auth-context';
import { Box, Button, TextField } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useSnackbarContext } from '../context/snackbar-context';
import SaveIcon from '@mui/icons-material/Save';

export const ProfilePage = () => {
  const { user, updateUser } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const queryClient = useQueryClient();
  const {
    register,
    reset,
    handleSubmit,
    formState: { dirtyFields },
  } = useForm({
    defaultValues: {
      username: user?.username,
      email: user?.email,
      avatar: user?.avatar,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username: string; avatar?: string }) => {
      const response = await apiClient.patch(`/users/${user?.id}`, data);
      return response.data;
    },
    onSuccess: (data: { username: string; avatar?: string }) => {
      updateUser(data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      showSnackbar('Profile updated successfully', 'success');
      reset();
    },
    onError: () => {
      showSnackbar('Failed to update profile', 'error');
    },
  });

  const onSubmit = handleSubmit((data) => {
    updateProfileMutation.mutate({
      username: data.username as string,
      avatar: data.avatar as string,
    });
  });
  const isFormEdited = Object.keys(dirtyFields).length === 0;

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}
      maxWidth="xs"
    >
      <form onSubmit={onSubmit}>
        <TextField
          label="Your username"
          type="text"
          fullWidth
          sx={{ margin: '1rem 0' }}
          slotProps={{
            input: { sx: { color: 'var(--font-color)' } },
            inputLabel: { sx: { color: 'var(--font-color)' } },
          }}
          {...register('username', { required: true })}
        />
        <TextField
          label="Your email"
          type="email"
          fullWidth
          sx={{ margin: '1rem 0' }}
          disabled
          slotProps={{
            input: { sx: { color: 'var(--font-color)' } },
            inputLabel: { sx: { color: 'var(--font-color)' } },
          }}
          {...register('email')}
        />
        <TextField
          label="Your avatar url"
          fullWidth
          sx={{ margin: '1rem 0' }}
          slotProps={{
            input: {
              sx: {
                color: 'var(--font-color)',
                borderColor: 'var(--font-color) !important',
              },
            },
            inputLabel: { sx: { color: 'var(--font-color)' } },
          }}
          {...register('avatar')}
        />
        <Button
          type="submit"
          variant="contained"
          endIcon={<SaveIcon sx={{ color: 'var(--font-color)' }} />}
          disabled={isFormEdited}
        >
          Save changes
        </Button>
      </form>
    </Box>
  );
};
