import React, { useEffect, useState } from 'react';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ChatIcon from '@mui/icons-material/Chat';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const width = theme.layout?.sidebarWidth || 280;

  const groups = [
    {
      label: 'Geral',
      items: [
        { to: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
        { to: '/home', icon: <HomeIcon />, label: 'Home' },
      ],
    },
    {
      label: 'Gestão',
      items: [
        { to: '/documentos', icon: <DescriptionIcon />, label: 'Documentos' },
        { to: '/compras', icon: <ShoppingCartIcon />, label: 'Compras' },
        { to: '/estoque', icon: <Inventory2Icon />, label: 'Estoque' },
        { to: '/usuarios', icon: <PeopleIcon />, label: 'Usuários' },
      ],
    },
    {
      label: 'Comunicação',
      items: [
        { to: '/agenda', icon: <CalendarTodayIcon />, label: 'Agenda' },
        { to: '/ocorrencias', icon: <ReportProblemIcon />, label: 'Ocorrências' },
        { to: '/servicos', icon: <InsertChartIcon />, label: 'Serviços' },
      ],
    },
    {
      label: 'Administração',
      items: [
        { to: '/indicadores', icon: <InsertChartIcon />, label: 'Indicadores' },
      ],
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          top: '72px',
          height: 'calc(100% - 72px)',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 24px 60px rgba(0, 0, 0, 0.3)'
            : '0 24px 60px rgba(15, 21, 32, 0.08)',
          transition: 'width 260ms ease',
          overflowX: 'hidden',
        },
      }}
    >
      <List sx={{ pl: 2, pr: 2, pt: 1.5, pb: 0, display: 'grid', gap: 1, mt: 0 }}>
        {groups.map((group) => (
          <Box key={group.label} sx={{ display: 'grid', gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                fontWeight: 700,
              }}
            >
              {group.label}
            </Typography>

            {group.items.map((item) => {
              const active = location.pathname === item.to;
              return (
                <ListItemButton
                  key={item.to}
                  component={Link}
                  to={item.to}
                  sx={{
                    borderRadius: 3,
                    py: 1.1,
                    px: 2,
                    minHeight: 48,
                    justifyContent: 'flex-start',
                    gap: 1.5,
                    transition: 'all 200ms ease',
                    backgroundColor: active ? 'rgba(16,73,83,0.14)' : 'transparent',
                    color: active ? theme.palette.primary.main : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: active ? 'rgba(16,73,83,0.18)' : 'rgba(16,73,83,0.08)',
                      transform: 'translateX(1px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: 0,
                      mr: 1.25,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      noWrap: true,
                      sx: {
                        opacity: 1,
                        transition: 'opacity 200ms ease',
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </Box>
        ))}
      </List>
    </Drawer>
  );
};
