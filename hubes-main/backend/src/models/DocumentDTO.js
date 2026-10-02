export class DocumentDTO {
  constructor({ titulo, data, responsavelId, arquivo }) {
    this.titulo = titulo;
    this.data = data ? new Date(data) : new Date();
    this.responsavelId = responsavelId;
    this.arquivo = arquivo;
  }
}
