// Serviço de API para usuários
import api from './api';

export const usuariosService = {
  listar: async (pagina = 1, limite = 10, search = '', sortField = null, sortOrder = null) => {
    const response = await api.get('/usuarios', {
      params: { pagina, limite, search, sortField, sortOrder }
    });
    return response.data;
  },

  obter: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post('/usuarios', dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/usuarios/${id}`, dados);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  uploadFoto: async (id, file) => {
    const formData = new FormData();
    formData.append('foto', file);
    const response = await api.post(`/usuarios/${id}/foto`, formData);
    return response.data;
  },

  mudarSenha: async (senhaAtual, novaSenha) => {
    const response = await api.post('/auth/change-password', {
      senhaAtual,
      novaSenha,
    });
    return response.data;
  },
};

