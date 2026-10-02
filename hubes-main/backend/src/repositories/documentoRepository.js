import prisma from '../config/database.js';

const normalizeText = (value) => {
  if (value == null) return '';
  return String(value)
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
};

const matchesSearch = (documento, search) => {
  if (!search) return true;

  const normalizedSearch = normalizeText(search);
  const tokens = normalizedSearch.split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;

  const searchableText = [
    documento.titulo,
    documento.tipo,
    documento.categoria,
    documento.numeroDocumento,
    documento.descricao,
    documento.fornecedor,
    documento.arquivo,
    documento.responsavel?.nome,
  ]
    .map(normalizeText)
    .join(' ');

  return tokens.every((token) => searchableText.includes(token));
};

const buildDocumentoWhere = (search, status, tipo, categoria, dateFrom, dateTo) => {
  const trimmedSearch = typeof search === 'string' ? search.trim() : search;
  const where = {
    status: status ? status : { not: 'Deletado' },
  };

  if (trimmedSearch) {
    where.OR = [
      { titulo: { contains: trimmedSearch, mode: 'insensitive' } },
      { tipo: { contains: trimmedSearch, mode: 'insensitive' } },
      { categoria: { contains: trimmedSearch, mode: 'insensitive' } },
      { numeroDocumento: { contains: trimmedSearch, mode: 'insensitive' } },
      { descricao: { contains: trimmedSearch, mode: 'insensitive' } },
      { fornecedor: { contains: trimmedSearch, mode: 'insensitive' } },
      { arquivo: { contains: trimmedSearch, mode: 'insensitive' } },
      { responsavel: { nome: { contains: trimmedSearch, mode: 'insensitive' } } },
    ];
  }

  if (tipo) {
    where.tipo = tipo;
  }

  if (categoria) {
    where.categoria = categoria;
  }

  if (dateFrom || dateTo) {
    where.AND = where.AND || [];
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (!Number.isNaN(from.getTime())) where.AND.push({ data: { gte: from } });
    }
    if (dateTo) {
      let to = new Date(dateTo);
      // if dateTo provided as YYYY-MM-DD, interpret as end of day
      if (typeof dateTo === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
        to.setHours(23, 59, 59, 999);
      }
      if (!Number.isNaN(to.getTime())) where.AND.push({ data: { lte: to } });
    }
  }

  return where;
};

export const criarDocumento = async (dados) => {
  return prisma.documento.create({
    data: {
      titulo: dados.titulo,
      tipo: dados.tipo || 'Diversos',
      categoria: dados.categoria || 'Geral',
      descricao: dados.descricao,
      responsavelId: dados.responsavelId,
      data: dados.data ?? new Date(),
      arquivo: dados.arquivo,
      tamanhoArquivo: dados.tamanhoArquivo || null,
      dataVencimento: dados.dataVencimento || null,
      fornecedor: dados.fornecedor || null,
      fotos: dados.fotos || [],
      numeroDocumento: dados.numeroDocumento || null,
      status: dados.status || 'Ativo',
      nivelAcesso: dados.nivelAcesso || 'Público',
      assinado: dados.assinado || false,
      deviceTimestamp: dados.deviceTimestamp || undefined,
    },
    include: { responsavel: true },
  });
};

export const buscarPorId = async (id) => {
  return prisma.documento.findFirst({
    where: { id, status: { not: 'Deletado' } },
    include: {
      versoes: { orderBy: { createdAt: 'desc' } },
      historico: { orderBy: { createdAt: 'desc' } },
      responsavel: true,
    },
  });
};

export const buscarPorNumeroDocumento = async (numeroDocumento) => {
  return prisma.documento.findUnique({
    where: { numeroDocumento },
  });
};

export const listar = async (
  skip = 0,
  take = 10,
  search = null,
  status = null,
  tipo = null,
  categoria = null,
  sortField = 'createdAt',
  sortOrder = 'desc',
  dateFrom = null,
  dateTo = null,
) => {
  const where = buildDocumentoWhere(search, status, tipo, categoria, dateFrom, dateTo);

  const allowedSortFields = ['titulo', 'tipo', 'categoria', 'status', 'data', 'createdAt', 'updatedAt'];
  const orderDirection = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  const orderBy = allowedSortFields.includes(sortField) ? { [sortField]: orderDirection } : { createdAt: 'desc' };

  return prisma.documento.findMany({
    where,
    skip,
    take,
    include: { responsavel: true },
    orderBy,
  });
};

export const contar = async (search = null, status = null, tipo = null, categoria = null, dateFrom = null, dateTo = null) => {
  const where = buildDocumentoWhere(search, status, tipo, categoria, dateFrom, dateTo);
  return prisma.documento.count({ where });
};

export const atualizar = async (id, dados) => {
  return prisma.documento.update({
    where: { id },
    data: {
      ...dados,
      fotos: dados.fotos ? { set: dados.fotos } : undefined,
    },
    include: { responsavel: true },
  });
};

export const deletar = async (id) => {
  return prisma.documento.update({
    where: { id },
    data: { status: 'Deletado' },
  });
};

export const adicionarVersao = async (documentoId, versao, arquivo, mudancas = null) => {
  return prisma.documentoVersao.create({
    data: {
      documentoId,
      versao,
      arquivo,
      mudancas,
    },
  });
};

export const listarVersoes = async (documentoId) => {
  return prisma.documentoVersao.findMany({ where: { documentoId }, orderBy: { createdAt: 'desc' } });
};

export const adicionarHistorico = async (documentoId, acao, descricao, usuarioEmail = null, endereco = null) => {
  return prisma.documentoHistorico.create({
    data: {
      documentoId,
      acao,
      descricao,
      usuarioEmail,
      endereco,
    },
  });
};

export const listarHistorico = async (documentoId) => {
  return prisma.documentoHistorico.findMany({ where: { documentoId }, orderBy: { createdAt: 'desc' } });
};

export default {
  criarDocumento,
  buscarPorId,
  listar,
  contar,
  atualizar,
  deletar,
  adicionarVersao,
  listarVersoes,
  adicionarHistorico,
  listarHistorico,
};
