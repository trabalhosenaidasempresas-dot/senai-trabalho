import api from './api';
import { getCurrentDeviceTimestamp } from '../utils/timestamp';

export const documentosService = {
  listar: async (pagina = 1, limite = 10, search = '', sortField = null, sortOrder = null, categoria = '', dateFrom = undefined, dateTo = undefined) => {
    const params = { pagina, limite, search, sortField, sortOrder };
    if (categoria) params.categoria = categoria;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    const response = await api.get('/documentos', { params });
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/documentos/${id}`);
    return response.data;
  },

  criar: async (formData) => {
    formData.append('deviceTimestamp', getCurrentDeviceTimestamp());
    const response = await api.post('/documentos', formData);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const timestamp = getCurrentDeviceTimestamp();
    if (dados instanceof FormData) {
      dados.append('deviceTimestamp', timestamp);
      const response = await api.put(`/documentos/${id}`, dados);
      return response.data;
    }
    const response = await api.put(`/documentos/${id}`, { ...dados, deviceTimestamp: timestamp });
    return response.data;
  },

  adicionarVersao: async (id, formData) => {
    const response = await api.post(`/documentos/${id}/versoes`, formData);
    return response.data;
  },

  listarVersoes: async (id) => {
    const response = await api.get(`/documentos/${id}/versoes`);
    return response.data;
  }
};

export default documentosService;
