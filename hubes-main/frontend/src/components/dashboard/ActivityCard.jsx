import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, Stack, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

export const ActivityCard = ({ activities = [] }) => {
  const theme = useTheme();

  const defaultActivities = [
    { id: 1, user: 'Administrador', action: 'Criou novo documento', time: 'Agora', icon: '📄' },
    { id: 2, user: 'Gestor', action: 'Registrou compra', time: '5 min atrás', icon: '🛒' },
    { id: 3, user: 'Servidor', action: 'Atualizou ocorrência', time: '15 min atrás', icon: '⚠️' },
    { id: 4, user: 'Admin', action: 'Login no sistema', time: '1 hora atrás', icon: '🔐' },
    { id: 5, user: 'Gestor', action: 'Enviou comunicado', time: '2 horas atrás', icon: '📢' },
  ];

  const activityList = activities.length > 0 ? activities : defaultActivities;

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      sx={{
        borderRadius: 2,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        height: '100%',
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
          📊 Últimas Atividades
        </Typography>

        <Stack spacing={1.5}>
          {activityList.slice(0, 5).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1.5,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(45, 122, 136, 0.08)'
                    : 'rgba(25, 118, 210, 0.04)',
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(45, 122, 136, 0.15)'
                      : 'rgba(25, 118, 210, 0.08)',
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.main,
                    fontSize: '1.2rem',
                  }}
                >
                  {activity.icon}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {activity.user}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    {activity.action}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Stack>
      </CardContent>
    </MotionCard>
  );
};

export default ActivityCard;
