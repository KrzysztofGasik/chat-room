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
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { useSnackbarContext } from '../../context/snackbar-context';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import { useState } from 'react';

export const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { register: signUp } = useAuthContext();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbarContext();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signUp(data.username, data.email, data.password);
      showSnackbar('Successfully registered', 'success');
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
          label="Your username"
          type="text"
          fullWidth
          autoComplete="off"
          sx={{ margin: '1rem 0' }}
          slotProps={{
            input: { sx: { color: 'var(--font-color)' } },
            inputLabel: { sx: { color: 'var(--font-color)' } },
          }}
          {...register('username', { required: true })}
          helperText={errors.username ? 'Username is required' : ''}
          error={!!errors.username}
        />

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
          helperText={
            errors.password?.type === 'required'
              ? 'Password is required'
              : errors.password?.type === 'pattern'
              ? String(errors.password.message)
              : 'Min 8 chars: uppercase, lowercase, number & special character'
          }
          error={!!errors.password}
          sx={{ margin: '1rem 0' }}
          {...register('password', {
            required: true,
            pattern: {
              value:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message:
                'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
            },
          })}
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
          endIcon={<HowToRegIcon sx={{ color: 'var(--font-color)' }} />}
          disabled={isSubmitting}
        >
          Sign up
        </Button>
      </form>
      {isSubmitting && (
        <Box sx={{ margin: '1rem auto' }}>
          <CircularProgress />
        </Box>
      )}
      <Typography>
        Already registered? Click here to{' '}
        <Link to={'/signin'} style={{ color: 'var(--font-color)' }}>
          login
        </Link>
      </Typography>
    </Box>
  );
};
