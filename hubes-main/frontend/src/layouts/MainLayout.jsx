import React from 'react';
import { Box } from '@mui/material';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

export const MainLayout = () => {
  const theme = useTheme();
  const sidebarWidth = theme.layout?.sidebarWidth || 280;
  const appBarHeight = theme.layout?.appBarHeight || 72;
  const pagePadding = theme.layout?.pagePadding || 2;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pt: pagePadding,
          pr: pagePadding,
          pb: pagePadding,
          pl: 2,
          mt: `${appBarHeight}px`,
          minHeight: `calc(100vh - ${appBarHeight}px)`,
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
