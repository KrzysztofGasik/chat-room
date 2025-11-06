import { Box, Button, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuthContext } from '../../context/auth-context';
import { Link, useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import { useSnackbarContext } from '../../context/snackbar-context';

export const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { logIn } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await logIn(data.email, data.password);
      showSnackbar('Successfully logged in', 'success');
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(error.message);
      } else {
        showSnackbar('An unknown error occurred');
      }
    }
  });

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}
      maxWidth="xs"
    >
      <form onSubmit={onSubmit}>
        <TextField
          label="Your email"
          type="email"
          fullWidth
          autoComplete="off"
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
          autoComplete="off"
          sx={{ margin: '1rem 0' }}
          {...register('password', { required: true })}
        />
        {errors.password && (
          <Typography color="error">Password is required</Typography>
        )}
        <Button type="submit" variant="contained" endIcon={<LoginIcon />}>
          Login
        </Button>
      </form>

      <Typography>
        Not registered? Click here to <Link to={'/signup'}>register</Link>
      </Typography>
    </Box>
  );
};
