import api from './api';
import { getCurrentDeviceTimestamp } from '../utils/timestamp';

export const estoqueService = {
  listar: async ({ pagina = 1, limite = 10, search = '', sortField = null, sortOrder = null, filters = {} } = {}) => {
    const response = await api.get('/estoque', { params: { pagina, limite, search, sortField, sortOrder, ...filters } });
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/estoque/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const payload = { ...dados, unidade: dados.unidade ?? 'Un', deviceTimestamp: getCurrentDeviceTimestamp() };
    const response = await api.post('/estoque', payload);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const payload = { ...dados, deviceTimestamp: getCurrentDeviceTimestamp() };
    const response = await api.put(`/estoque/${id}`, payload);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/estoque/${id}`);
    return response.data;
  },

  listarMovimentacoes: async (id) => {
    const response = await api.get(`/estoque/${id}/movimentacoes`);
    return response.data.data;
  },

  criarMovimentacao: async (id, dados) => {
    const response = await api.post(`/estoque/${id}/movimentacoes`, dados);
    return response.data.data;
  },
};
