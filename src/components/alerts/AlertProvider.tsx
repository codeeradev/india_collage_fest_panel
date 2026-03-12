import { useRef, useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

import { Box, Alert, Snackbar, CircularProgress } from '@mui/material';

type AlertType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface AlertContextType {
  setAlert: (type: AlertType, message: string) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AlertType>('success');
  const [message, setMessage] = useState('');
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    },
    []
  );

  const setAlert = useCallback((alertType: AlertType, msg: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setType(alertType);
    setMessage(msg);
    setOpen(true);

    if (alertType !== 'loading') {
      closeTimeoutRef.current = setTimeout(() => {
        setOpen(false);
        closeTimeoutRef.current = null;
      }, 2500);
    }
  }, []);

  const contextValue = useMemo(() => ({ setAlert }), [setAlert]);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}

      <Snackbar open={open} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {type === 'loading' ? (
          <Box
            sx={{
              background: '#323232',
              color: '#fff',
              px: 3,
              py: 2,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={20} color="inherit" />
            {message}
          </Box>
        ) : (
          <Alert severity={type} variant="filled">
            {message}
          </Alert>
        )}
      </Snackbar>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used inside AlertProvider');
  }
  return context;
}
