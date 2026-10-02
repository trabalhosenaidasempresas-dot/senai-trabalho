import * as ocorrenciaRepository from '../repositories/ocorrenciaRepository.js';
import { ApiError } from '../utils/errors.js';

const buildNumeroOcorrencia = async () => {
  const ultimo = await ocorrenciaRepository.buscarUltimaOcorrencia();
  const prefix = 'OC-';
  const nextNumber = ultimo ? parseInt(ultimo.numeroOcorrencia.replace(/^OC-/, ''), 10) + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(6, '0')}`;
};

const parseDateField = (value) => {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const criarOcorrencia = async (dados) => {
  if (!dados.descricao || !dados.local || !dados.setor || !dados.prioridade) {
    throw ApiError.badRequest('Descrição, local, setor e prioridade são obrigatórios');
  }

  if (!dados.responsavelId) {
    throw ApiError.badRequest('Responsável é obrigatório');
  }

  const data = parseDateField(dados.data) || new Date();
  const dataPrazo = parseDateField(dados.dataPrazo);
  const dataResolucao = parseDateField(dados.dataResolucao);

  const numeroOcorrencia = await buildNumeroOcorrencia();
  const deviceTimestamp = parseDateField(dados.deviceTimestamp);
  const titulo = dados.titulo || (dados.descricao ? String(dados.descricao).slice(0, 100) : `Ocorrência ${numeroOcorrencia}`);
  const ocorrenciaData = {
    ...dados,
    titulo,
    numeroOcorrencia,
    data,
    dataPrazo,
    dataResolucao,
    fotos: dados.fotos || [],
    anexos: dados.anexos || [],
    deviceTimestamp: deviceTimestamp || undefined,
  };

  delete ocorrenciaData.responsavelEmail;
  delete ocorrenciaData.userIp;

  const ocorrencia = await ocorrenciaRepository.criarOcorrencia(ocorrenciaData);

  await ocorrenciaRepository.adicionarHistorico(
    ocorrencia.id,
    'Criado',
    `Ocorrência ${ocorrencia.numeroOcorrencia} criada`,
    dados.responsavelId,
    dados.responsavelEmail,
    dados.userIp,
  );
  return ocorrencia;
};

export const obterOcorrencia = async (id) => {
  const ocorrencia = await ocorrenciaRepository.buscarOcorrenciaPorId(id);
  if (!ocorrencia) throw ApiError.notFound('Ocorrência não encontrada');
  return ocorrencia;
};

export const listarOcorrencias = async (
  pagina = 1,
  limite = 10,
  search = null,
  status = null,
  prioridade = null,
  setor = null,
  sortField = 'createdAt',
  sortOrder = 'desc',
) => {
  const skip = (pagina - 1) * limite;
  const ocorrencias = await ocorrenciaRepository.listarOcorrencias(skip, limite, search, status, prioridade, setor, sortField, sortOrder);
  const total = await ocorrenciaRepository.contarOcorrencias(search, status, prioridade, setor);

  return {
    ocorrencias,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    },
  };
};

export const atualizarOcorrencia = async (id, dados, usuarioId = null, usuarioEmail = null, userIp = null) => {
  const ocorrencia = await ocorrenciaRepository.buscarOcorrenciaPorId(id);
  if (!ocorrencia) throw ApiError.notFound('Ocorrência não encontrada');

  const data = parseDateField(dados.data) !== null ? parseDateField(dados.data) : dados.data;
  const dataPrazo = parseDateField(dados.dataPrazo) !== null ? parseDateField(dados.dataPrazo) : dados.dataPrazo;
  const dataResolucao = parseDateField(dados.dataResolucao) !== null ? parseDateField(dados.dataResolucao) : dados.dataResolucao;

  const deviceTimestamp = parseDateField(dados.deviceTimestamp);
  const atualizado = await ocorrenciaRepository.atualizarOcorrencia(id, {
    ...dados,
    data,
    dataPrazo,
    dataResolucao,
    fotos: dados.fotos !== undefined ? dados.fotos : ocorrencia.fotos,
    anexos: dados.anexos !== undefined ? dados.anexos : ocorrencia.anexos,
    deviceTimestamp: deviceTimestamp || undefined,
  });

  await ocorrenciaRepository.adicionarHistorico(id, 'Modificado', 'Ocorrência atualizada', usuarioId, usuarioEmail, userIp);
  return atualizado;
};

export const deletarOcorrencia = async (id, usuarioId = null, usuarioEmail = null, userIp = null) => {
  const ocorrencia = await ocorrenciaRepository.buscarOcorrenciaPorId(id);
  if (!ocorrencia) throw ApiError.notFound('Ocorrência não encontrada');

  await ocorrenciaRepository.softDeleteOcorrencia(id);
  await ocorrenciaRepository.adicionarHistorico(id, 'Deletado', 'Ocorrência marcada como deletada', usuarioId, usuarioEmail, userIp);
  return true;
};

export const adicionarComentario = async (ocorrenciaId, dados) => {
  if (!dados.usuarioId || !dados.conteudo) {
    throw ApiError.badRequest('Usuário e conteúdo do comentário são obrigatórios');
  }

  const ocorrencia = await ocorrenciaRepository.buscarOcorrenciaPorId(ocorrenciaId);
  if (!ocorrencia) throw ApiError.notFound('Ocorrência não encontrada');

  const comentario = await ocorrenciaRepository.adicionarComentario(ocorrenciaId, dados);
  await ocorrenciaRepository.adicionarHistorico(ocorrenciaId, 'Comentado', 'Comentário adicionado à ocorrência', dados.usuarioId, dados.usuarioEmail, dados.userIp);
  return comentario;
};

export const listarComentarios = async (ocorrenciaId) => {
  return ocorrenciaRepository.listarComentarios(ocorrenciaId);
};

export const listarHistorico = async (ocorrenciaId) => {
  return ocorrenciaRepository.listarHistorico(ocorrenciaId);
};
