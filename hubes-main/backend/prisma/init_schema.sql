-- SIGA Secult PostgreSQL schema
-- Use este arquivo para criar as tabelas do projeto SIGA Secult.

DROP TABLE IF EXISTS mensagens CASCADE;
DROP TABLE IF EXISTS comunicados CASCADE;
DROP TABLE IF EXISTS ocorrencias CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;
DROP TABLE IF EXISTS movimentacoes_estoque CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS compra_itens CASCADE;
DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS documento_historico CASCADE;
DROP TABLE IF EXISTS documento_versoes CASCADE;
DROP TABLE IF EXISTS documentos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id TEXT NOT NULL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  telefone TEXT,
  setor TEXT,
  perfil TEXT NOT NULL DEFAULT 'Servidor',
  status TEXT NOT NULL DEFAULT 'Ativo',
  foto TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE documentos (
  id TEXT NOT NULL PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  categoria TEXT,
  responsavelId TEXT NOT NULL,
  data TIMESTAMP NOT NULL,
  arquivo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativo',
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT documentos_responsavelId_fkey FOREIGN KEY (responsavelId) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE documento_versoes (
  id TEXT NOT NULL PRIMARY KEY,
  documentoId TEXT NOT NULL,
  versao INTEGER NOT NULL,
  arquivo TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT documento_versoes_documentoId_fkey FOREIGN KEY (documentoId) REFERENCES documentos(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE documento_historico (
  id TEXT NOT NULL PRIMARY KEY,
  documentoId TEXT NOT NULL,
  acao TEXT NOT NULL,
  descricao TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT documento_historico_documentoId_fkey FOREIGN KEY (documentoId) REFERENCES documentos(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE compras (
  id TEXT NOT NULL PRIMARY KEY,
  solicitanteId TEXT NOT NULL,
  centoCusto TEXT NOT NULL,
  valor REAL NOT NULL,
  fornecedor TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Solicitação',
  observacao TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT compras_solicitanteId_fkey FOREIGN KEY (solicitanteId) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE compra_itens (
  id TEXT NOT NULL PRIMARY KEY,
  compraId TEXT NOT NULL,
  descricao TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  valor REAL NOT NULL,
  CONSTRAINT compra_itens_compraId_fkey FOREIGN KEY (compraId) REFERENCES compras(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE produtos (
  id TEXT NOT NULL PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  unidade TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  estoqueMinimo INTEGER NOT NULL DEFAULT 0,
  localizacao TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE movimentacoes_estoque (
  id TEXT NOT NULL PRIMARY KEY,
  produtoId TEXT NOT NULL,
  tipo TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  motivo TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT movimentacoes_estoque_produtoId_fkey FOREIGN KEY (produtoId) REFERENCES produtos(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE eventos (
  id TEXT NOT NULL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  responsavelId TEXT NOT NULL,
  dataInicio TIMESTAMP NOT NULL,
  dataFim TIMESTAMP,
  local TEXT,
  tipo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativo',
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT eventos_responsavelId_fkey FOREIGN KEY (responsavelId) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ocorrencias (
  id TEXT NOT NULL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  local TEXT NOT NULL,
  setor TEXT NOT NULL,
  responsavelId TEXT NOT NULL,
  prioridade TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aberto',
  fotos TEXT,
  anexos TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT ocorrencias_responsavelId_fkey FOREIGN KEY (responsavelId) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE comunicados (
  id TEXT NOT NULL PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  autorId TEXT NOT NULL,
  tipo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativo',
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  updatedAt TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT comunicados_autorId_fkey FOREIGN KEY (autorId) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE mensagens (
  id TEXT NOT NULL PRIMARY KEY,
  remetenteId TEXT NOT NULL,
  assunto TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT mensagens_remetenteId_fkey FOREIGN KEY (remetenteId) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);
