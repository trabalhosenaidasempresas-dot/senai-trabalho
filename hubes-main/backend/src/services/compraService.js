import * as compraRepository from '../repositories/compraRepository.js';
import { ApiError } from '../utils/errors.js';

const parseDateField = (value) => {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildItens = (itens = []) => {
  if (!Array.isArray(itens)) {
    throw ApiError.badRequest('Itens devem ser um array');
  }

  return itens.map((item) => {
    if (!item.descricao || item.quantidade == null || item.valorUnitario == null) {
      throw ApiError.badRequest('Cada item deve ter descrição, quantidade e valor unitário');
    }

    const quantidade = Number(item.quantidade);
    const valorUnitario = Number(item.valorUnitario);

    if (Number.isNaN(quantidade) || quantidade <= 0) {
      throw ApiError.badRequest('Quantidade do item deve ser maior que zero');
    }

    if (Number.isNaN(valorUnitario) || valorUnitario < 0) {
      throw ApiError.badRequest('Valor unitário do item deve ser maior ou igual a zero');
    }

    return {
      descricao: item.descricao,
      quantidade,
      valorUnitario,
      valorTotal: quantidade * valorUnitario,
      especificacoes: item.especificacoes || null,
    };
  });
};

const calcularValorTotal = (itens = []) => {
  if (itens.length) {
    return itens.reduce((total, item) => total + item.valorTotal, 0);
  }

  return 0;
};

const calcularQuantidadeTotal = (itens = []) => {
  if (!itens.length) return 0;
  return itens.reduce((total, item) => total + item.quantidade, 0);
};

const generateNumeroCompra = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const millis = String(now.getMilliseconds()).padStart(3, '0');
  const random = String(Math.floor(Math.random() * 9000) + 1000);
  return `COM-${year}${month}${day}${hours}${minutes}${seconds}${millis}-${random}`;
};

export const criarCompra = async (dados) => {
  if (!dados.fornecedor || !dados.fornecedorEmail) {
    throw ApiError.badRequest('Fornecedor e e-mail do fornecedor são obrigatórios');
  }

  const itens = dados.itens ? buildItens(dados.itens) : [];
  const quantidade = itens.length ? calcularQuantidadeTotal(itens) : (dados.quantidade != null ? Number(dados.quantidade) : 0);
  if (Number.isNaN(quantidade) || quantidade < 0) {
    throw ApiError.badRequest('Quantidade deve ser um número inteiro não negativo');
  }

  const dataEntrega = parseDateField(dados.dataEntrega);

  const deviceTimestamp = parseDateField(dados.deviceTimestamp);
  const compraData = {
    ...dados,
    numeroCompra: generateNumeroCompra(),
    status: dados.status || 'Em análise',
    quantidade: quantidade,
    itens,
    valor: calcularValorTotal(itens),
    dataEntrega,
    deviceTimestamp: deviceTimestamp || undefined,
  };

  delete compraData.solicitanteEmail;
  delete compraData.userIp;
  delete compraData.cnpj;
  delete compraData.centoCusto;
  delete compraData.createdAt;

  try {
    const compra = await compraRepository.criarCompra(compraData);

    await compraRepository.adicionarHistorico(
      compra.id,
      'Criado',
      `Compra ${compra.numeroCompra} criada`,
      dados.solicitanteId,
      dados.solicitanteEmail,
      dados.userIp,
    );

    return compra;
  } catch (err) {
    console.error('Erro em criarCompra:', err);
    if (err && err.code === 'P2002' && err.meta && err.meta.target) {
      const field = Array.isArray(err.meta.target) ? err.meta.target[0] : err.meta.target;
      const friendly = field === 'numeroCompra' ? 'Número da compra' : field;
      throw ApiError.badRequest(`${friendly} já cadastrado`);
    }
    throw ApiError.internal();
  }
};

