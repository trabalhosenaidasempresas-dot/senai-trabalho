import * as comunicadoRepository from '../repositories/comunicadoRepository.js';

export const criarComunicado = async (dados) => {
  if (!dados.titulo || !dados.conteudo || !dados.tipo) {
    throw new Error('Título, conteúdo e tipo são obrigatórios');
  }
  const dispositivoTimestamp = dados.deviceTimestamp ? new Date(dados.deviceTimestamp) : null;
  return comunicadoRepository.criarComunicado({
    ...dados,
    deviceTimestamp: dispositivoTimestamp && !Number.isNaN(dispositivoTimestamp.getTime()) ? dispositivoTimestamp : undefined,
  });
};

export const obterComunicado = async (id) => {
  const comunicado = await comunicadoRepository.buscarComunicadoPorId(id);
  if (!comunicado) throw new Error('Comunicado não encontrado');
  return comunicado;
};

export const listarComunicados = async (pagina = 1, limite = 10, search = null, sortField = 'createdAt', sortOrder = 'desc') => {
  const skip = (pagina - 1) * limite;
  const comunicados = await comunicadoRepository.listarComunicados(skip, limite, search, sortField, sortOrder);
  const total = await comunicadoRepository.contarComunicados(search);

  return {
    comunicados,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    },
  };
};

export const atualizarComunicado = async (id, dados) => {
  const comunicado = await comunicadoRepository.buscarComunicadoPorId(id);
  if (!comunicado) throw new Error('Comunicado não encontrado');
  const dispositivoTimestamp = dados.deviceTimestamp ? new Date(dados.deviceTimestamp) : null;
  return comunicadoRepository.atualizarComunicado(id, {
    ...dados,
    deviceTimestamp: dispositivoTimestamp && !Number.isNaN(dispositivoTimestamp.getTime()) ? dispositivoTimestamp : undefined,
  });
};

export const deletarComunicado = async (id) => {
  const comunicado = await comunicadoRepository.buscarComunicadoPorId(id);
  if (!comunicado) throw new Error('Comunicado não encontrado');
  return comunicadoRepository.deletarComunicado(id);
};
