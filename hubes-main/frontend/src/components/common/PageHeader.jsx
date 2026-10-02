import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import Breadcrumb from './Breadcrumb';
import useResponsive from '../../hooks/useResponsive';

export const PageHeader = ({ 
  title, 
  breadcrumbs = null, 
  actions = null, 
  subtitle = null,
  sx = {} 
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        mb: 3,
        ...sx,
      }}
    >
      {/* Breadcrumb */}
      <Breadcrumb customBreadcrumbs={breadcrumbs} />

      {/* Title e Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 2 : 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            sx={{
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant={isMobile ? 'body2' : 'body1'}
              sx={{
                color: 'text.secondary',
                maxWidth: 600,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        {actions && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column-reverse' : 'row',
              gap: 1,
              width: isMobile ? '100%' : 'auto',
              '& > button': {
                width: isMobile ? '100%' : 'auto',
              },
            }}
          >
            {Array.isArray(actions) ? actions : actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
