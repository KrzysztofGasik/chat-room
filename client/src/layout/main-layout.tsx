import { Box } from '@mui/material';
import type { ReactChildren } from '../types';

export const MainLayout = ({ children }: ReactChildren) => {
  return (
    <Box
      sx={{
        marginTop: { xs: '56px', md: '64px' },
        height: { xs: 'auto', md: 'calc(100vh - 64px)' },
        color: 'var(--font-color)',
      }}
    >
      {children}
    </Box>
  );
};
