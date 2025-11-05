import { Box, Button, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuthContext } from '../../context/auth-context';
import { Link, useNavigate } from 'react-router-dom';

export const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { register: signUp } = useAuthContext();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signUp(data.username, data.email, data.password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
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
        {errors.username && (
          <Typography color="error">Username is required</Typography>
        )}
        <TextField
          label="Your email"
          type="email"
          fullWidth
          sx={{ margin: '1rem 0' }}
          {...register('email', { required: true })}
        />
        {errors.email && (
          <Typography color="error">Email is required</Typography>
        )}
        <TextField
          label="Your password"
          type="password"
          fullWidth
          sx={{ margin: '1rem 0' }}
          {...register('password', { required: true })}
        />
        {errors.password && (
          <Typography color="error">Password is required</Typography>
        )}
        <Button type="submit" variant="contained">
          Sign up
        </Button>
      </form>

      <Typography>
        Already registered? Click here to <Link to={'/signin'}>login</Link>
      </Typography>
    </Box>
  );
};