export const criarCompraDeEstoqueSeNecessario = async (produto, usuario = null) => {
  if (produto.quantidade > produto.estoqueMinimo) {
    return null;
  }

  const quantidadeSugestao = produto.estoqueMaximo != null
    ? Math.max(produto.estoqueMaximo - produto.quantidade, 0)
    : Math.max(produto.estoqueMinimo - produto.quantidade, 0);

  if (quantidadeSugestao <= 0) {
    return null;
  }

  const existente = await compraRepository.buscarCompraAutomaticaPorProduto(produto.id);
  if (existente) {
    return null;
  }

  const fornecedor = produto.fornecedor || 'Fornecedor automático';
  const fornecedorEmail = usuario?.email || 'estoque@automatico.local';
  const observacao = `AUTO_ESTOQUE:${produto.id} - Reposição automática do produto ${produto.nome} (${produto.codigo}).`;
  const itens = [{
    descricao: `${produto.nome} (${produto.codigo})`,
    quantidade: quantidadeSugestao,
    valorUnitario: produto.preco ?? 0,
    valorTotal: (produto.preco ?? 0) * quantidadeSugestao,
    especificacoes: 'Compra automática de reposição de estoque',
  }];

  return criarCompra({
    fornecedor,
    fornecedorEmail,
    quantidade: quantidadeSugestao,
    status: 'Aguardando Compra',
    observacao,
    itens,
    solicitanteId: usuario?.id,
    solicitanteEmail: fornecedorEmail,
    userIp: usuario?.ip || null,
    deviceTimestamp: new Date(),
  });
};

export const obterCompra = async (id) => {
  const compra = await compraRepository.buscarCompraPorId(id);
  if (!compra) throw ApiError.notFound('Compra não encontrada');
  return compra;
};

export const listarCompras = async (
  pagina = 1,
  limite = 10,
  search = null,
  status = null,
  fornecedor = null,
  sortField = 'createdAt',
  sortOrder = 'desc',
) => {
  const skip = (pagina - 1) * limite;
  const compras = await compraRepository.listarCompras(skip, limite, search, status, fornecedor, sortField, sortOrder);
  const total = await compraRepository.contarCompras(search, status, fornecedor);

  return {
    compras,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    },
  };
};

export const atualizarCompra = async (id, dados, usuarioId = null, usuarioEmail = null, userIp = null) => {
  const compra = await compraRepository.buscarCompraPorId(id);
  if (!compra) throw ApiError.notFound('Compra não encontrada');

  const itens = dados.itens ? buildItens(dados.itens) : undefined;
  const dataEntrega = parseDateField(dados.dataEntrega) !== null ? parseDateField(dados.dataEntrega) : dados.dataEntrega;

  const deviceTimestamp = parseDateField(dados.deviceTimestamp);
  const updateData = {
    ...dados,
    itens,
    dataEntrega,
    deviceTimestamp: deviceTimestamp || undefined,
  };

  delete updateData.valor;
  delete updateData.quantidade;
  if (itens) {
    updateData.valor = calcularValorTotal(itens);
    updateData.quantidade = calcularQuantidadeTotal(itens);
  }
  delete updateData.userIp;
  delete updateData.centoCusto;
  delete updateData.createdAt;

  const atualizado = await compraRepository.atualizarCompra(id, updateData);

  await compraRepository.adicionarHistorico(id, 'Modificado', 'Compra atualizada', usuarioId, usuarioEmail, userIp);
  return atualizado;
};

export const deletarCompra = async (id, usuarioId = null, usuarioEmail = null, userIp = null) => {
  const compra = await compraRepository.buscarCompraPorId(id);
  if (!compra) throw ApiError.notFound('Compra não encontrada');

  await compraRepository.softDeleteCompra(id);
  await compraRepository.adicionarHistorico(id, 'Deletado', 'Compra marcada como deletada', usuarioId, usuarioEmail, userIp);
  return true;
};

export const aprovarCompra = async (id, dados, usuarioId = null, usuarioEmail = null, userIp = null) => {
  const compra = await compraRepository.buscarCompraPorId(id);
  if (!compra) throw ApiError.notFound('Compra não encontrada');

  if (dados.aprovado == null) {
    throw ApiError.badRequest('Campo aprovado é obrigatório');
  }

  const aprovado = Boolean(dados.aprovado);
  const status = aprovado ? 'Compra' : 'Cancelada';

  if (!aprovado && !dados.motivoRejeicao) {
    throw ApiError.badRequest('Motivo de rejeição é obrigatório quando a compra não for aprovada');
  }

  const atualizado = await compraRepository.atualizarCompra(id, {
    status,
    aprovadoPorId: usuarioId,
    aprovadoPor: usuarioEmail,
    dataAprovacao: new Date(),
    motivoRejeicao: aprovado ? null : dados.motivoRejeicao,
  });

  await compraRepository.adicionarHistorico(
    id,
    aprovado ? 'Aprovado' : 'Rejeitado',
    aprovado ? 'Compra aprovada' : 'Compra rejeitada',
    usuarioId,
    usuarioEmail,
    userIp,
  );

  return atualizado;
};

