import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  LinearProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useServerStatus, type ServerStatus } from '../hooks/useServerStatus';
import RefreshIcon from '@mui/icons-material/Refresh';

const getStatusMessage = (
  status: ServerStatus
): { title: string; message: string } => {
  switch (status) {
    case 'checking':
      return {
        title: 'Checking server status...',
        message: 'Please wait while we verify the server connection.',
      };
    case 'waking':
      return {
        title: 'Server is waking up',
        message:
          'The server is starting up (this may take up to 60 seconds on free tier). Please wait...',
      };
    case 'offline':
      return {
        title: 'Server is offline',
        message:
          'Unable to connect to the server. Please try again in a moment.',
      };
    case 'online':
      return {
        title: 'Server is online',
        message: 'All systems operational!',
      };
    default:
      return {
        title: 'Unknown status',
        message: '',
      };
  }
};

const getSeverity = (
  status: ServerStatus
): 'info' | 'warning' | 'error' | 'success' => {
  switch (status) {
    case 'checking':
      return 'info';
    case 'waking':
      return 'warning';
    case 'offline':
      return 'error';
    case 'online':
      return 'success';
    default:
      return 'info';
  }
};

export const ServerStatusBanner = () => {
  const { status, checkServerStatus } = useServerStatus();
  const [showBanner, setShowBanner] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show banner for non-online statuses
    if (status !== 'online' || !dismissed) {
      setShowBanner(true);
    }

    // Auto-dismiss after 5 seconds
    if (status === 'online' && !dismissed) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, dismissed]);

  // Don't show banner if it's been dismissed and server is online
  if (dismissed && status === 'online') {
    return null;
  }

  const { title, message } = getStatusMessage(status);
  const severity = getSeverity(status);
  const showProgress = status === 'checking' || status === 'waking';

  return (
    <Collapse in={showBanner}>
      <Alert
        severity={severity}
        onClose={() => {
          setDismissed(true);
          setShowBanner(false);
        }}
        action={
          status !== 'online' ? (
            <Button
              color="inherit"
              size="small"
              onClick={checkServerStatus}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          ) : undefined
        }
        sx={{
          borderRadius: 0,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
        {showProgress && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <LinearProgress />
          </Box>
        )}
      </Alert>
    </Collapse>
  );
};
