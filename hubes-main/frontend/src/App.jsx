import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import { PrivateRoute } from './routes/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { DocumentosPage } from './pages/DocumentosPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { ComprasPage } from './pages/ComprasPage';
import { EstoquePage } from './pages/EstoquePage';
import { AgendaPage } from './pages/AgendaPage';
import { OcorrenciasPage } from './pages/OcorrenciasPage';
import { ServicosPage } from './pages/ServicosPage';
import { ComunicacaoPage } from './pages/ComunicacaoPage';
import { MainLayout } from './layouts/MainLayout';

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/indicadores" element={<DashboardPage />} />
          <Route path="/documentos" element={<DocumentosPage />} />
          <Route path="/compras" element={<ComprasPage />} />
          <Route path="/estoque" element={<EstoquePage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/ocorrencias" element={<OcorrenciasPage />} />
          <Route path="/servicos" element={<ServicosPage />} />
          <Route path="/comunicacao" element={<ComunicacaoPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
