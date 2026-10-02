import React, { useState } from 'react';
import { Box, Button, IconButton, Dialog, DialogActions, DialogContent, useTheme, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { comunicacaoService } from '../services/comunicacaoService';
import DataTable from '../components/common/DataTable';
import ComunicadoForm from '../components/common/ComunicadoForm';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useSnackbar } from '../components/common/SnackbarProvider';

export const ComunicacaoPage = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const { show } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpen = (comunicado = null) => {
    setSelected(comunicado);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  const handleSave = async (data) => {
    try {
      if (selected) await comunicacaoService.atualizar(selected.id, data);
      else await comunicacaoService.criar(data);
      show('Comunicado salvo com sucesso', 'success');
      setReloadKey((k) => k + 1);
      handleClose();
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao salvar comunicado', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await comunicacaoService.deletar(toDeleteId);
      show('Comunicado deletado com sucesso', 'success');
      setReloadKey((k) => k + 1);
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao deletar comunicado', 'error');
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageHeader 
        title="Comunicação"
        subtitle="Gerenciamento de comunicados e avisos"
        actions={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpen()}
            fullWidth={isMobile}
          >
            Novo Comunicado
          </Button>
        }
      />

      <DataTable
        columns={[
          { field: 'titulo', title: 'Título', sortable: true },
          { field: 'tipo', title: 'Tipo' },
          { field: 'publicoAlvo', title: 'Público-alvo' },
          { field: 'status', title: 'Status' },
          { field: 'dataEnvio', title: 'Data de envio', render: (r) => r.dataEnvio ? new Date(r.dataEnvio).toLocaleDateString() : '-' },
          { field: 'acoes', title: 'Ações', render: (row) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" onClick={() => handleOpen(row)}><EditIcon /></IconButton>
              <IconButton size="small" onClick={() => { setToDeleteId(row.id); setConfirmOpen(true); }}><DeleteIcon /></IconButton>
            </Box>
          ) },
        ]}
        fetchData={comunicacaoService.listar}
        reloadKey={reloadKey}
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogContent>
          <ComunicadoForm defaultValues={selected || { tipo: 'Aviso', status: 'Ativo' }} onSubmit={handleSave} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Deletar comunicado"
        message="Deseja realmente deletar este comunicado?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default ComunicacaoPage;
