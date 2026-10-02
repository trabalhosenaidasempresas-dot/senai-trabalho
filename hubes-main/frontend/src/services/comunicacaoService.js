import api from './api';
import { getCurrentDeviceTimestamp } from '../utils/timestamp';

export const comunicacaoService = {
  listar: async ({ pagina = 1, limite = 10, search = '', sortField = null, sortOrder = null, filters = {} } = {}) => {
    const response = await api.get('/comunicacao', { params: { pagina, limite, search, sortField, sortOrder, ...filters } });
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/comunicacao/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const payload = { ...dados, deviceTimestamp: getCurrentDeviceTimestamp() };
    const response = await api.post('/comunicacao', payload);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const payload = { ...dados, deviceTimestamp: getCurrentDeviceTimestamp() };
    const response = await api.put(`/comunicacao/${id}`, payload);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/comunicacao/${id}`);
    return response.data;
  },
};
