import prisma from '../config/database.js';

export const criarEvento = async (dados) => prisma.evento.create({ data: dados });
export const buscarEventoPorId = async (id) => prisma.evento.findUnique({ where: { id } });
export const listarEventos = async (skip = 0, take = 10, search = null, sortField = 'createdAt', sortOrder = 'desc') => {
  const where = search
    ? {
        OR: [
          { titulo: { contains: search, mode: 'insensitive' } },
          { tipo: { contains: search, mode: 'insensitive' } },
          { local: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};
  const allowedSortFields = ['titulo', 'dataInicio', 'dataFim', 'tipo', 'status', 'createdAt'];
  const orderDirection = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  const orderBy = allowedSortFields.includes(sortField) ? { [sortField]: orderDirection } : { createdAt: 'desc' };
  return prisma.evento.findMany({ where, skip, take, orderBy });
};
export const contarEventos = async (search = null) => {
  const where = search
    ? {
        OR: [
          { titulo: { contains: search, mode: 'insensitive' } },
          { tipo: { contains: search, mode: 'insensitive' } },
          { local: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};
  return prisma.evento.count({ where });
};
export const atualizarEvento = async (id, dados) => prisma.evento.update({ where: { id }, data: dados });
export const deletarEvento = async (id) => prisma.evento.delete({ where: { id } });

export const buscarEventosPorLocalEPeriodo = async (local, start, end) => {
  return prisma.evento.findMany({
    where: {
      local: local,
      AND: [
        { dataInicio: { lt: end } },
        { dataFim: { gt: start } },
      ],
    },
    orderBy: { dataInicio: 'asc' },
  });
};

export const existeConflito = async (local, start, end) => {
  const encontrados = await buscarEventosPorLocalEPeriodo(local, start, end);
  return encontrados && encontrados.length > 0;
};
