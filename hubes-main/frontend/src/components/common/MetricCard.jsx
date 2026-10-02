import React from 'react';
import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';

export const MetricCard = ({ title, value, icon: Icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ borderRadius: 3, overflow: 'visible', boxShadow: theme.palette.mode === 'dark' ? '0 18px 45px rgba(0, 0, 0, 0.3)' : '0 18px 45px rgba(15, 21, 32, 0.06)' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 3 }}>
        <Box>
          <Typography color="text.secondary" gutterBottom sx={{ fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase' }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
        </Box>

        <Box sx={{ width: 72, height: 72, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.palette.mode === 'dark' ? 'rgba(45, 122, 136, 0.08)' : 'rgba(25, 118, 210, 0.08)' }}>
          {Icon && <Icon sx={{ fontSize: 34, color }} />}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
