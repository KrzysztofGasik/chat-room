import { Box } from '@mui/material';
import type { ReactChildren } from '../types';

export const AuthLayout = ({ children }: ReactChildren) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
};
