import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import useResponsive from '../hooks/useResponsive';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  InputBase,
  Badge,
  Tooltip as MuiTooltip,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import logo from '../1logo.jpeg';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationPanel from './common/NotificationPanel';

export const Navbar = () => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const { usuario, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const notificationCount = 6;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'Dashboard', to: '/dashboard' },
    ...pathSegments.map((segment, index) => {
      const to = '/' + pathSegments.slice(0, index + 1).join('/');
      return { label: segment.charAt(0).toUpperCase() + segment.slice(1), to };
    }),
  ];

  const iconButtonStyles = {
    width: 44,
    height: 44,
    borderRadius: '50%',
    transition: 'transform 0.25s ease, background-color 0.25s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(16,73,83,0.12)',
    },
  };

  const menuButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 0.75,
    py: 0.35,
    borderRadius: 999,
    border: `1px solid ${theme.palette.divider}`,
    bgcolor:
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(255,255,255,0.88)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      bgcolor:
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(16,73,83,0.1)',
    },
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backdropFilter: 'blur(18px)',
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(12, 18, 30, 0.82)'
            : 'rgba(255, 255, 255, 0.78)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: isScrolled
          ? '0 24px 100px rgba(15, 21, 32, 0.14)'
          : '0 0 0 rgba(0,0,0,0)',
        transition: 'all 0.28s ease',
        zIndex: theme.zIndex.drawer + 2,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          py: isMobile ? 1.25 : 1.5,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flex: 1,
            minWidth: 0,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="SECULT"
            sx={{ height: 44, width: 'auto', maxWidth: 160, maxHeight: 48 }}
          />

          {!isMobile && (
            <Typography variant="h6" sx={{ fontWeight: 700, whiteSpace: 'nowrap', color: 'text.primary' }}>
              SIGA Secult
            </Typography>
          )}

          <Box
            component="form"
            onSubmit={(e) => e.preventDefault()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: isMobile ? '0 1 auto' : '1 1 420px',
              minWidth: 0,
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '100%' : 420,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(255, 255, 255, 0.92)',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 999,
              px: 1.25,
              py: 0.5,
              backdropFilter: 'blur(12px)',
            }}
          >
            <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
            <InputBase
              placeholder="Buscar projetos, documentos..."
              sx={{
                ml: 1,
                flex: 1,
                color: 'text.primary',
                fontSize: '0.95rem',
                minWidth: 0,
              }}
              inputProps={{ 'aria-label': 'Buscar' }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <MuiTooltip title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}>
            <IconButton onClick={toggleTheme} sx={iconButtonStyles}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </MuiTooltip>

          <IconButton
            color="inherit"
            onClick={() => setNotificationPanelOpen(true)}
            sx={iconButtonStyles}
          >
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box onClick={handleOpenMenu} sx={menuButtonStyles}>
            <Avatar
              sx={{
                width: 46,
                height: 46,
                bgcolor: 'secondary.main',
                fontSize: '1rem',
              }}
            >
              {usuario?.nome?.charAt(0) ?? 'U'}
            </Avatar>
            {!isMobile && (
              <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}
                >
                  {usuario?.nome ?? 'Usuário'}
                </Typography>
                <Typography noWrap sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  Administrador
                </Typography>
              </Box>
            )}
            {!isMobile && <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />}
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 3,
                minWidth: 240,
                p: 1,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 22px 60px rgba(0,0,0,0.4)'
                  : '0 16px 42px rgba(15,21,32,0.12)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, mb: 1, borderRadius: 2, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(16,73,83,0.04)' }}>
              <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
                {usuario?.nome ?? 'Usuário'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Administrador do sistema
              </Typography>
            </Box>
            <MenuItem onClick={() => navigate('/perfil')} sx={{ borderRadius: 2, mb: 0.5 }}>
              Meu Perfil
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ borderRadius: 2 }}>
              Sair
            </MenuItem>
          </Menu>
        </Box>

        <NotificationPanel open={notificationPanelOpen} onClose={() => setNotificationPanelOpen(false)} />
      </Toolbar>
    </AppBar>
  );
};
