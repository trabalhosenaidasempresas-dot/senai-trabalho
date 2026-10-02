export class UsuarioDTO {
  constructor({ nome, email, senha, telefone, setor, perfil, foto }) {
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.telefone = telefone || null;
    this.setor = setor || null;
    this.perfil = perfil || 'Servidor';
    this.foto = foto || null;
  }
}
