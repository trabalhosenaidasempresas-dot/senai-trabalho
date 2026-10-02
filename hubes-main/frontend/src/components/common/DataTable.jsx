import React, { useEffect, useState } from 'react';
import { Box, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, TextField, IconButton, TableSortLabel, Pagination, CircularProgress, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export const DataTable = ({ columns, fetchData, initialPage = 1, initialLimit = 10, rowKey = 'id', emptyMessage = 'Nenhum registro encontrado', reloadKey, filters = {} }) => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await fetchData({ pagina: p, limite: limit, search, sortField, sortOrder, filters });
      // support various response shapes from different services
      const dataRows = res.eventos || res.documentos || res.usuarios || res.produtos || res.data || res.rows || [];
      const pag = res.paginacao || res.pagination || { pagina: p, limite: limit, totalPaginas: 1 };
      setRows(dataRows);
      setTotalPages(pag.totalPaginas || 1);
      setPage(pag.pagina || p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [search, sortField, sortOrder, reloadKey, JSON.stringify(filters)]);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField size="small" placeholder="Pesquisar" value={search} onChange={(e) => setSearch(e.target.value)} />
          <IconButton><SearchIcon /></IconButton>
        </Box>
        {loading && <CircularProgress size={20} />}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.field} align={col.align || 'left'}>
                  {col.sortable ? (
                    <TableSortLabel active={sortField===col.field} direction={sortOrder} onClick={() => handleSort(col.field)}>{col.title}</TableSortLabel>
                  ) : col.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length} sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : rows.length ? (
              rows.map(row => (
                <TableRow key={row[rowKey]}>
                  {columns.map(col => (
                    <TableCell key={col.field} align={col.align || 'left'}>{col.render ? col.render(row) : row[col.field]}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={totalPages} page={page} onChange={(e, v) => load(v)} />
      </Box>
    </Box>
  );
};

export default DataTable;
