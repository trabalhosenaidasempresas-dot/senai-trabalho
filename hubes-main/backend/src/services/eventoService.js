import * as eventoRepository from '../repositories/eventoRepository.js';
import { ApiError } from '../utils/errors.js';
import Holidays from 'date-holidays';

const hd = new Holidays('BR');

const parseDateField = (value) => {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const isHoliday = (date) => {
  const holiday = hd.isHoliday(date);
  return !!holiday;
};

const isUnavailableDate = (date) => {
  if (!date || Number.isNaN(date.getTime())) return false;
  return date.getDay() === 0 || isHoliday(date);
};

const isUnavailableInterval = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    if (isUnavailableDate(new Date(current))) return true;
    current.setDate(current.getDate() + 1);
  }

  return false;
};

export const criarEvento = async (dados) => {
  if (!dados.titulo || !dados.dataInicio || !dados.tipo) {
    throw ApiError.badRequest('Título, tipo e data de início são obrigatórios');
  }

  const dataInicio = parseDateField(dados.dataInicio);
  if (!dataInicio) {
    throw ApiError.badRequest('Data de início inválida');
  }

  const dataFim = parseDateField(dados.dataFim);
  const deviceTimestamp = parseDateField(dados.deviceTimestamp);

  if (isUnavailableInterval(dataInicio, dataFim || dataInicio)) {
    throw ApiError.badRequest('Esta data não está disponível para agendamento. As salas não podem ser reservadas aos domingos e feriados.');
  }

  // validar conflito no backend (controle de concorrência mínimo)
  if (dados.local && dataInicio && dataFim) {
    const conflict = await eventoRepository.existeConflito(dados.local, dataInicio, dataFim);
    if (conflict) throw ApiError.badRequest('Horário não disponível: já existe um evento agendado para este período');
  }

  return eventoRepository.criarEvento({
    ...dados,
    dataInicio,
    dataFim,
    deviceTimestamp: deviceTimestamp || undefined,
  });
};

export const disponibilidade = async ({ local, date, startTime, endTime }) => {
  if (!local || !date) throw ApiError.badRequest('Parâmetros insuficientes: local e date são obrigatórios');

  const day = new Date(date);
  if (Number.isNaN(day.getTime())) throw ApiError.badRequest('Data inválida');

  const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
  const dayEnd = new Date(day); dayEnd.setHours(23,59,59,999);

  const events = await eventoRepository.buscarEventosPorLocalEPeriodo(local, dayStart, dayEnd);

  // construir intervals ocupados
  const occupied = events.map(ev => ({ start: ev.dataInicio, end: ev.dataFim }));

  // retornar eventos e intervals; frontend calcula opções de horários
  return { events, occupied };
};

export const obterEvento = async (id) => {
  const evento = await eventoRepository.buscarEventoPorId(id);
  if (!evento) throw ApiError.notFound('Evento não encontrado');
  return evento;
};

export const listarEventos = async (pagina = 1, limite = 10, search = null, sortField = 'createdAt', sortOrder = 'desc') => {
  const skip = (pagina - 1) * limite;
  const eventos = await eventoRepository.listarEventos(skip, limite, search, sortField, sortOrder);
  const total = await eventoRepository.contarEventos(search);

  return {
    eventos,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    },
  };
};

export const atualizarEvento = async (id, dados) => {
  const evento = await eventoRepository.buscarEventoPorId(id);
  if (!evento) throw ApiError.notFound('Evento não encontrado');

  const dataInicio = parseDateField(dados.dataInicio);
  const dataFim = parseDateField(dados.dataFim);
  const deviceTimestamp = parseDateField(dados.deviceTimestamp);

  if (dataInicio && dataFim && isUnavailableInterval(dataInicio, dataFim)) {
    throw ApiError.badRequest('Esta data não está disponível para agendamento. As salas não podem ser reservadas aos domingos e feriados.');
  }

  return eventoRepository.atualizarEvento(id, {
    ...dados,
    dataInicio: dataInicio !== null ? dataInicio : dados.dataInicio,
    dataFim: dataFim !== null ? dataFim : dados.dataFim,
    deviceTimestamp: deviceTimestamp || undefined,
  });
};

export const deletarEvento = async (id) => {
  const evento = await eventoRepository.buscarEventoPorId(id);
  if (!evento) throw new Error('Evento não encontrado');
  return eventoRepository.deletarEvento(id);
};
