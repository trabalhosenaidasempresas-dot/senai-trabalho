import api from './api';
import { getCurrentDeviceTimestamp } from '../utils/timestamp';

export const ocorrenciasService = {
  listar: async ({ pagina = 1, limite = 10, search = '', sortField = null, sortOrder = null, filters = {} } = {}) => {
    const response = await api.get('/ocorrencias', { params: { pagina, limite, search, sortField, sortOrder, ...filters } });
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/ocorrencias/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const timestamp = getCurrentDeviceTimestamp();
    if (dados instanceof FormData) {
      dados.append('deviceTimestamp', timestamp);
      const response = await api.post('/ocorrencias', dados);
      return response.data;
    }
    const response = await api.post('/ocorrencias', { ...dados, deviceTimestamp: timestamp });
    return response.data;
  },

  atualizar: async (id, dados) => {
    const timestamp = getCurrentDeviceTimestamp();
    if (dados instanceof FormData) {
      dados.append('deviceTimestamp', timestamp);
      const response = await api.put(`/ocorrencias/${id}`, dados);
      return response.data;
    }
    const response = await api.put(`/ocorrencias/${id}`, { ...dados, deviceTimestamp: timestamp });
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/ocorrencias/${id}`);
    return response.data;
  },
};
