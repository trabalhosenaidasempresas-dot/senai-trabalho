import prisma from '../config/database.js';

export const criarComunicado = async (dados) => prisma.comunicado.create({ data: dados });
export const buscarComunicadoPorId = async (id) => prisma.comunicado.findUnique({ where: { id } });
export const listarComunicados = async (skip = 0, take = 10, search = null, sortField = 'createdAt', sortOrder = 'desc') => {
  const where = search
    ? {
        OR: [
          { titulo: { contains: search, mode: 'insensitive' } },
          { conteudo: { contains: search, mode: 'insensitive' } },
          { tipo: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};
  const allowedSortFields = ['titulo', 'tipo', 'status', 'dataPublicacao', 'createdAt'];
  const orderDirection = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  const orderBy = allowedSortFields.includes(sortField) ? { [sortField]: orderDirection } : { createdAt: 'desc' };
  return prisma.comunicado.findMany({ where, skip, take, orderBy });
};
export const contarComunicados = async (search = null) => {
  const where = search
    ? {
        OR: [
          { titulo: { contains: search, mode: 'insensitive' } },
          { conteudo: { contains: search, mode: 'insensitive' } },
          { tipo: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};
  return prisma.comunicado.count({ where });
};
export const atualizarComunicado = async (id, dados) => prisma.comunicado.update({ where: { id }, data: dados });
export const deletarComunicado = async (id) => prisma.comunicado.delete({ where: { id } });
