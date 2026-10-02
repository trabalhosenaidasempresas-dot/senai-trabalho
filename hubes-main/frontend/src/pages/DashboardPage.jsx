import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
  LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

import AnimatedMetricCard from '../components/dashboard/AnimatedMetricCard';
import ChartCard from '../components/dashboard/ChartCard';
import ActivityCard from '../components/dashboard/ActivityCard';
import RealTimeIndicator from '../components/dashboard/RealTimeIndicator';
import QuickShortcuts from '../components/dashboard/QuickShortcuts';
import PageHeader from '../components/common/PageHeader';
import { usuariosService } from '../services/usuariosService';
import { documentosService } from '../services/documentosService';
import { comprasService } from '../services/comprasService';
import { ocorrenciasService } from '../services/ocorrenciasService';
import dashboardService from '../services/dashboardService';

const MotionBox = motion(Box);

export const DashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);

  const fetchDashboardStats = async () => {
    setStatsError(null);
    try {
      const res = await dashboardService.summary();
      setStats(res.data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas do Dashboard:', err);
      setStats(null);
      setStatsError('Não foi possível carregar os indicadores do Dashboard.');
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      fetchDashboardStats();
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleFocus = () => {
      if (location.pathname === '/dashboard') {
        fetchDashboardStats();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [location.pathname]);

  // Dados dos gráficos
  const documentosChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Documentos Criados',
        data: [5, 8, 6, 10, 9, 12],
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2196F3',
        pointBorderColor: theme.palette.background.paper,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const comprasChartData = {
    labels: ['Processamento', 'Aprovado', 'Rejeitado', 'Pendente'],
    datasets: [
      {
        label: 'Status de Compras',
        data: [45, 30, 10, 15],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',
          'rgba(33, 150, 243, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(255, 152, 0, 0.8)',
        ],
        borderColor: [
          '#4CAF50',
          '#2196F3',
          '#F44336',
          '#FF9800',
        ],
        borderWidth: 2,
      },
    ],
  };

  const atividadeChartData = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Atividade do Sistema',
        data: [65, 78, 92, 81, 88, 45, 32],
        backgroundColor: 'rgba(156, 39, 176, 0.8)',
        borderColor: '#9C27B0',
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const statusChartData = {
    labels: ['Ativo', 'Inativo', 'Pendente'],
    datasets: [
      {
        label: 'Status de Usuários',
        data: [150, 30, 20],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(255, 152, 0, 0.8)',
        ],
        borderColor: [
          '#4CAF50',
          '#F44336',
          '#FF9800',
        ],
        borderWidth: 2,
      },
    ],
  };

  const metrics = [
    { key: 'totalUsers', title: 'Usuários', value: stats?.totalUsers ?? null, icon: PeopleIcon, color: '#1976d2' },
    { key: 'totalDocuments', title: 'Documentos', value: stats?.totalDocuments ?? null, icon: DescriptionIcon, color: '#2E7D32' },
    { key: 'totalItemsStock', title: 'Itens em estoque', value: stats?.totalItemsStock ?? null, icon: ShoppingCartIcon, color: '#1976d2' },
    { key: 'itensBaixoEstoque', title: 'Itens estoque baixo', value: stats?.itensBaixoEstoque ?? null, icon: WarningIcon, color: '#FF9800' },
    { key: 'itensSemEstoque', title: 'Itens sem estoque', value: stats?.itensSemEstoque ?? null, icon: WarningIcon, color: '#F44336' },
    { key: 'totalManutencoes', title: 'Total manutenções', value: stats?.totalManutencoes ?? null, icon: TrendingUpIcon, color: '#9C27B0' },
    { key: 'manutencoesVencidas', title: 'Manutenções vencidas', value: stats?.manutencoesVencidas ?? null, icon: WarningIcon, color: '#D32F2F' },
    { key: 'manutencoesProximas', title: 'Manutenções próximas', value: stats?.manutencoesProximas ?? null, icon: CloudSyncIcon, color: '#FF7043' },
    { key: 'contratosVigentes', title: 'Contratos vigentes', value: stats?.contratosVigentes ?? null, icon: CloudSyncIcon, color: '#4CAF50' },
    { key: 'contratosVencendo', title: 'Contratos vencendo', value: stats?.contratosVencendo ?? null, icon: CloudSyncIcon, color: '#FFC107' },
    { key: 'contratosVencidos', title: 'Contratos vencidos', value: stats?.contratosVencidos ?? null, icon: WarningIcon, color: '#E53935' },
    { key: 'totalOcorrencias', title: 'Ocorrências', value: stats?.totalOcorrencias ?? null, icon: WarningIcon, color: '#D32F2F' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          mx: 'auto',
          px: { xs: 1, sm: 1.5, md: 2 },
        }}
      >
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <PageHeader 
            title="Painel Administrativo"
            subtitle="Bem-vindo ao SIGA Secult - Sistema de Gestão Administrativa"
            breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }]}
          />
        </Box>

        {/* Cartões métricos (ordem ajustada) */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {metrics.map((m, i) => (
            <Grid item xs={12} sm={6} md={3} key={`metric-${i}`}>
              <AnimatedMetricCard title={m.title} value={m.value} icon={m.icon} color={m.color} />
            </Grid>
          ))}
        </Grid>

        {/* Atalhos Rápidos */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <QuickShortcuts />
          </Grid>
        </Grid>

        {/* Gráficos Principais */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <ChartCard
              title="📈 Documentos Criados"
              type="line"
              data={documentosChartData}
              height={320}
              showFilters={true}
              enableExport={true}
              animationDelay={0.1}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard
              title="📊 Status de Compras"
              type="doughnut"
              data={comprasChartData}
              height={320}
              showFilters={true}
              enableExport={true}
              animationDelay={0.2}
            />
          </Grid>
        </Grid>

        {/* Segunda linha de gráficos */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <ChartCard
              title="🔥 Atividade Semanal"
              type="bar"
              data={atividadeChartData}
              height={300}
              showFilters={true}
              enableExport={true}
              animationDelay={0.3}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard
              title="👥 Status de Usuários"
              type="pie"
              data={statusChartData}
              height={300}
              showFilters={false}
              enableExport={true}
              animationDelay={0.4}
            />
          </Grid>
        </Grid>

        {/* Indicadores em Tempo Real e Atividades */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <RealTimeIndicator
                    title="CPU"
                    value={65}
                    maxValue={100}
                    icon="⚙️"
                    color="#FF5722"
                  />
                </Grid>
                <Grid item xs={12}>
                  <RealTimeIndicator
                    title="Memória"
                    value={78}
                    maxValue={100}
                    icon="💾"
                    color="#2196F3"
                  />
                </Grid>
                <Grid item xs={12}>
                  <RealTimeIndicator
                    title="Armazenamento"
                    value={42}
                    maxValue={100}
                    icon="💿"
                    color="#4CAF50"
                  />
                </Grid>
              </Grid>
            </MotionBox>
          </Grid>
          <Grid item xs={12} md={8}>
            <ActivityCard />
          </Grid>
        </Grid>

        {/* Info Box com Bem-vindo */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Paper
            sx={{
              p: 3,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`
                : `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
              border: `2px solid ${theme.palette.primary.main}${theme.palette.mode === 'dark' ? '40' : '30'}`,
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                🎯 Bem-vindo ao SIGA Secult!
              </Typography>
            </Box>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Sistema Integrado de Gestão Administrativa da SECULT. Use o menu lateral para navegar pelos módulos disponíveis.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="✨ Design Responsivo" variant="outlined" />
              <Chip label="📊 Análise em Tempo Real" variant="outlined" />
              <Chip label="🔐 Segurança Avançada" variant="outlined" />
              <Chip label="🚀 Performance Otimizada" variant="outlined" />
            </Box>
          </Paper>
        </MotionBox>
      </Box>
    </Box>
  );
};

export default DashboardPage;

