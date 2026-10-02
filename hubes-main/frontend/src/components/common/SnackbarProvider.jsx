import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const SnackbarContext = createContext(null);

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, message: '', severity: 'info', liveText: '' });

  const show = useCallback((message, severity = 'info') => {
    setState({ open: true, message, severity, liveText: message });
  }, []);

  const handleClose = () => setState((s) => ({ ...s, open: false }));

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      <div
        data-testid="app-live-region"
        role="status"
        aria-live="polite"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}
      >
        {state.liveText}
      </div>
      <Snackbar open={state.open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleClose} severity={state.severity} sx={{ width: '100%' }}>
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;
