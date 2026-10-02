import * as servicoRepository from '../repositories/servicoRepository.js';
import * as documentoRepository from '../repositories/documentoRepository.js';
import { ApiError } from '../utils/errors.js';

const parseDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const generateNumeroServico = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 9000) + 1000);
  return `SERV-${year}${month}${day}-${random}`;
};

const getSituacaoFromDate = (date) => {
  if (!date) return null;
  const now = new Date();
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Vencido';
  if (diffDays <= 30) return 'Vencendo em até 30 dias';
  return 'Vigente';
};

const computeSituacao = (servico) => {
  if (!servico) return null;
  const status = String(servico.status || '').toLowerCase();
  if (status.includes('concluído') || status.includes('concluido')) return 'Concluído';
  if (status.includes('pendente')) return 'Pendente';

  const proxima = servico.proximaManutencao ? parseDate(servico.proximaManutencao) : null;
  if (proxima) return getSituacaoFromDate(proxima);

  const vencimento = servico.dataVencimento ? parseDate(servico.dataVencimento) : null;
  if (vencimento) return getSituacaoFromDate(vencimento);

  return 'Vigente';
};

const calculateNextMaintenance = (providedNext, ultimaManutencao, periodicidade) => {
  const nextDate = parseDate(providedNext);
  if (nextDate) return nextDate;
  if (!ultimaManutencao || !periodicidade) return null;

  const lastDate = parseDate(ultimaManutencao);
  if (!lastDate) return null;

  const normalized = String(periodicidade).toLowerCase();
  const result = new Date(lastDate);

  if (normalized.includes('mensal')) {
    result.setMonth(result.getMonth() + 1);
  } else if (normalized.includes('quinzenal')) {
    result.setDate(result.getDate() + 15);
  } else if (normalized.includes('trimestral') || normalized.includes('trimestre')) {
    result.setMonth(result.getMonth() + 3);
  } else if (normalized.includes('semestral')) {
    result.setMonth(result.getMonth() + 6);
  } else if (normalized.includes('anual')) {
    result.setFullYear(result.getFullYear() + 1);
  } else {
    return null;
  }

  return result;
};

const attachSituacao = (servico) => ({
  ...servico,
  situacao: computeSituacao(servico),
});

export const listarServicos = async (
  pagina = 1,
  limite = 10,
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
  const skip = (pagina - 1) * limite;
  const servicos = await servicoRepository.listarServicos(
    skip,
    limite,
    search,
    status,
    categoria,
    fornecedor,
    periodicidade,
    equipamento,
    tipoServico,
    situacao,
    periodoInicio,
    periodoFim,
    sortField,
    sortOrder,
  );
  const total = await servicoRepository.contarServicos(search, status, categoria, fornecedor, periodicidade, equipamento, tipoServico, situacao, periodoInicio, periodoFim);

  return {
    servicos: servicos.map(attachSituacao),
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    },
  };
};

export const criarServico = async (dados) => {
  if (dados.documentoId) {
    const documento = await documentoRepository.buscarPorId(dados.documentoId);
    if (!documento) {
      throw ApiError.badRequest('Documento informado não foi encontrado');
    }
  }

  const dataInicio = parseDate(dados.dataInicio);
  const dataVencimento = parseDate(dados.dataVencimento);
  const ultimaManutencao = dados.ultimaManutencao ? dados.ultimaManutencao : null;
  const proximaManutencao = calculateNextMaintenance(dados.proximaManutencao, dados.ultimaManutencao, dados.periodicidade);

  const servicoData = {
    ...dados,
    numeroServico: generateNumeroServico(),
    dataInicio,
    dataVencimento,
    ultimaManutencao,
    proximaManutencao,
    status: dados.status || 'Vigente',
  };

  try {
    const servico = await servicoRepository.criarServico(servicoData);
    await servicoRepository.adicionarHistorico(
      servico.id,
      'Criado',
      `Serviço ${servico.numeroServico} criado`,
      dados.responsavelId,
      dados.responsavelEmail,
      dados.userIp,
    );
    return attachSituacao(servico);
  } catch (err) {
    console.error('servicoService.criarServico error:', err && err.stack ? err.stack : err);
    if (err && err.code === 'P2002') {
      throw ApiError.badRequest('Número de serviço já cadastrado');
    }
    throw ApiError.internal();
  }
};

export const obterServico = async (id) => {
  const servico = await servicoRepository.buscarServicoPorId(id);
  if (!servico) throw ApiError.notFound('Serviço não encontrado');
  return attachSituacao(servico);
};

export const atualizarServico = async (id, dados, usuarioId = null, usuarioEmail = null, userIp = null) => {
  const servico = await servicoRepository.buscarServicoPorId(id);
  if (!servico) throw ApiError.notFound('Serviço não encontrado');

  const updateData = {
    ...dados,
    dataInicio: parseDate(dados.dataInicio) ?? dados.dataInicio,
    dataVencimento: parseDate(dados.dataVencimento) ?? dados.dataVencimento,
    ultimaManutencao: dados.ultimaManutencao ? dados.ultimaManutencao : null,
    proximaManutencao: calculateNextMaintenance(dados.proximaManutencao, dados.ultimaManutencao, dados.periodicidade),
  };

  const atualizado = await servicoRepository.atualizarServico(id, updateData);
  await servicoRepository.adicionarHistorico(id, 'Atualizado', 'Serviço atualizado', usuarioId, usuarioEmail, userIp);
  return attachSituacao(atualizado);
};

export const deletarServico = async (id, usuarioId = null, usuarioEmail = null, userIp = null) => {
  const servico = await servicoRepository.buscarServicoPorId(id);
  if (!servico) throw ApiError.notFound('Serviço não encontrado');

  await servicoRepository.softDeleteServico(id);
  await servicoRepository.adicionarHistorico(id, 'Deletado', 'Serviço removido', usuarioId, usuarioEmail, userIp);
  return true;
};
