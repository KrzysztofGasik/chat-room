import { useForm } from 'react-hook-form';
import { useAuthContext } from '../context/auth-context';
import { Box, Button, TextField } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export const ProfilePage = () => {
  const { user } = useAuthContext();
  const { register, reset, handleSubmit } = useForm({
    defaultValues: {
      username: user?.username,
      email: user?.email,
      avatar: user?.avatar,
    },
  });

  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username: string; avatar?: string }) => {
      const response = await apiClient.patch(`/users/${user?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      reset();
    },
  });

  const onSubmit = handleSubmit((data) => {
    updateProfileMutation.mutate({
      username: data.username as string,
      avatar: data.avatar as string,
    });
  });

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
          {...register('username', { required: true })}
        />
        <TextField
          label="Your email"
          type="email"
          fullWidth
          sx={{ margin: '1rem 0' }}
          disabled
          {...register('email')}
        />
        <TextField
          label="Your avatar url"
          fullWidth
          sx={{ margin: '1rem 0' }}
          {...register('avatar')}
        />
        <Button type="submit" variant="contained">
          Save changes
        </Button>
      </form>
    </Box>
  );
};
