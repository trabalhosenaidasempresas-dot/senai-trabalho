export class OcorrenciaDTO {
  constructor({ numeroOcorrencia, titulo, descricao, local, setor, responsavelId, prioridade, status, fotos, anexos, dataPrazo, dataResolucao }) {
    this.numeroOcorrencia = numeroOcorrencia;
    this.titulo = titulo;
    this.descricao = descricao;
    this.local = local;
    this.setor = setor;
    this.responsavelId = responsavelId;
    this.prioridade = prioridade;
    this.status = status || 'Aberto';
    this.fotos = fotos || null;
    this.anexos = anexos || null;
    this.dataPrazo = dataPrazo ? new Date(dataPrazo) : null;
    this.dataResolucao = dataResolucao ? new Date(dataResolucao) : null;
  }
}
