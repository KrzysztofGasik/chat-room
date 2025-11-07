import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuthContext } from '../../context/auth-context';
import { Link, useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import { useSnackbarContext } from '../../context/snackbar-context';
import { useState } from 'react';
import { VisibilityOff, Visibility } from '@mui/icons-material';

export const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { logIn } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await logIn(data.email, data.password);
      showSnackbar('Successfully logged in', 'success');
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error');
      } else {
        showSnackbar('An unknown error occurred', 'error');
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
          slotProps={{
            input: { sx: { color: 'var(--font-color)' } },
            inputLabel: { sx: { color: 'var(--font-color)' } },
          }}
          {...register('email', { required: true })}
        />
        {errors.email && (
          <Typography color="error">Email is required</Typography>
        )}
        <TextField
          label="Your password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          autoComplete="off"
          sx={{ margin: '1rem 0' }}
          {...register('password', { required: true })}
          slotProps={{
            input: {
              sx: { color: 'var(--font-color)' },
              endAdornment: (
                <IconButton
                  title={`${showPassword} ? 'hide the password' : 'display the password'`}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <VisibilityOff sx={{ color: 'var(--font-color)' }} />
                  ) : (
                    <Visibility sx={{ color: 'var(--font-color)' }} />
                  )}
                </IconButton>
              ),
            },
            inputLabel: { sx: { color: 'var(--font-color)' } },
          }}
        />
        {errors.password && (
          <Typography color="error">Password is required</Typography>
        )}
        <Button type="submit" variant="contained" endIcon={<LoginIcon />}>
          Login
        </Button>
      </form>

      <Typography>
        Not registered? Click here to{' '}
        <Link to={'/signup'} style={{ color: 'var(--font-color)' }}>
          register
        </Link>
      </Typography>
    </Box>
  );
};
