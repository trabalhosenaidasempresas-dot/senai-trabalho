import React from 'react';
import { Box, Button, Card, CardContent, Typography, useTheme, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningIcon from '@mui/icons-material/Warning';
import EventIcon from '@mui/icons-material/Event';
import MailIcon from '@mui/icons-material/Mail';
import HomeIcon from '@mui/icons-material/Home';

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export const QuickShortcuts = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const shortcuts = [
    { icon: HomeIcon, label: 'Home', color: '#1976D2', route: '/home' },
    { icon: AddIcon, label: 'Novo Documento', color: '#2196F3', route: '/documentos' },
    { icon: ShoppingCartIcon, label: 'Nova Compra', color: '#FF9800', route: '/compras' },
    { icon: WarningIcon, label: 'Registrar Ocorrência', color: '#F44336', route: '/ocorrencias' },
    { icon: EventIcon, label: 'Agendar Evento', color: '#9C27B0', route: '/agenda' },
    { icon: MailIcon, label: 'Enviar Comunicado', color: '#00BCD4', route: '/comunicacao' },
    { icon: DescriptionIcon, label: 'Gerenciar Usuários', color: '#4CAF50', route: '/usuarios' },
  ];

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      sx={{
        borderRadius: 3,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 18px 45px rgba(0, 0, 0, 0.3)'
          : '0 18px 45px rgba(15, 21, 32, 0.08)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, letterSpacing: 0.5, color: 'text.primary' }}>
          ⚡ Atalhos Rápidos
        </Typography>

        <Grid container spacing={2}>
          {shortcuts.map((shortcut, index) => {
            const Icon = shortcut.icon;
            return (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <MotionButton
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(shortcut.route)}
                  variant="outlined"
                  fullWidth
                  sx={{
                    py: 1.5,
                    flexDirection: 'column',
                    gap: 0.5,
                    borderColor: shortcut.color,
                    color: shortcut.color,
                    borderRadius: 1.5,
                    transition: 'all 0.3s ease',
                    backgroundColor: theme.palette.mode === 'dark'
                      ? `${shortcut.color}08`
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: `${shortcut.color}${theme.palette.mode === 'dark' ? '15' : '10'}`,
                      borderColor: shortcut.color,
                      boxShadow: `0 4px 12px ${shortcut.color}${theme.palette.mode === 'dark' ? '40' : '30'}`,
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 24 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {shortcut.label}
                  </Typography>
                </MotionButton>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </MotionCard>
  );
};

export default QuickShortcuts;
