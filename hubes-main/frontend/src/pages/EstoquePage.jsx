import React, { useState, useEffect } from 'react';
import { Box, Button, Chip, IconButton, Dialog, DialogActions, DialogContent, FormControl, InputLabel, Select, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { estoqueService } from '../services/estoqueService';
import DataTable from '../components/common/DataTable';
import ProdutoForm from '../components/common/ProdutoForm';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useSnackbar } from '../components/common/SnackbarProvider';

export const EstoquePage = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [movementOpen, setMovementOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementData, setMovementData] = useState({ tipo: 'Entrada', quantidade: 1, data: new Date().toISOString().split('T')[0], observacao: '' });
  const [movementHistory, setMovementHistory] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { show } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getNivelBadge = ({ quantidade, estoqueMinimo, estoqueMaximo }) => {
    const qtd = Number(quantidade ?? 0);
    const min = Number(estoqueMinimo ?? 0);
    const max = estoqueMaximo != null ? Number(estoqueMaximo) : null;

    if (qtd === 0) return <Chip label="🔴 Sem Estoque" color="error" size="small" />;
    if (qtd <= min) return <Chip label="🟡 Estoque Baixo" color="warning" size="small" />;
    if (max != null && qtd >= max) return <Chip label="🔵 Estoque Máximo" color="info" size="small" />;
    return <Chip label="🟢 Estoque Normal" color="success" size="small" />;
  };

  const handleOpen = (produto = null) => {
    setSelected(produto);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  const handleOpenMovement = (produto) => {
    setSelectedProduct(produto);
    setMovementData({ tipo: 'Entrada', quantidade: 1, data: new Date().toISOString().split('T')[0], observacao: '' });
    setMovementOpen(true);
  };

  const handleCloseMovement = () => {
    setMovementOpen(false);
    setSelectedProduct(null);
  };

  const handleOpenHistory = async (produto) => {
    setSelectedProduct(produto);
    setHistoryOpen(true);
    setLoadingHistory(true);
    try {
      const history = await estoqueService.listarMovimentacoes(produto.id);
      setMovementHistory(history || []);
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao carregar histórico', 'error');
      setMovementHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (selected) await estoqueService.atualizar(selected.id, data);
      else await estoqueService.criar(data);
      show('Produto salvo com sucesso', 'success');
      setReloadKey((k) => k + 1);
      handleClose();
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao salvar produto', 'error');
    }
  };

  const handleSaveMovement = async () => {
    try {
      await estoqueService.criarMovimentacao(selectedProduct.id, movementData);
      show('Movimentação registrada com sucesso', 'success');
      setReloadKey((k) => k + 1);
      handleCloseMovement();
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao registrar movimentação', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await estoqueService.deletar(toDeleteId);
      show('Produto deletado com sucesso', 'success');
      setReloadKey((k) => k + 1);
    } catch (err) {
      show(err.response?.data?.message || 'Erro ao deletar produto', 'error');
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  React.useEffect(() => {
    setReloadKey((k) => k + 1);
  }, [categoryFilter, locationFilter]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageHeader 
        title="Estoque"
        subtitle="Controle de produtos e inventário"
        actions={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpen()}
            fullWidth={isMobile}
          >
            Novo Produto
          </Button>
        }
      />

      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="filtro-categoria-label">Categoria</InputLabel>
          <Select
            labelId="filtro-categoria-label"
            label="Categoria"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Copa">Copa</MenuItem>
            <MenuItem value="Higiene">Higiene</MenuItem>
            <MenuItem value="Limpeza">Limpeza</MenuItem>
            <MenuItem value="Material de Escritório">Material de Escritório</MenuItem>
            <MenuItem value="Manutenção">Manutenção</MenuItem>
            <MenuItem value="Informática">Informática</MenuItem>
            <MenuItem value="Diversos">Diversos</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="filtro-local-label">Localização</InputLabel>
          <Select
            labelId="filtro-local-label"
            label="Localização"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Terreo">Térreo</MenuItem>
            <MenuItem value="2o andar">2º andar</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <DataTable
        columns={[
          { field: 'nome', title: 'Nome', sortable: true },
          { field: 'codigo', title: 'Código' },
          { field: 'categoria', title: 'Categoria' },
          { field: 'localizacao', title: 'Local' },
          { field: 'quantidade', title: 'Qtd Atual' },
          { field: 'estoqueMinimo', title: 'Mínimo' },
          { field: 'estoqueMaximo', title: 'Máximo' },
          { field: 'ultimaReposicao', title: 'Última Reposição', render: (row) => row.ultimaReposicao ? new Date(row.ultimaReposicao).toLocaleDateString() : '-' },
          { field: 'nivel', title: 'Nível', render: (row) => getNivelBadge(row) },
          { field: 'acoes', title: 'Ações', render: (row) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" onClick={() => handleOpen(row)}><EditIcon /></IconButton>
              <IconButton size="small" onClick={() => handleOpenMovement(row)}><AddCircleIcon /></IconButton>
              <IconButton size="small" onClick={() => handleOpenHistory(row)}><HistoryIcon /></IconButton>
              <IconButton size="small" onClick={() => { setToDeleteId(row.id); setConfirmOpen(true); }}><DeleteIcon /></IconButton>
            </Box>
          ) },
        ]}
        fetchData={(params) => estoqueService.listar({ ...params, filters: { categoria: categoryFilter, localizacao: locationFilter } })}
        reloadKey={reloadKey}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth={false}
        PaperProps={{ sx: { width: 860, maxWidth: 860 } }}
      >
        <DialogContent sx={{ p: 3 }}>
          <ProdutoForm defaultValues={selected || {}} onSubmit={handleSave} onCancel={handleClose} />
        </DialogContent>
      </Dialog>

      <Dialog open={movementOpen} onClose={handleCloseMovement} fullWidth maxWidth="sm">
        <DialogContent sx={{ p: 3, display: 'grid', gap: 2 }}>
          <Typography variant="h6">Registrar movimentação</Typography>
          <TextField
            label="Produto"
            value={selectedProduct?.nome || ''}
            fullWidth
            disabled
          />
          <FormControl fullWidth size="small">
            <InputLabel id="mov-type-label">Tipo</InputLabel>
            <Select
              labelId="mov-type-label"
              label="Tipo"
              value={movementData.tipo}
              onChange={(e) => setMovementData((prev) => ({ ...prev, tipo: e.target.value }))}
            >
              <MenuItem value="Entrada">Entrada</MenuItem>
              <MenuItem value="Saida">Saída</MenuItem>
              <MenuItem value="Reposicao">Reposição</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Quantidade"
            type="number"
            fullWidth
            value={movementData.quantidade}
            onChange={(e) => setMovementData((prev) => ({ ...prev, quantidade: Number(e.target.value) }))}
          />
          <TextField
            label="Data"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={movementData.data}
            onChange={(e) => setMovementData((prev) => ({ ...prev, data: e.target.value }))}
          />
          <TextField
            label="Observação"
            fullWidth
            multiline
            minRows={3}
            value={movementData.observacao}
            onChange={(e) => setMovementData((prev) => ({ ...prev, observacao: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseMovement}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveMovement}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} fullWidth maxWidth="md">
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Histórico de movimentações</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>{selectedProduct?.nome || ''}</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Quantidade</TableCell>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Observação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingHistory ? (
                  <TableRow><TableCell colSpan={5}>Carregando...</TableCell></TableRow>
                ) : movementHistory.length ? (
                  movementHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.tipo}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell>{item.usuario?.nome || item.usuarioEmail || '-'}</TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{item.motivo}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5}>Nenhuma movimentação encontrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setHistoryOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Deletar produto"
        message="Deseja realmente deletar este produto?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default EstoquePage;
