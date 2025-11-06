import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
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
    formState: { errors },
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
        />
        {errors.username && (
          <Typography color="error">Username is required</Typography>
        )}
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
          helperText={
            <Typography sx={{ color: 'var(--font-color)' }}>
              Min 8 chars: uppercase, lowercase, number & special character
            </Typography>
          }
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
        {errors.password?.type === 'required' && (
          <Typography color="error">Password is required</Typography>
        )}
        {errors.password?.type === 'pattern' && (
          <Typography color="error">
            {String(errors.password.message)}
          </Typography>
        )}
        <Button type="submit" variant="contained" endIcon={<HowToRegIcon />}>
          Sign up
        </Button>
      </form>

      <Typography>
        Already registered? Click here to{' '}
        <Link to={'/signin'} style={{ color: 'var(--font-color)' }}>
          login
        </Link>
      </Typography>
    </Box>
  );
};
