import React, { useState, useContext } from 'react';
import { Box, Button, TextField, Container, Paper, Typography, Alert, useTheme, CircularProgress, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';

export const RegisterPage = () => {
  const theme = useTheme();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [setor, setSetor] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (!nome || !email || !senha) {
        throw new Error('Nome, email e senha são obrigatórios');
      }

      const result = await register(nome, email, senha, telefone, setor);
      if (result?.usuario) {
        showSuccess(`Cadastro realizado com sucesso! Bem-vindo, ${result.usuario.nome}`);
        setTimeout(() => navigate('/dashboard'), 500);
      }
    } catch (error) {
      const message = error?.message || error?.data?.message || 'Erro ao cadastrar usuário';
      setErrorMessage(message);
      showError(message);
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
            Cadastro SIGA Secult
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Crie sua conta para acessar o sistema.
          </Typography>

          {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{errorMessage}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
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
            <TextField
              fullWidth
              label="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              margin="normal"
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Setor"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              margin="normal"
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
                  Cadastrando...
                </Box>
              ) : (
                'Cadastrar'
              )}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
            Já possui conta?{' '}
            <Link component={RouterLink} to="/login">
              Entrar
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};
