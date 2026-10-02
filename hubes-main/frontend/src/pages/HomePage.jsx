import React from 'react';
import { Box, Typography, Card, CardContent, Button, Link, useTheme, useMediaQuery } from '@mui/material';
import logo from '../1logo.jpeg';
import PageHeader from '../components/common/PageHeader';

export const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader 
        title="Bem-vindo ao SIGA Secult"
        breadcrumbs={[{ label: 'Início', path: '/home' }]}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 2,
          py: isMobile ? 3 : 5,
          px: isMobile ? 2 : 4,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 24,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 24px 80px rgba(0, 0, 0, 0.3)'
            : '0 24px 80px rgba(15, 21, 32, 0.05)',
        }}
      >
        <Box component="img" src={logo} alt="SECULT" sx={{ width: '100%', maxWidth: 320, height: 'auto' }} />
        <Typography variant={isMobile ? 'h5' : 'h3'} sx={{ fontWeight: 700, maxWidth: 720 }}>
          Sistema Integrado de Gestão Administrativa
        </Typography>

        <Typography variant={isMobile ? 'body1' : 'h6'} color="text.secondary" sx={{ maxWidth: 680 }}>
          SIGA Secult / HUB ES+
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'flex-start',
            alignItems: 'stretch',
          }}
        >
          <Card sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                📚 Documentação
              </Typography>
              <Typography color="text.secondary">
                Acesse a documentação completa do projeto
              </Typography>
              <Button variant="contained" size="medium" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                Ler Documentação
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                🗺️ Roadmap
              </Typography>
              <Typography color="text.secondary">
                Veja as próximas funcionalidades planejadas
              </Typography>
              <Button variant="contained" size="medium" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                Ver Roadmap
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                🧪 Testes
              </Typography>
              <Typography color="text.secondary">
                Guia de testes e validação
              </Typography>
              <Button variant="contained" size="medium" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                Guia de Testes
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Card sx={{ py: 3, px: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            ✨ Funcionalidades
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0, display: 'flex', flexDirection: 'column', gap: 1.25, color: 'text.secondary' }}>
            <Typography component="li">✅ Autenticação com JWT</Typography>
            <Typography component="li">✅ Gestão de Usuários</Typography>
            <Typography component="li">🔄 Gestão de Documentos (em desenvolvimento)</Typography>
            <Typography component="li">🔄 Controle de Compras (em desenvolvimento)</Typography>
            <Typography component="li">🔄 Gestão de Estoque (em desenvolvimento)</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
