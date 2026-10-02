import api from './api';
import { getCurrentDeviceTimestamp } from '../utils/timestamp';

export const comprasService = {
  listar: async ({ pagina = 1, limite = 10, search = '', sortField = null, sortOrder = null, filters = {} } = {}) => {
    const response = await api.get('/compras', { params: { pagina, limite, search, sortField, sortOrder, ...filters } });
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/compras/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const payload = { ...dados, deviceTimestamp: getCurrentDeviceTimestamp() };
    const response = await api.post('/compras', payload);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const payload = { ...dados, deviceTimestamp: getCurrentDeviceTimestamp() };
    const response = await api.put(`/compras/${id}`, payload);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/compras/${id}`);
    return response.data;
  },
};
