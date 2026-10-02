import React, { useState, useContext } from 'react';
import { Box, Button, TextField, Container, Paper, Typography, Alert, useTheme, CircularProgress, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';

export const LoginPage = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('admin@secult.com');
  const [senha, setSenha] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      // Validações básicas
      if (!email || !senha) {
        throw new Error('Email e senha são obrigatórios');
      }

      const result = await login(email, senha);
      
      if (result?.usuario) {
        showSuccess(`Bem-vindo, ${result.usuario.nome}! 🎉`);
        setTimeout(() => navigate('/dashboard'), 500);
      }
    } catch (error) {
      const errorMsg = error?.message || error?.data?.message || 'Erro ao fazer login';
      setErrorMessage(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          py: 6,
        }}
      >
        <Paper elevation={0} sx={{ padding: 5, width: '100%', backgroundColor: theme.palette.background.paper, borderRadius: 24, boxShadow: theme.palette.mode === 'dark' ? '0 24px 80px rgba(0, 0, 0, 0.3)' : '0 24px 80px rgba(15, 21, 32, 0.08)' }}>
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 700 }}>
            SIGA Secult
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Sistema Integrado de Gestão Administrativa
          </Typography>

          {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{errorMessage}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 3, py: 1.5, borderRadius: 3 }}
              disabled={loading}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  Entrando...
                </Box>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
            Ainda não tem conta?{' '}
            <Link component={RouterLink} to="/register">Cadastre-se</Link>
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
            Credenciais de teste:
          </Typography>
          <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: 'text.secondary' }}>
            Admin: admin@secult.com / admin123<br />
            Gestor: gestor@secult.com / gestor123<br />
            Servidor: servidor@secult.com / servidor123
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

