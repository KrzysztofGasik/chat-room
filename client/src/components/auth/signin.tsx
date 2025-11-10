import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
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
    formState: { errors, isSubmitting },
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
          helperText={errors.email ? 'Email is required' : ''}
          error={!!errors.email}
        />
        <TextField
          label="Your password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          autoComplete="off"
          sx={{ margin: '1rem 0' }}
          {...register('password', { required: true })}
          helperText={errors.password ? 'Password is required' : ''}
          error={!!errors.password}
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
        <Button
          type="submit"
          variant="contained"
          endIcon={<LoginIcon sx={{ color: 'var(--font-color)' }} />}
          disabled={isSubmitting}
        >
          Login
        </Button>
      </form>
      {isSubmitting && (
        <Box sx={{ margin: '1rem auto' }}>
          <CircularProgress />
        </Box>
      )}
      <Typography>
        Not registered? Click here to{' '}
        <Link to={'/signup'} style={{ color: 'var(--font-color)' }}>
          register
        </Link>
      </Typography>
    </Box>
  );
};
