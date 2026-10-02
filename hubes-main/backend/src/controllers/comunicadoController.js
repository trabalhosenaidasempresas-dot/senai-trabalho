import * as comunicadoService from '../services/comunicadoService.js';

export const listar = async (req, res, next) => {
  try {
    const { pagina = 1, limite = 10, search, sortField, sortOrder } = req.query;
    const resultado = await comunicadoService.listarComunicados(
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

export const criar = async (req, res, next) => {
  try {
    // garantir que o autor seja o usuário autenticado
    const comunicado = await comunicadoService.criarComunicado({ ...req.body, autorId: req.user.id });
    res.status(201).json({ success: true, message: 'Comunicado criado com sucesso', data: comunicado });
  } catch (error) {
    next(error);
  }
};

export const obter = async (req, res, next) => {
  try {
    const comunicado = await comunicadoService.obterComunicado(req.params.id);
    res.json({ success: true, data: comunicado });
  } catch (error) {
    next(error);
  }
};

export const atualizar = async (req, res, next) => {
  try {
    const comunicado = await comunicadoService.atualizarComunicado(req.params.id, req.body);
    res.json({ success: true, message: 'Comunicado atualizado com sucesso', data: comunicado });
  } catch (error) {
    next(error);
  }
};

export const deletar = async (req, res, next) => {
  try {
    await comunicadoService.deletarComunicado(req.params.id);
    res.json({ success: true, message: 'Comunicado deletado com sucesso' });
  } catch (error) {
    next(error);
  }
};
