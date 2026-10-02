import prisma from '../config/database.js';
import bcrypt from 'bcrypt';

const activeUserFilter = {
  ativo: true,
  deletadoEm: null,
};

// Criar usuário
export const criarUsuario = async (dados) => {
  const senhaCriptografada = await bcrypt.hash(dados.senha, 10);

  return prisma.usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senha: senhaCriptografada,
      telefone: dados.telefone,
      setor: dados.setor,
      perfil: dados.perfil || 'Servidor',
      status: dados.status || 'Ativo',
      criadoPor: dados.criadoPor || null,
      ativo: true,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      setor: true,
      perfil: true,
      status: true,
      foto: true,
      criadoPor: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// Buscar usuário por ID
export const buscarPorId = async (id) => {
  return prisma.usuario.findFirst({
    where: {
      id,
      ...activeUserFilter,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      setor: true,
      perfil: true,
      status: true,
      foto: true,
      criadoPor: true,
      atualizadoPor: true,
      ultimoLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// Buscar usuário por email
export const buscarPorEmail = async (email) => {
  return prisma.usuario.findUnique({
    where: { email },
  });
};

const buildUserFilter = (search, perfil, status) => {
  const filters = {
    ...activeUserFilter,
  };

  if (search) {
    filters.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { setor: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (perfil) {
    filters.perfil = perfil;
  }

  if (status) {
    filters.status = status;
  }

  return filters;
};

// Listar todos os usuários
export const listarTodos = async (
  skip = 0,
  take = 10,
  search = null,
  perfil = null,
  status = null,
  sortField = 'createdAt',
  sortOrder = 'desc',
) => {
  const where = buildUserFilter(search, perfil, status);

  const allowedSortFields = ['nome', 'email', 'setor', 'perfil', 'status', 'createdAt', 'updatedAt'];
  const orderDirection = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  const orderBy = allowedSortFields.includes(sortField) ? { [sortField]: orderDirection } : { createdAt: 'desc' };

  return prisma.usuario.findMany({
    where,
    skip,
    take,
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      setor: true,
      perfil: true,
      status: true,
      criadoPor: true,
      atualizadoPor: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy,
  });
};

// Contar total de usuários
export const contar = async (search = null, perfil = null, status = null) => {
  const where = buildUserFilter(search, perfil, status);
  return prisma.usuario.count({ where });
};

// Atualizar usuário
export const atualizar = async (id, dados) => {
  const updateData = { ...dados };

  if (dados.senha) {
    updateData.senha = await bcrypt.hash(dados.senha, 10);
  }

  return prisma.usuario.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      setor: true,
      perfil: true,
      status: true,
      foto: true,
      atualizadoPor: true,
      updatedAt: true,
    },
  });
};

// Deletar usuário
export const deletar = async (id, deletedBy = null) => {
  return prisma.usuario.update({
    where: { id },
    data: {
      ativo: false,
      status: 'Inativo',
      deletadoPor: deletedBy,
      deletadoEm: new Date(),
    },
  });
};
