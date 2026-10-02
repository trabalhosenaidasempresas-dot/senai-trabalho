import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export const NotificationItem = ({
  icon: Icon,
  title,
  description,
  date,
  status = 'novo',
  onDismiss,
  delay = 0,
  onClick,
}) => {
  const theme = useTheme();

  const getStatusColor = (status) => {
    const isDark = theme.palette.mode === 'dark';
    const colors = {
      novo: {
        bg: isDark ? 'rgba(33, 150, 243, 0.15)' : '#E3F2FD',
        text: isDark ? '#64B5F6' : '#1976D2',
      },
      pendente: {
        bg: isDark ? 'rgba(255, 152, 0, 0.15)' : '#FFF3E0',
        text: isDark ? '#FFB74D' : '#F57C00',
      },
      concluído: {
        bg: isDark ? 'rgba(76, 175, 80, 0.15)' : '#E8F5E9',
        text: isDark ? '#81C784' : '#388E3C',
      },
      alerta: {
        bg: isDark ? 'rgba(244, 67, 54, 0.15)' : '#FFEBEE',
        text: isDark ? '#EF5350' : '#D32F2F',
      },
      crítico: {
        bg: isDark ? 'rgba(194, 24, 91, 0.15)' : '#FCE4EC',
        text: isDark ? '#EC407A' : '#C2185B',
      },
    };
    return colors[status] || colors.novo;
  };

  const statusColors = getStatusColor(status);

  const formatDate = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <MotionPaper
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      sx={{
        p: 1.8,
        mb: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1.5,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fafafa',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 24px rgba(0, 0, 0, 0.4)'
            : '0 8px 24px rgba(0, 0, 0, 0.12)',
          transform: 'translateX(-4px)',
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {/* Ícone */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 44,
            width: 44,
            height: 44,
            borderRadius: 1,
            backgroundColor: statusColors.bg,
            color: statusColors.text,
            fontSize: '1.5rem',
          }}
        >
          {Icon ? <Icon sx={{ fontSize: '1.3rem' }} /> : icon}
        </Box>

        {/* Conteúdo */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Título e Status */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 1,
              mb: 0.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: '0.95rem',
              }}
            >
              {title}
            </Typography>
            <Chip
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: statusColors.bg,
                color: statusColors.text,
                flexShrink: 0,
              }}
            />
          </Box>

          {/* Descrição */}
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mb: 0.8,
              fontSize: '0.85rem',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {description}
          </Typography>

          {/* Data */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: theme.palette.text.secondary,
              fontSize: '0.8rem',
            }}
          >
            <AccessTimeIcon sx={{ fontSize: '0.85rem' }} />
            {formatDate(date)}
          </Box>
        </Box>

        {/* Botão Fechar */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.();
          }}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: `${theme.palette.error.main}15`,
              color: theme.palette.error.main,
            },
          }}
        >
          <CloseIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>
    </MotionPaper>
  );
};

export default NotificationItem;
