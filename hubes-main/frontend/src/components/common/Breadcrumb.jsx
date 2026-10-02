import React from 'react';
import { Box, Breadcrumbs, Typography, Link as MuiLink, useTheme, useMediaQuery } from '@mui/material';
import { useLocation, Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

const routeLabels = {
  '/dashboard': 'Dashboard',
  '/indicadores': 'Indicadores',
  '/documentos': 'Documentos',
  '/compras': 'Compras',
  '/estoque': 'Estoque',
  '/agenda': 'Agenda',
  '/ocorrencias': 'Ocorrências',
  '/comunicacao': 'Comunicação',
  '/usuarios': 'Usuários',
  '/home': 'Início',
};

export const Breadcrumb = ({ customBreadcrumbs = null }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) return customBreadcrumbs;

    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs = [{ label: 'Início', path: '/dashboard' }];

    let currentPath = '';
    pathnames.forEach((name) => {
      currentPath += `/${name}`;
      const label = routeLabels[currentPath] || name.charAt(0).toUpperCase() + name.slice(1);
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 2,
        overflow: 'auto',
        pb: 0.5,
        '&::-webkit-scrollbar': {
          height: 4,
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.divider,
          borderRadius: 2,
        },
      }}
    >
      <Breadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 18 }} />}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          fontSize: isMobile ? '0.75rem' : '0.875rem',
        }}
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast) {
            return (
              <Typography
                key={breadcrumb.path}
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                }}
              >
                {breadcrumb.label}
              </Typography>
            );
          }

          return (
            <MuiLink
              key={breadcrumb.path}
              component={Link}
              to={breadcrumb.path}
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontSize: 'inherit',
                fontWeight: 500,
                transition: 'color 0.2s',
                '&:hover': {
                  color: 'primary.dark',
                  textDecoration: 'underline',
                },
              }}
            >
              {breadcrumb.label}
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;
