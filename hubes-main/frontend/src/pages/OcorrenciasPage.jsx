import React, { useState } from 'react';
import { Box, Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ocorrenciasService } from '../services/ocorrenciasService';
import DataTable from '../components/common/DataTable';
import OcorrenciaForm from '../components/common/OcorrenciaForm';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useSnackbar } from '../components/common/SnackbarProvider';

export const OcorrenciasPage = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewedOcorrencia, setViewedOcorrencia] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const { show } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpen = (ocorrencia = null) => {
    setSelected(ocorrencia);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  const handleSave = async (data) => {
    try {
      const hasFile = (value) => {
        if (!value) return false;
        if (value instanceof File || value instanceof Blob) return true;
        if (Array.isArray(value)) return value.some((item) => item instanceof File || item instanceof Blob);
        return false;
      };

      const buildFormData = (payload) => {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
          if (value == null) return;

          if (Array.isArray(value)) {
            value.forEach((item) => {
              formData.append(key, item);
            });
            return;
          }

          formData.append(key, value);
        });

        return formData;
      };

      const payload = hasFile(data.fotos) || hasFile(data.anexos)
        ? buildFormData(data)
        : data;

      if (selected) await ocorrenciasService.atualizar(selected.id, payload);
      else await ocorrenciasService.criar(payload);
      show('Ocorrência salva com sucesso', 'success');
      setReloadKey((k) => k + 1);
      handleClose();
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao salvar ocorrência', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await ocorrenciasService.deletar(toDeleteId);
      show('Ocorrência deletada com sucesso', 'success');
      setReloadKey((k) => k + 1);
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao deletar ocorrência', 'error');
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  const handleView = (ocorrencia) => {
    setViewedOcorrencia(ocorrencia);
    setViewOpen(true);
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setViewedOcorrencia(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageHeader 
        title="Ocorrências"
        subtitle="Registro e acompanhamento de ocorrências"
        actions={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpen()}
            fullWidth={isMobile}
          >
            Nova Ocorrência
          </Button>
        }
      />

      <DataTable
        columns={[
          { field: 'numeroOcorrencia', title: 'Número', sortable: true },
          { field: 'titulo', title: 'Título', sortable: true },
          { field: 'setor', title: 'Setor' },
          { field: 'prioridade', title: 'Prioridade' },
          { field: 'status', title: 'Status' },
          { field: 'descricao', title: 'Descrição' },
          { field: 'data', title: 'Data', render: (r) => {
            const date = new Date(r.data);
            return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
          } },
          { field: 'acoes', title: 'Ações', render: (row) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" onClick={() => handleView(row)} aria-label="Visualizar ocorrência">
                <VisibilityIcon />
              </IconButton>
              <IconButton size="small" onClick={() => handleOpen(row)} aria-label="Editar ocorrência">
                <EditIcon />
              </IconButton>
              <IconButton size="small" onClick={() => { setToDeleteId(row.id); setConfirmOpen(true); }} aria-label="Excluir ocorrência">
                <DeleteIcon />
              </IconButton>
            </Box>
          ) },
        ]}
        fetchData={ocorrenciasService.listar}
        reloadKey={reloadKey}
      />

      <Dialog open={viewOpen} onClose={handleCloseView} fullWidth maxWidth="md">
        <DialogTitle>Visualizar Ocorrência</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
          {viewedOcorrencia ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Número da ocorrência</Typography>
                  <Typography>{viewedOcorrencia.numeroOcorrencia || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Prioridade</Typography>
                  <Typography>{viewedOcorrencia.prioridade || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Local</Typography>
                  <Typography>{viewedOcorrencia.local || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Setor</Typography>
                  <Typography>{viewedOcorrencia.setor || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Descrição</Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{viewedOcorrencia.descricao || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Data e hora do cadastro</Typography>
                  <Typography>{viewedOcorrencia.createdAt ? new Date(viewedOcorrencia.createdAt).toLocaleString() : '-'}</Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Mídia</Typography>
                {Array.isArray(viewedOcorrencia.fotos) && viewedOcorrencia.fotos.length > 0 ? (
                  <Grid container spacing={1}>
                    {viewedOcorrencia.fotos.map((media) => {
                      const isVideo = typeof media === 'string' && media.match(/\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/i);
                      return (
                        <Grid item xs={12} sm={viewedOcorrencia.fotos.length === 1 ? 12 : 6} key={media}>
                          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
                            {isVideo ? (
                              <video src={media} controls style={{ width: '100%', display: 'block' }} />
                            ) : (
                              <img
                                src={media}
                                alt="Foto da ocorrência"
                                style={{ width: '100%', display: 'block', cursor: 'pointer' }}
                                onClick={() => window.open(media, '_blank', 'noopener')}
                              />
                            )}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Typography>Nenhuma foto ou vídeo foi anexado.</Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Typography>Carregando detalhes da ocorrência...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogContent>
          <OcorrenciaForm defaultValues={selected || { status: 'Aberto' }} onSubmit={handleSave} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Deletar ocorrência"
        message="Deseja realmente deletar esta ocorrência?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default OcorrenciasPage;