export const listarHistorico = async (id) => {
  return compraRepository.listarHistorico(id);
};

export const adicionarDocumentoFiscal = async (compraId, dados) => {
  const compra = await compraRepository.buscarCompraPorId(compraId);
  if (!compra) throw ApiError.notFound('Compra não encontrada');

  const documentoFiscal = await compraRepository.adicionarDocumentoFiscal(compraId, dados);

  await compraRepository.adicionarHistorico(
    compraId,
    'Documento Fiscal Anexado',
    `Documento fiscal ${dados.nomeArquivo} adicionado`,
    dados.criadoPorId,
    dados.criadoPor,
    dados.userIp,
  );

  return documentoFiscal;
};

export const listarDocumentosFiscais = async (compraId) => {
  const compra = await compraRepository.buscarCompraPorId(compraId);
  if (!compra) throw ApiError.notFound('Compra não encontrada');
  return compraRepository.listarDocumentosFiscais(compraId);
};

export const obterDocumentoFiscal = async (id) => {
  const documento = await compraRepository.buscarDocumentoFiscalPorId(id);
  if (!documento) throw ApiError.notFound('Documento fiscal não encontrado');
  return documento;
};

export const deletarDocumentoFiscal = async (documentoId, compraId, usuarioId = null, usuarioEmail = null, userIp = null) => {
  const compra = await compraRepository.buscarCompraPorId(compraId);
  if (!compra) throw ApiError.notFound('Compra não encontrada');

  const documento = await compraRepository.buscarDocumentoFiscalPorId(documentoId);
  if (!documento || documento.compraId !== compraId) throw ApiError.notFound('Documento fiscal não encontrado');

  await compraRepository.deletarDocumentoFiscal(documentoId);
  await compraRepository.adicionarHistorico(
    compraId,
    'Documento Fiscal Removido',
    `Documento fiscal ${documento.nomeArquivo} removido`,
    usuarioId,
    usuarioEmail,
    userIp,
  );

  return true;
};

// Fluxo de Aprovação
export const obterFluxoAprovacao = async (compraId) => {
  const compra = await compraRepository.buscarCompraPorId(compraId);
  if (!compra) throw ApiError.notFound('Compra não encontrada');
  return compraRepository.obterFluxoAprovacao(compraId);
};

export const aprovarNoFluxo = async (compraId, nivelAprovacao, dados, usuarioId, usuarioEmail, userIp) => {
  const compra = await compraRepository.buscarCompraPorId(compraId);
  if (!compra) throw ApiError.notFound('Compra não encontrada');

  const aprovacao = await compraRepository.atualizarStatusAprovacao(
    compraId,
    nivelAprovacao,
    'Aprovado',
    usuarioId,
    dados.motivo || null,
    new Date()
  );

  await compraRepository.adicionarHistorico(
    compraId,
    'Aprovação de Nível',
    `Compra aprovada no nível ${nivelAprovacao}`,
    usuarioId,
    usuarioEmail,
    userIp,
  );

  return aprovacao;
};

export const rejeitarNoFluxo = async (compraId, nivelAprovacao, dados, usuarioId, usuarioEmail, userIp) => {
  const compra = await compraRepository.buscarCompraPorId(compraId);
  if (!compra) throw ApiError.notFound('Compra não encontrada');

  if (!dados.motivo) {
    throw ApiError.badRequest('Motivo da rejeição é obrigatório');
  }

  const aprovacao = await compraRepository.atualizarStatusAprovacao(
    compraId,
    nivelAprovacao,
    'Rejeitado',
    usuarioId,
    dados.motivo,
    new Date()
  );

  // Atualizar status da compra para Cancelada
  await compraRepository.atualizarCompra(compraId, {
    status: 'Cancelada',
    motivoRejeicao: dados.motivo,
  });

  await compraRepository.adicionarHistorico(
    compraId,
    'Rejeição',
    `Compra rejeitada no nível ${nivelAprovacao}: ${dados.motivo}`,
    usuarioId,
    usuarioEmail,
    userIp,
  );

  return aprovacao;
};

