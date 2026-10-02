import React, { useState } from 'react';
import { Box, Button, CircularProgress, Alert, Chip, IconButton, Typography, Dialog, DialogTitle, DialogContent, useTheme, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { usuariosService } from '../services/usuariosService';
import DataTable from '../components/common/DataTable';
import UserForm from '../components/common/UserForm';
import PageHeader from '../components/common/PageHeader';
import { useSnackbar } from '../components/common/SnackbarProvider';
import ConfirmDialog from '../components/common/ConfirmDialog';

export const UsuariosPage = () => {
  const [usuarios] = useState([]);
  const [loading] = useState(false);
  const [erro, setErro] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { show } = useSnackbar();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchUsuarios = async ({ pagina = 1, limite = 10, search, sortField, sortOrder } = {}) => {
    const res = await usuariosService.listar(pagina, limite, search, sortField, sortOrder);
    return res;
  };

  const handleOpenDialog = (usuario = null) => {
    setSelectedUsuario(usuario);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUsuario(null);
  };

  const handleSalvar = async (data) => {
    try {
      const payload = { ...data };
      if (!payload.senha) delete payload.senha;

      if (selectedUsuario) await usuariosService.atualizar(selectedUsuario.id, payload);
      else await usuariosService.criar(payload);

      show('Usuário salvo', 'success');
      setReloadKey((k) => k + 1);
      handleCloseDialog();
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao salvar usuário', 'error');
    }
  };

  const confirmDelete = (id) => { setToDeleteId(id); setConfirmOpen(true); };

  const handleDeletar = async () => {
    try {
      await usuariosService.deletar(toDeleteId);
      show('Usuário deletado', 'success');
      setReloadKey((k) => k + 1);
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao deletar usuário', 'error');
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  if (loading) return <CircularProgress />;

  const perfisColors = {
    Administrador: 'error',
    Gestor: 'warning',
    Servidor: 'info',
    Visitante: 'default',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageHeader 
        title="Usuários"
        subtitle="Gerenciamento completo de usuários do sistema"
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            fullWidth={isMobile}
          >
            Novo Usuário
          </Button>
        }
      />

      {erro && <Alert severity="error">{erro}</Alert>}

      <DataTable columns={[
        { field: 'nome', title: 'Nome', sortable: true },
        { field: 'email', title: 'Email' },
        { field: 'setor', title: 'Setor' },
        { field: 'perfil', title: 'Perfil', render: (r) => <Chip label={r.perfil} color={perfisColors[r.perfil]} size="small" /> },
        { field: 'status', title: 'Status', render: (r) => <Chip label={r.status} color={r.status === 'Ativo' ? 'success' : 'default'} size="small" /> },
        { field: 'acoes', title: 'Ações', render: (r) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={() => handleOpenDialog(r)}><EditIcon /></IconButton>
            <IconButton size="small" onClick={() => confirmDelete(r.id)}><DeleteIcon /></IconButton>
          </Box>
        ) }
      ]} fetchData={fetchUsuarios} initialLimit={10} reloadKey={reloadKey} />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUsuario ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        <DialogContent>
          <UserForm
            key={selectedUsuario?.id || 'new'}
            defaultValues={selectedUsuario || { perfil: 'Servidor' }}
            onSubmit={handleSalvar}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmOpen} title="Deletar usuário" message="Deseja realmente deletar este usuário?" onCancel={() => setConfirmOpen(false)} onConfirm={handleDeletar} />
    </Box>
  );
};
