import React, { useContext, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './debug.js'; // Debug logging
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationContext, NotificationProvider } from './contexts/NotificationContext';
import ThemeContextProvider, { ThemeContext } from './contexts/ThemeContext';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import SnackbarProvider from './components/common/SnackbarProvider';
import { lightTheme, darkTheme } from './themes/themes';
import { Toast } from './components/common/Toast';

// Componente para exibir o Toast
function ToastWrapper() {
  const { notification, closeNotification } = useContext(NotificationContext);
  return (
    <Toast
      open={notification.open}
      onClose={closeNotification}
      message={notification.message}
      severity={notification.severity}
    />
  );
}

// Wrapper para aplicar o tema do contexto
function AppWithTheme() {
  const { isDarkMode } = useContext(ThemeContext);
  const muiTheme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <SnackbarProvider>
        <AuthProvider>
          <ToastWrapper />
          <App />
        </AuthProvider>
      </SnackbarProvider>
    </MuiThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <NotificationProvider>
        <AppWithTheme />
      </NotificationProvider>
    </ThemeContextProvider>
  </React.StrictMode>,
);
