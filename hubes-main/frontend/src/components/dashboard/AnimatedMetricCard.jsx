import React, { useEffect, useState } from 'react';
import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const MotionCard = motion(Card);

export const AnimatedMetricCard = ({ title, value, icon: Icon, color }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, ${theme.palette.primary.main})`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              color="text.secondary"
              sx={{
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              {title}
            </Typography>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color,
                  mt: 1,
                  fontSize: '1.8rem',
                }}
              >
                {typeof value === 'number' ? <CountUp end={value} duration={2} /> : '--'}
              </Typography>
            </motion.div>
          </Box>

          <motion.div
            animate={{ rotate: isHovered ? 10 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                border: `2px solid ${color}30`,
                transition: 'all 0.3s ease',
              }}
            >
              {Icon && <Icon sx={{ fontSize: 40, color }} />}
            </Box>
          </motion.div>
        </Box>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
          style={{ originX: 0 }}
        >
          <Box
            sx={{
              height: 3,
              background: `linear-gradient(90deg, ${color}, ${theme.palette.primary.main})`,
              borderRadius: 2,
            }}
          />
        </motion.div>
      </CardContent>
    </MotionCard>
  );
};

export default AnimatedMetricCard;
