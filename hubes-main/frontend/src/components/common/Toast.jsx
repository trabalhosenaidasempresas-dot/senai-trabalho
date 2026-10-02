import React, { useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';

export const Toast = ({ open, onClose, message, severity = 'info', autoHideDuration = 4000 }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%', borderRadius: 2 }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
