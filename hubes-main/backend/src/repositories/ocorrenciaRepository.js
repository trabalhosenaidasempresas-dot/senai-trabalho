import prisma from '../config/database.js';

export const criarOcorrencia = async (dados) => {
  // Guardar arrays diretamente; Prisma lida com String[] nativamente no PostgreSQL.
  const data = { ...dados };
  return prisma.ocorrencia.create({ data });
};

export const buscarOcorrenciaPorId = async (id) => {
  const ocorrencia = await prisma.ocorrencia.findFirst({
    where: { id, deletadoEm: null },
    include: { responsavel: true },
  });
  if (!ocorrencia) return null;
  // Desserializar campos armazenados como JSON string quando aplicável
  const copy = { ...ocorrencia };
  try {
    if (typeof copy.fotos === 'string' && copy.fotos.trim() !== '') copy.fotos = JSON.parse(copy.fotos);
    else if (!copy.fotos) copy.fotos = [];
  } catch { copy.fotos = []; }
  try {
    if (typeof copy.anexos === 'string' && copy.anexos.trim() !== '') copy.anexos = JSON.parse(copy.anexos);
    else if (!copy.anexos) copy.anexos = [];
  } catch { copy.anexos = []; }
  return copy;
};

export const buscarUltimaOcorrencia = async () => prisma.ocorrencia.findFirst({
  orderBy: { createdAt: 'desc' },
  select: { numeroOcorrencia: true },
});

export const listarOcorrencias = async (
  skip = 0,
  take = 10,
  search = null,
  status = null,
  prioridade = null,
  setor = null,
  sortField = 'createdAt',
  sortOrder = 'desc',
) => {
  const where = {
    deletadoEm: null,
  };

  if (search) {
    where.OR = [
      { titulo: { contains: search, mode: 'insensitive' } },
      { descricao: { contains: search, mode: 'insensitive' } },
      { local: { contains: search, mode: 'insensitive' } },
      { setor: { contains: search, mode: 'insensitive' } },
      { numeroOcorrencia: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (prioridade) {
    where.prioridade = prioridade;
  }

  if (setor) {
    where.setor = setor;
  }

  const allowedSortFields = ['titulo', 'numeroOcorrencia', 'prioridade', 'status', 'local', 'setor', 'data', 'createdAt'];
  const orderDirection = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  const orderBy = allowedSortFields.includes(sortField) ? { [sortField]: orderDirection } : { createdAt: 'desc' };

  const results = await prisma.ocorrencia.findMany({
    where,
    skip,
    take,
    include: { responsavel: true },
    orderBy,
  });

  // Desserializar campos que podem ter sido armazenados como JSON string
  return results.map((oc) => {
    const copy = { ...oc };
    try {
      if (typeof copy.fotos === 'string' && copy.fotos.trim() !== '') copy.fotos = JSON.parse(copy.fotos);
      else if (!copy.fotos) copy.fotos = [];
    } catch { copy.fotos = []; }
    try {
      if (typeof copy.anexos === 'string' && copy.anexos.trim() !== '') copy.anexos = JSON.parse(copy.anexos);
      else if (!copy.anexos) copy.anexos = [];
    } catch { copy.anexos = []; }
    return copy;
  });
};

export const contarOcorrencias = async (search = null, status = null, prioridade = null, setor = null) => {
  const where = {
    deletadoEm: null,
  };

  if (search) {
    where.OR = [
      { titulo: { contains: search, mode: 'insensitive' } },
      { descricao: { contains: search, mode: 'insensitive' } },
      { local: { contains: search, mode: 'insensitive' } },
      { setor: { contains: search, mode: 'insensitive' } },
      { numeroOcorrencia: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (prioridade) {
    where.prioridade = prioridade;
  }

  if (setor) {
    where.setor = setor;
  }

  return prisma.ocorrencia.count({ where });
};

export const atualizarOcorrencia = async (id, dados) => {
  const data = { ...dados };
  return prisma.ocorrencia.update({ where: { id }, data });
};

export const softDeleteOcorrencia = async (id) => prisma.ocorrencia.update({
  where: { id },
  data: { deletadoEm: new Date() },
});

export const adicionarHistorico = async (ocorrenciaId, acao, descricao, usuarioId = null, usuarioEmail = null, endereco = null) => prisma.ocorrenciaHistorico.create({
  data: {
    ocorrenciaId,
    acao,
    descricao,
    usuarioId,
    usuarioEmail,
    endereco,
  },
});

export const listarHistorico = async (ocorrenciaId) => prisma.ocorrenciaHistorico.findMany({
  where: { ocorrenciaId },
  orderBy: { createdAt: 'desc' },
});

export const adicionarComentario = async (ocorrenciaId, dados) => prisma.ocorrenciaComentario.create({
  data: {
    ocorrenciaId,
    usuarioId: dados.usuarioId,
    conteudo: dados.conteudo,
  },
});

export const listarComentarios = async (ocorrenciaId) => prisma.ocorrenciaComentario.findMany({
  where: { ocorrenciaId },
  include: { usuario: true },
  orderBy: { criadoEm: 'desc' },
});
