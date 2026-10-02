import prisma from '../config/database.js';

export const listarServicos = async (
  skip = 0,
  take = 10,
  search = null,
  status = null,
  categoria = null,
  fornecedor = null,
  periodicidade = null,
  equipamento = null,
  tipoServico = null,
  situacao = null,
  periodoInicio = null,
  periodoFim = null,
  sortField = 'createdAt',
  sortOrder = 'desc',
) => {
  const where = {
    deletadoEm: null,
  };

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { categoria: { contains: search, mode: 'insensitive' } },
      { fornecedor: { contains: search, mode: 'insensitive' } },
      { status: { contains: search, mode: 'insensitive' } },
      { periodicidade: { contains: search, mode: 'insensitive' } },
      { equipamento: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) where.status = status;
  if (categoria) where.categoria = categoria;
  if (fornecedor) {
    where.fornecedor = { contains: fornecedor, mode: 'insensitive' };
  }
  if (periodicidade) where.periodicidade = periodicidade;
  if (equipamento) {
    where.equipamento = { contains: equipamento, mode: 'insensitive' };
  }
  if (tipoServico) where.tipoServico = tipoServico;

  if (situacao) {
    const situacaoLower = situacao.toLowerCase();
    const now = new Date();
    const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (situacaoLower.includes('conclu')) {
      where.status = { contains: 'conclu', mode: 'insensitive' };
    } else if (situacaoLower.includes('pendente')) {
      where.status = { contains: 'pendente', mode: 'insensitive' };
    } else if (situacaoLower.includes('vencido')) {
      where.proximaManutencao = { lt: now };
    } else if (situacaoLower.includes('vencendo')) {
      where.proximaManutencao = { gte: now, lte: next30 };
    } else if (situacaoLower.includes('vigente')) {
      where.AND = [
        {
          OR: [
            { proximaManutencao: { gt: next30 } },
            { proximaManutencao: null },
          ],
        },
      ];
    }
  }

  if (periodoInicio || periodoFim) {
    const periodoFilter = {
      ...(periodoInicio ? { gte: new Date(periodoInicio) } : {}),
      ...(periodoFim ? { lte: new Date(periodoFim) } : {}),
    };

    if (where.proximaManutencao && typeof where.proximaManutencao === 'object' && !Array.isArray(where.proximaManutencao)) {
      where.proximaManutencao = { ...where.proximaManutencao, ...periodoFilter };
    } else if (where.AND) {
      where.AND.push({ proximaManutencao: periodoFilter });
    } else {
      where.proximaManutencao = periodoFilter;
    }
  }

  const allowedSortFields = ['tipoServico', 'nome', 'equipamento', 'dataInicio', 'dataVencimento', 'proximaManutencao', 'status', 'categoria', 'fornecedor', 'createdAt'];
  const orderDirection = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  const orderBy = allowedSortFields.includes(sortField) ? { [sortField]: orderDirection } : { createdAt: 'desc' };

  return prisma.servico.findMany({
    where,
    skip,
    take,
    orderBy,
  });
};

export const contarServicos = async (
  search = null,
  status = null,
  categoria = null,
  fornecedor = null,
  periodicidade = null,
  equipamento = null,
  tipoServico = null,
  situacao = null,
  periodoInicio = null,
  periodoFim = null,
) => {
  const where = { deletadoEm: null };

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { categoria: { contains: search, mode: 'insensitive' } },
      { fornecedor: { contains: search, mode: 'insensitive' } },
      { status: { contains: search, mode: 'insensitive' } },
      { periodicidade: { contains: search, mode: 'insensitive' } },
      { equipamento: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) where.status = status;
  if (categoria) where.categoria = categoria;
  if (fornecedor) {
    where.fornecedor = { contains: fornecedor, mode: 'insensitive' };
  }
  if (periodicidade) where.periodicidade = periodicidade;
  if (equipamento) {
    where.equipamento = { contains: equipamento, mode: 'insensitive' };
  }
  if (tipoServico) where.tipoServico = tipoServico;

  if (situacao) {
    const situacaoLower = situacao.toLowerCase();
    const now = new Date();
    const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (situacaoLower.includes('conclu')) {
      where.status = { contains: 'conclu', mode: 'insensitive' };
    } else if (situacaoLower.includes('pendente')) {
      where.status = { contains: 'pendente', mode: 'insensitive' };
    } else if (situacaoLower.includes('vencido')) {
      where.proximaManutencao = { lt: now };
    } else if (situacaoLower.includes('vencendo')) {
      where.proximaManutencao = { gte: now, lte: next30 };
    } else if (situacaoLower.includes('vigente')) {
      where.AND = [
        {
          OR: [
            { proximaManutencao: { gt: next30 } },
            { proximaManutencao: null },
          ],
        },
      ];
    }
  }

  if (periodoInicio || periodoFim) {
    const periodoFilter = {
      ...(periodoInicio ? { gte: new Date(periodoInicio) } : {}),
      ...(periodoFim ? { lte: new Date(periodoFim) } : {}),
    };

    if (where.proximaManutencao && typeof where.proximaManutencao === 'object' && !Array.isArray(where.proximaManutencao)) {
      where.proximaManutencao = { ...where.proximaManutencao, ...periodoFilter };
    } else if (where.AND) {
      where.AND.push({ proximaManutencao: periodoFilter });
    } else {
      where.proximaManutencao = periodoFilter;
    }
  }

  return prisma.servico.count({ where });
};

export const criarServico = async (dados) => prisma.servico.create({ data: dados });

export const buscarServicoPorId = async (id) => prisma.servico.findFirst({
  where: { id, deletadoEm: null },
  include: {
    historico: {
      orderBy: { createdAt: 'desc' },
    },
    documento: true,
  },
});

export const atualizarServico = async (id, dados) => prisma.servico.update({ where: { id }, data: dados });

export const softDeleteServico = async (id) => prisma.servico.update({ where: { id }, data: { deletadoEm: new Date() } });

export const adicionarHistorico = async (servicoId, acao, descricao, usuarioId = null, usuarioEmail = null, endereco = null) => prisma.servicoHistorico.create({
  data: {
    servicoId,
    acao,
    descricao,
    usuarioId,
    usuarioEmail,
    endereco,
  },
});
