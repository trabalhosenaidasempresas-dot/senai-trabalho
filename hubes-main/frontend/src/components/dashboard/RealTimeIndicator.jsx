import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, useTheme, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

export const RealTimeIndicator = ({ title, value, maxValue = 100, icon, color = '#1976d2' }) => {
  const theme = useTheme();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayValue(prev => {
        const increment = Math.random() * 5;
        return Math.min(prev + increment, value);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [value]);

  const percentage = (displayValue / maxValue) * 100;

  return (
    <MotionCard
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      sx={{
        borderRadius: 2,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color}, ${theme.palette.primary.main})`,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Box
            sx={{
              fontSize: '1.8rem',
              backgroundColor: theme.palette.mode === 'dark'
                ? `${color}15`
                : `${color}20`,
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {title}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color }}>
              {displayValue.toFixed(0)}
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: `linear-gradient(90deg, ${color}, ${theme.palette.primary.main})`,
            },
          }}
        />

        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block' }}>
          {percentage.toFixed(0)}% de {maxValue}
        </Typography>
      </CardContent>
    </MotionCard>
  );
};

export default RealTimeIndicator;
