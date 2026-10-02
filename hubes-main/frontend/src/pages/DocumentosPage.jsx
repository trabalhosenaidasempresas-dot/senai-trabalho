import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, useTheme, useMediaQuery, TextField } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import documentosService from '../services/documentosService';
import { useSnackbar } from '../components/common/SnackbarProvider';
import PageHeader from '../components/common/PageHeader';
import DocumentForm from '../components/common/DocumentForm';
import DataTable from '../components/common/DataTable';

const normalizeUploadUrl = (url) => {
  if (!url) return url;
  const trimmed = url.toString().trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) {
    return trimmed;
  }
  if (trimmed.startsWith('uploads/')) {
    return `/${trimmed}`;
  }
  return `/uploads/${trimmed.replace(/^\/+/, '')}`;
};

export const DocumentosPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchDocumentos = async ({ pagina = 1, limite = 10, search, sortField, sortOrder, filters = {} } = {}) => {
    const { categoria: fCategoria = categoriaFilter, dateFrom, dateTo } = filters || {};
    const res = await documentosService.listar(pagina, limite, search, sortField, sortOrder, fCategoria, dateFrom, dateTo);
    return res;
  };

  const categoryOptions = [
    { value: 'Contratos', label: 'Contrato' },
    { value: 'Servicos', label: 'Serviço' },
    { value: 'Manutencoes', label: 'Manutenção' },
    { value: 'Inventario', label: 'Inventário' },
    { value: 'Relatorios', label: 'Relatório' },
    { value: 'Alvaras', label: 'Alvará' },
    { value: 'Seguranca', label: 'Segurança' },
    { value: 'Limpeza', label: 'Limpeza' },
    { value: 'Outros', label: 'Outros' },
  ];
  const categoryLabels = Object.fromEntries(categoryOptions.map((option) => [option.value, option.label]));
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [reloadKey, setReloadKey] = useState(0);
  const abrir = () => {
    setSelectedDocument(null);
    setOpen(true);
  };
  const fechar = () => {
    setOpen(false);
    setSelectedDocument(null);
  };
  const { show } = useSnackbar();

  const handleSave = async (payload) => {
    try {
      const res = selectedDocument
        ? await documentosService.atualizar(selectedDocument.id, payload)
        : await documentosService.criar(payload);

      show(res.message || (selectedDocument ? 'Documento atualizado' : 'Documento criado'), 'success');
      setReloadKey((k) => k + 1);
      fechar();
    } catch (err) {
      show(err?.message || 'Erro ao salvar documento', 'error');
    }
  };

  const handleEdit = (documento) => {
    setSelectedDocument(documento);
    setOpen(true);
  };

  const handlePreview = (documento) => {
    if (!documento.arquivoDisponivel) {
      show('Arquivo não encontrado no servidor.', 'error');
      return;
    }
    setPreviewFile(normalizeUploadUrl(documento.arquivo));
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
  };

  const columns = [
    { field: 'titulo', title: 'Título', sortable: true },
    { field: 'tipo', title: 'Tipo', sortable: true },
    { field: 'categoria', title: 'Categoria' },
    { field: 'numeroDocumento', title: 'Número', sortable: true },
    { field: 'fornecedor', title: 'Fornecedor' },
    { field: 'nivelAcesso', title: 'Nível de acesso' },
    { field: 'assinado', title: 'Assinado', render: (r) => (r.assinado ? 'Sim' : 'Não') },
    { field: 'responsavel', title: 'Responsável', render: (r) => r.responsavel?.nome || '-' },
    { field: 'data', title: 'Data', render: (r) => r.data ? new Date(r.data).toLocaleDateString() : '-' },
    { field: 'dataVencimento', title: 'Vencimento', render: (r) => r.dataVencimento ? new Date(r.dataVencimento).toLocaleDateString() : '-' },
    { field: 'status', title: 'Status' },
    { field: 'arquivoDisponivel', title: 'Arquivo', render: (r) => (r.arquivoDisponivel ? 'Disponível' : 'Indisponível') },
    {
      field: 'acoes',
      title: 'Ações',
      render: (r) => {
        const available = Boolean(r.arquivoDisponivel);
        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              component="a"
              size="small"
              color="primary"
              href={available ? normalizeUploadUrl(r.arquivo) : undefined}
              target="_blank"
              rel="noreferrer"
              disabled={!available}
            >
              Baixar
            </Button>
            <Button
              size="small"
              color="info"
              onClick={() => handlePreview(r)}
              disabled={!available}
            >
              Visualizar
            </Button>
            <Button size="small" color="secondary" onClick={() => handleEdit(r)}>
              Editar
            </Button>
            {!available && (
              <Typography variant="caption" color="error" sx={{ alignSelf: 'center' }}>
                Arquivo indisponível
              </Typography>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageHeader
        title="Documentos"
        subtitle="Gestão centralizada de documentos da organização"
        actions={
          <Button
            color="primary"
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={abrir}
            fullWidth={isMobile}
          >
            Novo Documento
          </Button>
        }
      />

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          select
          label="Categoria"
          size="small"
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ minWidth: 200 }}
        >
          <option value="">Todas</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </TextField>
        <TextField
          label="Data de"
          type="date"
          size="small"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Data até"
          type="date"
          size="small"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" size="small" onClick={() => setReloadKey(k => k + 1)}>Aplicar</Button>
      </Box>

      <DataTable
        columns={columns}
        fetchData={fetchDocumentos}
        initialLimit={10}
        emptyMessage="Nenhum documento encontrado"
        reloadKey={reloadKey}
        filters={{ categoria: categoriaFilter, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }}
      />

      <Dialog open={previewOpen} onClose={handleClosePreview} fullWidth maxWidth="xl">
        <DialogTitle>Visualizar Documento</DialogTitle>
        <DialogContent sx={{ minHeight: 400, p: 0 }}>
          {previewFile ? (
            (() => {
              const lower = previewFile.toLowerCase();
              if (lower.endsWith('.pdf')) {
                return (
                  <iframe src={previewFile} title="Visualização do Documento" style={{ width: '100%', height: '80vh', border: 'none' }} />
                );
              }
              if (lower.match(/\.(jpg|jpeg|png|gif)$/)) {
                return (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 2 }}>
                    <img src={previewFile} alt="preview" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
                  </Box>
                );
              }
              return (
                <iframe src={previewFile} title="Visualização do Documento" style={{ width: '100%', height: '80vh', border: 'none' }} />
              );
            })()
          ) : (
            <Box sx={{ p: 2 }}>Arquivo não disponível para visualização.</Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={fechar} fullWidth maxWidth="sm">
        <DialogTitle>{selectedDocument ? 'Editar Documento' : 'Novo Documento'}</DialogTitle>
        <DialogContent>
          <DocumentForm
            defaultValues={selectedDocument || { nivelAcesso: 'Público', status: 'Ativo', assinado: false }}
            onSubmit={handleSave}
            isEdit={Boolean(selectedDocument)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={fechar}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentosPage;
