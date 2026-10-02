import api from './api';
import { getCurrentDeviceTimestamp } from '../utils/timestamp';

export const servicosService = {
  listar: async ({ pagina = 1, limite = 10, search = '', sortField = null, sortOrder = null, filters = {} } = {}) => {
    const response = await api.get('/servicos', { params: { pagina, limite, search, sortField, sortOrder, ...filters } });
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/servicos/${id}`);
    return response.data.data;
  },

  criar: async (dados) => {
    const payload = dados instanceof FormData ? dados : { ...dados, deviceTimestamp: getCurrentDeviceTimestamp() };
    const config = dados instanceof FormData ? {} : {};
    const response = await api.post('/servicos', payload, config);
    return response.data.data;
  },

  atualizar: async (id, dados) => {
    const payload = dados instanceof FormData ? dados : { ...dados, deviceTimestamp: getCurrentDeviceTimestamp() };
    const config = dados instanceof FormData ? {} : {};
    const response = await api.put(`/servicos/${id}`, payload, config);
    return response.data.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/servicos/${id}`);
    return response.data;
  },
};