// Fornecedores
export const listarFornecedores = async (pagina = 1, limite = 10, search = null, status = 'Ativo') => {
  const skip = (pagina - 1) * limite;
  const fornecedores = await compraRepository.listarFornecedores(skip, limite, search, status);
  const total = await compraRepository.contarFornecedores(search, status);

  return {
    fornecedores,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    },
  };
};

export const obterFornecedor = async (id) => {
  const fornecedor = await compraRepository.buscarFornecedorPorId(id);
  if (!fornecedor) throw ApiError.notFound('Fornecedor não encontrado');
  return fornecedor;
};

export const criarFornecedor = async (dados) => {
  if (!dados.nome || !dados.cnpj || !dados.email) {
    throw ApiError.badRequest('Nome, CNPJ e email são obrigatórios');
  }

  // Validar CNPJ único
  const fornecedorExistente = await compraRepository.buscarFornecedorPorCnpj(dados.cnpj);
  if (fornecedorExistente) {
    throw ApiError.badRequest('Fornecedor com este CNPJ já existe');
  }

  return compraRepository.criarFornecedor(dados);
};

export const atualizarFornecedor = async (id, dados) => {
  const fornecedor = await compraRepository.buscarFornecedorPorId(id);
  if (!fornecedor) throw ApiError.notFound('Fornecedor não encontrado');

  if (dados.cnpj && dados.cnpj !== fornecedor.cnpj) {
    const fornecedorExistente = await compraRepository.buscarFornecedorPorCnpj(dados.cnpj);
    if (fornecedorExistente) {
      throw ApiError.badRequest('Fornecedor com este CNPJ já existe');
    }
  }

  return compraRepository.atualizarFornecedor(id, dados);
};

export const deletarFornecedor = async (id) => {
  const fornecedor = await compraRepository.buscarFornecedorPorId(id);
  if (!fornecedor) throw ApiError.notFound('Fornecedor não encontrado');

  return compraRepository.atualizarFornecedor(id, { status: 'Removido', ativo: false });
};

// Centros de Custo
export const listarCentrosCusto = async (pagina = 1, limite = 10, search = null) => {
  const skip = (pagina - 1) * limite;
  const centros = await compraRepository.listarCentrosCusto(skip, limite, search);
  const total = await compraRepository.contarCentrosCusto(search);

  return {
    centros,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    },
  };
};

export const obterCentroCusto = async (id) => {
  const centro = await compraRepository.buscarCentroCustoPorId(id);
  if (!centro) throw ApiError.notFound('Centro de custo não encontrado');
  return centro;
};

// Estatísticas e Relatórios
export const obterEstatisticasCompras = async () => {
  return compraRepository.obterEstatisticasCompras();
};

export const obterEstatisticasPorStatus = async () => {
  return compraRepository.obterEstatisticasPorStatus();
};

export const obterEstatisticasPorCentroCusto = async () => {
  return compraRepository.obterEstatisticasPorCentroCusto();
};

export const gerarRelatorioCompras = async (filtros = {}) => {
  const {
    dataInicio,
    dataFim,
    status,
    fornecedor,
    formatoData = 'json',
  } = filtros;

  const compras = await compraRepository.listarComprasRelatorio(
    dataInicio,
    dataFim,
    status,
    fornecedor
  );

  if (formatoData === 'csv') {
    return converterParaCSV(compras);
  }

  return compras;
};

const converterParaCSV = (compras) => {
  const headers = ['Número', 'Fornecedor', 'Valor total', 'Status', 'Data'];
  const rows = compras.map((c) => [
    c.numeroCompra,
    c.fornecedor,
    c.valor.toFixed(2),
    c.status,
    new Date(c.createdAt).toLocaleDateString('pt-BR'),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
};
