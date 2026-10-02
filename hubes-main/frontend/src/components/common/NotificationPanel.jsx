import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  Badge,
  Divider,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningIcon from '@mui/icons-material/Warning';
import { AnimatePresence } from 'framer-motion';
import NotificationItem from './NotificationItem';

const NOTIFICATION_TYPES = {
  COMPRA: 'compra',
  DOCUMENTO: 'documento',
  OCORRENCIA: 'ocorrencia',
};

export const NotificationPanel = ({ open, onClose }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: NOTIFICATION_TYPES.COMPRA,
        icon: ShoppingCartIcon,
        title: 'Compra PO-2026-0145',
        description: 'Compra aguardando aprovação do gestor financeiro',
        date: new Date(Date.now() - 15 * 60000),
        status: 'pendente',
      },
      {
        id: 2,
        type: NOTIFICATION_TYPES.COMPRA,
        icon: ShoppingCartIcon,
        title: 'Compra PO-2026-0142',
        description: 'Compra aprovada e encaminhada ao fornecedor',
        date: new Date(Date.now() - 45 * 60000),
        status: 'concluído',
      },
      {
        id: 3,
        type: NOTIFICATION_TYPES.DOCUMENTO,
        icon: DescriptionIcon,
        title: 'Novo Documento Enviado',
        description: 'Parecer técnico sobre reforma da sede foi enviado',
        date: new Date(Date.now() - 2 * 3600000),
        status: 'novo',
      },
      {
        id: 4,
        type: NOTIFICATION_TYPES.DOCUMENTO,
        icon: DescriptionIcon,
        title: 'Documento Revisado',
        description: 'Projeto de lei recebeu revisão necessária',
        date: new Date(Date.now() - 5 * 3600000),
        status: 'concluído',
      },
      {
        id: 5,
        type: NOTIFICATION_TYPES.OCORRENCIA,
        icon: WarningIcon,
        title: 'Ocorrência #OC-2026-0089',
        description: 'Falha de acesso ao sistema registrada em produção',
        date: new Date(Date.now() - 30 * 60000),
        status: 'alerta',
      },
      {
        id: 6,
        type: NOTIFICATION_TYPES.OCORRENCIA,
        icon: WarningIcon,
        title: 'Ocorrência #OC-2026-0088',
        description: 'Erro na sincronização de dados resolvido',
        date: new Date(Date.now() - 3 * 3600000),
        status: 'concluído',
      },
    ];

    setNotifications(mockNotifications);
  }, []);

  const getFilteredNotifications = () => {
    const typeMap = {
      0: null,
      1: NOTIFICATION_TYPES.COMPRA,
      2: NOTIFICATION_TYPES.DOCUMENTO,
      3: NOTIFICATION_TYPES.OCORRENCIA,
    };

    const type = typeMap[activeTab];
    return notifications.filter(
      (n) => !dismissedIds.has(n.id) && (type === null || n.type === type)
    );
  };

  const handleDismiss = (id) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const handleClearAll = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setDismissedIds(allIds);
  };

  const handleMarkAllAsRead = () => {
    setDismissedIds((prev) => new Set([...prev, ...notifications.map((n) => n.id)]));
  };

  const filteredNotifications = getFilteredNotifications();

  const counts = {
    total: notifications.filter((n) => !dismissedIds.has(n.id)).length,
    compra: notifications.filter(
      (n) => !dismissedIds.has(n.id) && n.type === NOTIFICATION_TYPES.COMPRA
    ).length,
    documento: notifications.filter(
      (n) => !dismissedIds.has(n.id) && n.type === NOTIFICATION_TYPES.DOCUMENTO
    ).length,
    ocorrencia: notifications.filter(
      (n) => !dismissedIds.has(n.id) && n.type === NOTIFICATION_TYPES.OCORRENCIA
    ).length,
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 420 },
          maxWidth: '100%',
          boxShadow: theme.palette.mode === 'dark'
            ? '-4px 0 30px rgba(0, 0, 0, 0.55)'
            : '-4px 0 28px rgba(15, 21, 32, 0.15)',
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(18, 24, 36, 0.94)'
              : 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          borderLeft: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'transparent',
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(16, 73, 83, 0.04)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(16px)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: theme.palette.text.primary }}
              >
                Painel de Notificações
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                Últimas atualizações do sistema
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              mb: 1,
            }}
          >
            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(255, 255, 255, 0.9)',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 700 }}>
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mt: 0.5 }}>
                {counts.total}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(255, 255, 255, 0.9)',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 700 }}>
                Novas
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mt: 0.5 }}>
                {filteredNotifications.length}
              </Typography>
            </Box>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(e, value) => setActiveTab(value)}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-flexContainer': {
                gap: 1,
              },
              '& .MuiTab-root': {
                minWidth: 0,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                color: theme.palette.text.secondary,
                py: 1,
                px: 0.5,
                transition: 'all 0.2s ease',
              },
              '& .Mui-selected': {
                color: theme.palette.primary.main,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(45, 122, 136, 0.18)'
                    : 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <Tab
              label={
                <Badge badgeContent={counts.total} color="error" sx={{ width: '100%' }}>
                  Todas
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={counts.compra} color="error" sx={{ width: '100%' }}>
                  Compras
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={counts.documento} color="error" sx={{ width: '100%' }}>
                  Documentos
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={counts.ocorrencia} color="error" sx={{ width: '100%' }}>
                  Ocorrências
                </Badge>
              }
            />
          </Tabs>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.divider,
              borderRadius: '3px',
            },
          }}
        >
          {filteredNotifications.length > 0 ? (
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  {...notification}
                  onDismiss={() => handleDismiss(notification.id)}
                  delay={index * 0.05}
                />
              ))}
            </AnimatePresence>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: theme.palette.text.secondary,
                textAlign: 'center',
                px: 2,
              }}
            >
              <MarkEmailReadIcon
                sx={{ fontSize: '3rem', mb: 1, opacity: 0.28 }}
              />
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                Sem notificações no momento
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Você está em dia com todas as atualizações.
              </Typography>
            </Box>
          )}
        </Box>

        {notifications.filter((n) => !dismissedIds.has(n.id)).length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={handleMarkAllAsRead}
                sx={{ textTransform: 'none' }}
              >
                Marcar Tudo Como Lido
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                fullWidth
                onClick={handleClearAll}
                sx={{ textTransform: 'none' }}
              >
                Limpar Tudo
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;
