import React, { useContext, useState } from 'react';
import type { ReactChildren } from '../types';
import { Alert, Snackbar } from '@mui/material';
import type { AlertProps } from '@mui/material';

export type SnackbarContextType = {
  showSnackbar: (message: string, severity?: AlertProps['severity']) => void;
};

const SnackbarContext = React.createContext<SnackbarContextType | null>(null);

export const SnackbarContextProvider = ({ children }: ReactChildren) => {
  const [open, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertProps['severity']>('error');

  const showSnackbar = (message: string, severity?: AlertProps['severity']) => {
    setMessage(message);
    setSeverity(severity);
    setIsOpen(true);
  };

  const onClose = () => setIsOpen(false);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        autoHideDuration={3000}
        message={message}
        onClose={onClose}
      >
        <Alert severity={severity} onClose={onClose}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbarContext = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('SnackbarContext error');
  }
  return context;
};
