import { useAuthContext } from '../context/auth-context';
import { CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import type { ReactChildren } from '../types';

export const ProtectedRoute = ({ children }: ReactChildren) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return <CircularProgress />;
  }
  if (!user) {
    return <Navigate to="/signin" />;
  }

  return <>{children}</>;
};
