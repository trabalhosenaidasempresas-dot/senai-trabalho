import * as eventoService from '../services/eventoService.js';

export const listar = async (req, res, next) => {
  try {
    const { pagina = 1, limite = 10, search, sortField, sortOrder } = req.query;
    const resultado = await eventoService.listarEventos(
      parseInt(pagina),
      parseInt(limite),
      search,
      sortField,
      sortOrder,
    );
    res.json({ success: true, ...resultado });
  } catch (error) {
    next(error);
  }
};

export const disponibilidade = async (req, res, next) => {
  try {
    const { local, date, start, end } = req.query;
    const resultado = await eventoService.disponibilidade({ local, date, startTime: start, endTime: end });
    res.json({ success: true, ...resultado });
  } catch (error) {
    next(error);
  }
};

export const criar = async (req, res, next) => {
  try {
    const evento = await eventoService.criarEvento({
      ...req.body,
      responsavelId: req.user.id,
    });
    res.status(201).json({ success: true, message: 'Evento criado com sucesso', data: evento });
  } catch (error) {
    next(error);
  }
};

export const obter = async (req, res, next) => {
  try {
    const evento = await eventoService.obterEvento(req.params.id);
    res.json({ success: true, data: evento });
  } catch (error) {
    next(error);
  }
};

export const atualizar = async (req, res, next) => {
  try {
    const evento = await eventoService.atualizarEvento(req.params.id, req.body);
    res.json({ success: true, message: 'Evento atualizado com sucesso', data: evento });
  } catch (error) {
    next(error);
  }
};

export const deletar = async (req, res, next) => {
  try {
    await eventoService.deletarEvento(req.params.id);
    res.json({ success: true, message: 'Evento deletado com sucesso' });
  } catch (error) {
    next(error);
  }
};
