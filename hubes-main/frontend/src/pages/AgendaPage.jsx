import React, { useState } from 'react';
import { Box, Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, useTheme, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { agendaService } from '../services/agendaService';
import DataTable from '../components/common/DataTable';
import EventoForm from '../components/common/EventoForm';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useSnackbar } from '../components/common/SnackbarProvider';

export const AgendaPage = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const { show } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpen = (evento = null) => {
    setSelected(evento);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  const handleSave = async (data) => {
    const payload = {
      ...data,
      tipo: selected?.tipo || 'Evento',
      status: selected?.status || 'Ativo',
    };

    try {
      if (selected) await agendaService.atualizar(selected.id, payload);
      else {
        // revalidar disponibilidade no backend antes de criar
        const startISO = data.dataInicio;
        const endISO = data.dataFim;
        try {
          const date = startISO ? startISO.slice(0,10) : null;
          const res = await agendaService.disponibilidade({ local: data.local, date, start: startISO, end: endISO });
          // se houver eventos que se sobrepõem, o backend já retornaria events; verificamos por segurança
          if (res && res.events && res.events.length > 0) {
            throw new Error('Horário indisponível: já existe um evento agendado para este período');
          }
        } catch (err) {
          // se o backend retornar erro de conflito, propagar para o usuário
          throw err;
        }
        await agendaService.criar(payload);
      }
      show('Evento salvo com sucesso', 'success');
      setReloadKey((k) => k + 1);
      handleClose();
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao salvar evento', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await agendaService.deletar(toDeleteId);
      show('Evento deletado com sucesso', 'success');
      setReloadKey((k) => k + 1);
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao deletar evento', 'error');
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageHeader 
        title="Agenda"
        subtitle="Calendário e agendamento de eventos"
        actions={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpen()}
            fullWidth={isMobile}
          >
            Novo Evento
          </Button>
        }
      />

      <DataTable
        columns={[
          { field: 'titulo', title: 'Título', sortable: true },
          { field: 'local', title: 'Local' },
          { field: 'dataInicio', title: 'Início', render: (r) => new Date(r.dataInicio).toLocaleString() },
          { field: 'dataFim', title: 'Fim', render: (r) => r.dataFim ? new Date(r.dataFim).toLocaleString() : '-' },
          { field: 'acoes', title: 'Ações', render: (row) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" onClick={() => handleOpen(row)}><EditIcon /></IconButton>
              <IconButton size="small" onClick={() => { setToDeleteId(row.id); setConfirmOpen(true); }}><DeleteIcon /></IconButton>
            </Box>
          ) },
        ]}
        fetchData={agendaService.listar}
        reloadKey={reloadKey}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth={false}
        PaperProps={{ sx: { width: 700, maxWidth: '100%', maxHeight: '90vh', overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ py: 2, px: 3 }}>Novo Evento</DialogTitle>
        <DialogContent sx={{
          px: 3,
          pb: 2,
          overflowY: 'auto',
          maxHeight: 'calc(90vh - 124px)',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            width: 8,
            borderRadius: 8,
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 8,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(0,0,0,0.3)',
          },
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.2) transparent',
        }}>
          <EventoForm defaultValues={selected || { nome: '', email: '', telefone: '', local: '', descricao: '', titulo: '' }} onSubmit={handleSave} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, padding: 2, position: 'sticky', bottom: 0, bgcolor: 'background.paper', zIndex: 1 }}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" form="evento-form" variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Deletar evento"
        message="Deseja realmente deletar este evento?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default AgendaPage;
