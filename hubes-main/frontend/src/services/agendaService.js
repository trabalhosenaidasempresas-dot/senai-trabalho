import api from './api';
import { getCurrentDeviceTimestamp } from '../utils/timestamp';

export const agendaService = {
  listar: async ({ pagina = 1, limite = 10, search = '', sortField = null, sortOrder = null, filters = {} } = {}) => {
    const response = await api.get('/agenda', { params: { pagina, limite, search, sortField, sortOrder, ...filters } });
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/agenda/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const payload = { ...dados, deviceTimestamp: getCurrentDeviceTimestamp() };
    const response = await api.post('/agenda', payload);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const payload = { ...dados, deviceTimestamp: getCurrentDeviceTimestamp() };
    const response = await api.put(`/agenda/${id}`, payload);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/agenda/${id}`);
    return response.data;
  },
  disponibilidade: async ({ local, date, start, end } = {}) => {
    const params = { local, date };
    if (start) params.start = start;
    if (end) params.end = end;
    const response = await api.get('/agenda/disponibilidade', { params });
    return response.data;
  },
};
