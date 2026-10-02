import React, { useState } from 'react';
import { Box, Button, IconButton, Dialog, DialogActions, DialogContent, useTheme, useMediaQuery, Chip, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { servicosService } from '../services/servicosService';
import DataTable from '../components/common/DataTable';
import ServicoForm from '../components/common/ServicoForm';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useSnackbar } from '../components/common/SnackbarProvider';

const getStatusColor = (status) => {
  if (!status) return 'default';
  const normalized = status.toLowerCase();
  if (normalized.includes('vencido')) return 'error';
  if (normalized.includes('vigente') || normalized.includes('em andamento')) return 'success';
  if (normalized.includes('vencendo')) return 'warning';
  return 'default';
};

const TIPO_SERVICO_LABELS = {
  Contratado: 'Serviços Contratados',
  Manutenção: 'Manutenções',
};

export const ServicosPage = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [loadingViewing, setLoadingViewing] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [equipamentoFilter, setEquipamentoFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [situacaoFilter, setSituacaoFilter] = useState('');
  const [fornecedorFilter, setFornecedorFilter] = useState('');
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFim, setPeriodoFim] = useState('');
  const { show } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpen = (servico = null) => {
    setSelected(servico);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
    setViewing(null);
  };

  const handleSave = async (data) => {
    try {
      if (selected) await servicosService.atualizar(selected.id, data);
      else await servicosService.criar(data);
      show('Serviço salvo com sucesso', 'success');
      setReloadKey((k) => k + 1);
      handleClose();
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao salvar serviço', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await servicosService.deletar(toDeleteId);
      show('Serviço deletado com sucesso', 'success');
      setReloadKey((k) => k + 1);
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao deletar serviço', 'error');
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  const handleView = async (servico) => {
    try {
      setLoadingViewing(true);
      const fullServico = await servicosService.obter(servico.id);
      setViewing(fullServico);
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao carregar detalhes do serviço', 'error');
    } finally {
      setLoadingViewing(false);
    }
  };

  const formatOptionalDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleDateString();
    return value;
  };

  const renderStatus = (row) => <Chip label={row.status || '-'} color={getStatusColor(row.status)} size="small" />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageHeader
        title="Serviços e Manutenções"
        subtitle="Cadastre, acompanhe e anexe documentos e fotos de serviços previstos"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            fullWidth={isMobile}
          >
            Novo Serviço
          </Button>
        }
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(event, value) => {
            setActiveTab(value);
            setReloadKey((k) => k + 1);
          }}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
        >
          <Tab label="Todos" value="" />
          <Tab label="Serviços Contratados" value="Contratado" />
          <Tab label="Manutenções" value="Manutenção" />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Equipamento"
          size="small"
          value={equipamentoFilter}
          onChange={(e) => setEquipamentoFilter(e.target.value)}
        />
        <TextField
          label="Fornecedor"
          size="small"
          value={fornecedorFilter}
          onChange={(e) => setFornecedorFilter(e.target.value)}
        />
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>Categoria</InputLabel>
          <Select
            label="Categoria"
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            {['Seguranca','Limpeza','Manutencao','Recepcao','Bombeiros','Ar condicionado','Elevador','Extintores','Bomba hidraulica','Caixa d\'agua','Dedetizacao','Limpeza de esgoto','Outros'].map((categoria) => (
              <MenuItem key={categoria} value={categoria}>{categoria}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel>Situação</InputLabel>
          <Select
            label="Situação"
            value={situacaoFilter}
            onChange={(e) => setSituacaoFilter(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Vigente">Vigente</MenuItem>
            <MenuItem value="Vencido">Vencido</MenuItem>
            <MenuItem value="Vencendo em até 30 dias">Vencendo em até 30 dias</MenuItem>
            <MenuItem value="Pendente">Pendente</MenuItem>
            <MenuItem value="Concluído">Concluído</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Período início"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={periodoInicio}
          onChange={(e) => setPeriodoInicio(e.target.value)}
        />
        <TextField
          label="Período fim"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={periodoFim}
          onChange={(e) => setPeriodoFim(e.target.value)}
        />
        <Button
          variant="outlined"
          onClick={() => {
            setActiveTab('');
            setEquipamentoFilter('');
            setCategoriaFilter('');
            setSituacaoFilter('');
            setFornecedorFilter('');
            setPeriodoInicio('');
            setPeriodoFim('');
            setReloadKey((k) => k + 1);
          }}
        >
          Limpar filtros
        </Button>
      </Box>

      <DataTable
        columns={[
          { field: 'tipoServico', title: 'Tipo', sortable: true, render: (row) => TIPO_SERVICO_LABELS[row.tipoServico] || row.tipoServico || '-' },
          { field: 'nome', title: 'Serviço', sortable: true },
          { field: 'equipamento', title: 'Equipamento' },
          { field: 'categoria', title: 'Categoria' },
          { field: 'fornecedor', title: 'Fornecedor' },
          { field: 'proximaManutencao', title: 'Próxima Manutenção', render: (r) => (r.proximaManutencao ? new Date(r.proximaManutencao).toLocaleDateString() : '-') },
          { field: 'situacao', title: 'Situação' },
          { field: 'status', title: 'Status', render: renderStatus },
          { field: 'acoes', title: 'Ações', render: (row) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" onClick={() => handleView(row)}><VisibilityIcon /></IconButton>
              <IconButton size="small" onClick={() => handleOpen(row)}><EditIcon /></IconButton>
              <IconButton size="small" onClick={() => { setToDeleteId(row.id); setConfirmOpen(true); }}><DeleteIcon /></IconButton>
            </Box>
          ) },
        ]}
        fetchData={(params) => servicosService.listar({
          ...params,
          filters: {
            tipoServico: activeTab || undefined,
            equipamento: equipamentoFilter,
            categoria: categoriaFilter,
            fornecedor: fornecedorFilter,
            situacao: situacaoFilter,
            periodoInicio,
            periodoFim,
          },
        })}
        reloadKey={reloadKey}
        filters={{
          tipoServico: activeTab || undefined,
          equipamento: equipamentoFilter,
          categoria: categoriaFilter,
          fornecedor: fornecedorFilter,
          situacao: situacaoFilter,
          periodoInicio,
          periodoFim,
        }}
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogContent>
          <ServicoForm defaultValues={selected || {}} onSubmit={handleSave} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Deletar serviço"
        message="Deseja realmente deletar este serviço?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />

      <Dialog open={Boolean(viewing)} onClose={() => setViewing(null)} fullWidth maxWidth="md">
        <DialogContent>
          {viewing ? (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="h6">{viewing.nome}</Typography>
              <Typography variant="body2">Tipo: {TIPO_SERVICO_LABELS[viewing.tipoServico] || viewing.tipoServico || '-'}</Typography>
              <Typography variant="body2">Categoria: {viewing.categoria}</Typography>
              <Typography variant="body2">Fornecedor: {viewing.fornecedor}</Typography>
              <Typography variant="body2">Equipamento: {viewing.equipamento || '-'}</Typography>
              <Typography variant="body2">Escala: {viewing.escala || '-'}</Typography>
              <Typography variant="body2">Documento relacionado: {viewing.documento ? viewing.documento.titulo : (viewing.documentoId || '-')}</Typography>
              <Typography variant="body2">Situação: {viewing.situacao || '-'}</Typography>
              <Typography variant="body2">Periodicidade: {viewing.periodicidade}</Typography>
              <Typography variant="body2">Início: {viewing.dataInicio ? new Date(viewing.dataInicio).toLocaleDateString() : '-'}</Typography>
              <Typography variant="body2">Vencimento: {viewing.dataVencimento ? new Date(viewing.dataVencimento).toLocaleDateString() : '-'}</Typography>
              <Typography variant="body2">Última manutenção: {formatOptionalDate(viewing.ultimaManutencao)}</Typography>
              <Typography variant="body2">Próxima manutenção: {viewing.proximaManutencao ? new Date(viewing.proximaManutencao).toLocaleDateString() : '-'}</Typography>
              <Typography variant="body2">Status: {viewing.status}</Typography>
              <Typography variant="body2">Observações:</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>{viewing.observacoes || '-'}</Typography>
              <Typography variant="body2">Anexos:</Typography>
              {Array.isArray(viewing.anexos) && viewing.anexos.length ? (
                viewing.anexos.map((item) => (
                  <Button
                    key={item}
                    size="small"
                    startIcon={<AttachFileIcon />}
                    component="a"
                    href={item}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.split('/').pop()}
                  </Button>
                ))
              ) : (
                <Typography variant="body2">Nenhum anexo</Typography>
              )}
              <Typography variant="body2">Fotos:</Typography>
              {Array.isArray(viewing.fotos) && viewing.fotos.length ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1 }}>
                  {viewing.fotos.map((item) => (
                    <Box key={item} component="a" href={item} target="_blank" rel="noreferrer" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                      <img src={item} alt="Foto do serviço" style={{ width: '100%', display: 'block' }} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2">Nenhuma foto</Typography>
              )}
              <Typography variant="h6" sx={{ mt: 2 }}>Histórico</Typography>
              {Array.isArray(viewing.historico) && viewing.historico.length ? (
                viewing.historico.map((entry) => (
                  <Box key={entry.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
                    <Typography variant="subtitle2">{entry.acao}</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{entry.descricao || '-'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {entry.usuarioEmail ? `Usuário: ${entry.usuarioEmail}` : 'Usuário não informado'} • {new Date(entry.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">Nenhum histórico disponível</Typography>
              )}
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ServicosPage;
