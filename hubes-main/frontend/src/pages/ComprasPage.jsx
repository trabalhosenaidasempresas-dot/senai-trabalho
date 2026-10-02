import React, { useState } from 'react';
import { Box, Button, IconButton, Dialog, DialogActions, DialogContent, useTheme, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { comprasService } from '../services/comprasService';
import DataTable from '../components/common/DataTable';
import CompraForm from '../components/common/CompraForm';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useSnackbar } from '../components/common/SnackbarProvider';

export const ComprasPage = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const { show } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpen = (compra = null) => {
    setSelected(compra);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  const handleSave = async (data) => {
    try {
      if (selected) await comprasService.atualizar(selected.id, data);
      else await comprasService.criar(data);
      show('Compra salva com sucesso', 'success');
      setReloadKey((k) => k + 1);
      handleClose();
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao salvar compra', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await comprasService.deletar(toDeleteId);
      show('Compra deletada com sucesso', 'success');
      setReloadKey((k) => k + 1);
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao deletar compra', 'error');
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageHeader 
        title="Compras"
        subtitle="Controle e rastreamento de compras"
        actions={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpen()}
            fullWidth={isMobile}
          >
            Nova Compra
          </Button>
        }
      />

      <DataTable
        columns={[
          { field: 'numeroCompra', title: 'Número', sortable: true },
          { field: 'fornecedor', title: 'Fornecedor' },
          { field: 'fornecedorEmail', title: 'E-mail do fornecedor' },
          { field: 'quantidade', title: 'Quantidade' },
          { field: 'valor', title: 'Valor total', render: (r) => r.valor?.toFixed(2) },
          { field: 'status', title: 'Status' },
          { field: 'dataEntrega', title: 'Entrega', render: (r) => r.dataEntrega ? new Date(r.dataEntrega).toLocaleDateString() : '-' },
          { field: 'acoes', title: 'Ações', render: (row) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" onClick={() => handleOpen(row)}><EditIcon /></IconButton>
              <IconButton size="small" onClick={() => { setToDeleteId(row.id); setConfirmOpen(true); }}><DeleteIcon /></IconButton>
            </Box>
          ) },
        ]}
        fetchData={comprasService.listar}
        reloadKey={reloadKey}
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogContent>
          <CompraForm defaultValues={selected || {}} onSubmit={handleSave} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Deletar compra"
        message="Deseja realmente deletar essa compra?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default ComprasPage;
