import { createTheme } from '@mui/material/styles';

// Cores base - iguais para ambos os temas
const primaryColor = '#104953';
const secondaryColor = '#198fa1';
const successColor = '#2e7d32';
const warningColor = '#f59e0b';
const errorColor = '#d32f2f';

const layoutConfig = {
  sidebarWidth: 280,
  sidebarCollapsedWidth: 72,
  appBarHeight: 72,
  pagePadding: 2,
};

// Tema Claro
export const lightTheme = createTheme({
  layout: layoutConfig,
  palette: {
    mode: 'light',
    primary: {
      light: '#3e8a96',
      main: primaryColor,
      dark: '#0a323f',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#1fa6b7',
      main: secondaryColor,
      dark: '#136973',
      contrastText: '#ffffff',
    },
    success: { main: successColor },
    warning: { main: warningColor },
    error: { main: errorColor },
    background: {
      default: '#eef4f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#102431',
      secondary: '#4f6570',
    },
    divider: 'rgba(16, 36, 49, 0.12)',
    action: {
      hover: 'rgba(16, 73, 83, 0.08)',
      selected: 'rgba(16, 73, 83, 0.12)',
    },
  },
  shape: { borderRadius: 14 },
  spacing: 8,
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          backgroundColor: '#eef4f6',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#102431',
          borderBottom: '1px solid rgba(16, 36, 49, 0.08)',
          boxShadow: '0 10px 30px rgba(15, 21, 32, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

// Tema Escuro
export const darkTheme = createTheme({
  layout: layoutConfig,
  palette: {
    mode: 'dark',
    primary: {
      light: '#5a9ba7',
      main: '#2d7a88',
      dark: '#1a4f59',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#4db8c4',
      main: '#2b9caa',
      dark: '#1f6f7a',
      contrastText: '#ffffff',
    },
    success: { main: '#4caf50' },
    warning: { main: '#ffa726' },
    error: { main: '#ef5350' },
    background: {
      default: '#0f1419',
      paper: '#1a1f26',
    },
    text: {
      primary: '#e8f0f3',
      secondary: '#a8b5bc',
    },
    divider: 'rgba(232, 240, 243, 0.12)',
    action: {
      hover: 'rgba(45, 122, 136, 0.12)',
      selected: 'rgba(45, 122, 136, 0.20)',
    },
  },
  shape: { borderRadius: 14 },
  spacing: 8,
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          backgroundColor: '#0f1419',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: '#1a1f26',
          color: '#e8f0f3',
          borderBottom: '1px solid rgba(232, 240, 243, 0.12)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1a1f26',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1f26',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
        outlined: {
          borderColor: 'rgba(232, 240, 243, 0.23)',
          '&:hover': {
            borderColor: 'rgba(232, 240, 243, 0.40)',
            backgroundColor: 'rgba(232, 240, 243, 0.04)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(232, 240, 243, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1f26',
          borderColor: 'rgba(232, 240, 243, 0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(232, 240, 243, 0.12)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#2d7a88',
          },
        },
      },
    },
  },
});

export default { lightTheme, darkTheme };
