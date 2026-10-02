import * as usuarioRepository from '../repositories/usuarioRepository.js';
import { ApiError } from '../utils/errors.js';

export const criarUsuario = async (dados) => {
  if (!dados.nome || !dados.email || !dados.senha) {
    throw ApiError.badRequest('Nome, email e senha são obrigatórios');
  }

  const usuarioExistente = await usuarioRepository.buscarPorEmail(dados.email);
  if (usuarioExistente) {
    throw ApiError.badRequest('Email já cadastrado');
  }

  return usuarioRepository.criarUsuario(dados);
};

export const obterUsuario = async (id) => {
  const usuario = await usuarioRepository.buscarPorId(id);
  if (!usuario) {
    throw ApiError.notFound('Usuário não encontrado');
  }
  return usuario;
};

export const listarUsuarios = async (
  pagina = 1,
  limite = 10,
  search = null,
  perfil = null,
  status = null,
  sortField = 'createdAt',
  sortOrder = 'desc',
) => {
  const skip = (pagina - 1) * limite;
  const usuarios = await usuarioRepository.listarTodos(skip, limite, search, perfil, status, sortField, sortOrder);
  const total = await usuarioRepository.contar(search, perfil, status);

  return {
    usuarios,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    },
  };
};

export const atualizarUsuario = async (id, dados, updatedBy = null) => {
  const usuario = await usuarioRepository.buscarPorId(id);
  if (!usuario) {
    throw ApiError.notFound('Usuário não encontrado');
  }

  if (dados.email && dados.email !== usuario.email) {
    const emailExistente = await usuarioRepository.buscarPorEmail(dados.email);
    if (emailExistente) {
      throw ApiError.badRequest('Email já cadastrado');
    }
  }

  return usuarioRepository.atualizar(id, { ...dados, atualizadoPor: updatedBy });
};

export const deletarUsuario = async (id, deletedBy = null) => {
  const usuario = await usuarioRepository.buscarPorId(id);
  if (!usuario) {
    throw ApiError.notFound('Usuário não encontrado');
  }

  return usuarioRepository.deletar(id, deletedBy);
};
