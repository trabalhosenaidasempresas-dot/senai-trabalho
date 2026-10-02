-- SIGA Secult - Script SQL para Supabase
-- ============================================
-- NOTA: Execute este script no Editor SQL do Supabase
-- Esta versão inclui todas as tabelas necessárias com TLS/SSL configurado

-- ========================================
-- 1. USUÁRIOS E PERMISSÕES
-- ========================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  setor VARCHAR(100),
  perfil VARCHAR(50) DEFAULT 'Servidor' NOT NULL,
  status VARCHAR(50) DEFAULT 'Ativo' NOT NULL,
  foto VARCHAR(500),
  refresh_token VARCHAR(500),
  password_reset_token VARCHAR(500),
  password_reset_expires TIMESTAMP,
  criado_por VARCHAR(255),
  atualizado_por VARCHAR(255),
  deletado_por VARCHAR(255),
  deletado_em TIMESTAMP,
  ultimo_login TIMESTAMP,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT usuarios_email_unique UNIQUE(email),
  CONSTRAINT usuarios_status_check CHECK (status IN ('Ativo', 'Inativo', 'Bloqueado')),
  CONSTRAINT usuarios_perfil_check CHECK (perfil IN ('Administrador', 'Gestor', 'Servidor', 'Visitante'))
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil);
CREATE INDEX idx_usuarios_status ON usuarios(status);
CREATE INDEX idx_usuarios_setor ON usuarios(setor);

-- Tabela de Permissões
CREATE TABLE IF NOT EXISTS permissoes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  usuario_id TEXT NOT NULL,
  modulo VARCHAR(100) NOT NULL,
  acao VARCHAR(50) NOT NULL,
  concedido BOOLEAN DEFAULT false,
  data_concessao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valido_ate TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT permissoes_usuario_fk FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT permissoes_unique UNIQUE(usuario_id, modulo, acao)
);

CREATE INDEX idx_permissoes_usuario_id ON permissoes(usuario_id);
CREATE INDEX idx_permissoes_modulo ON permissoes(modulo);

-- ========================================
-- 2. DOCUMENTOS
-- ========================================

-- Tabela de Documentos
CREATE TABLE IF NOT EXISTS documentos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  titulo VARCHAR(500) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT,
  responsavel_id TEXT NOT NULL,
  data TIMESTAMP NOT NULL,
  arquivo VARCHAR(500) NOT NULL,
  tamanho_arquivo INTEGER,
  data_vencimento TIMESTAMP,
  fornecedor VARCHAR(255),
  fotos TEXT[] DEFAULT ARRAY[]::text[],
  numero_documento VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'Ativo' NOT NULL,
  nivel_acesso VARCHAR(50) DEFAULT 'Público' NOT NULL,
  assinado BOOLEAN DEFAULT false,
  device_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT documentos_responsavel_fk FOREIGN KEY (responsavel_id) 
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT documentos_tipo_check CHECK (tipo IN ('Contrato', 'Ofício', 'Edital', 'Memorando', 'PDF', 'Diversos')),
  CONSTRAINT documentos_status_check CHECK (status IN ('Ativo', 'Arquivado', 'Deletado')),
  CONSTRAINT documentos_nivel_acesso_check CHECK (nivel_acesso IN ('Público', 'Restrito', 'Confidencial'))
);

CREATE INDEX idx_documentos_tipo ON documentos(tipo);
CREATE INDEX idx_documentos_categoria ON documentos(categoria);
CREATE INDEX idx_documentos_fornecedor ON documentos(fornecedor);
CREATE INDEX idx_documentos_status ON documentos(status);
CREATE INDEX idx_documentos_responsavel_id ON documentos(responsavel_id);
CREATE INDEX idx_documentos_numero_documento ON documentos(numero_documento);
CREATE INDEX idx_documentos_nivel_acesso ON documentos(nivel_acesso);

-- Tabela de Versões de Documentos
CREATE TABLE IF NOT EXISTS documento_versoes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  documento_id TEXT NOT NULL,
  versao INTEGER DEFAULT 1,
  arquivo VARCHAR(500) NOT NULL,
  mudancas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT documento_versoes_documento_fk FOREIGN KEY (documento_id) 
    REFERENCES documentos(id) ON DELETE CASCADE
);

CREATE INDEX idx_documento_versoes_documento_id ON documento_versoes(documento_id);
CREATE INDEX idx_documento_versoes_versao ON documento_versoes(versao);

-- Tabela de Histórico de Documentos
CREATE TABLE IF NOT EXISTS documento_historico (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  documento_id TEXT NOT NULL,
  acao VARCHAR(100) NOT NULL,
  descricao TEXT,
  usuario_email VARCHAR(255),
  endereco VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT documento_historico_documento_fk FOREIGN KEY (documento_id) 
    REFERENCES documentos(id) ON DELETE CASCADE
);

CREATE INDEX idx_documento_historico_documento_id ON documento_historico(documento_id);
CREATE INDEX idx_documento_historico_acao ON documento_historico(acao);
CREATE INDEX idx_documento_historico_created_at ON documento_historico(created_at);

-- Tabela de Assinaturas Digitais
CREATE TABLE IF NOT EXISTS assinaturas_digitais (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  documento_id TEXT NOT NULL,
  usuario_id TEXT NOT NULL,
  assinatura TEXT NOT NULL,
  certificado VARCHAR(500),
  data_assinatura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valido BOOLEAN DEFAULT true,
  
  CONSTRAINT assinaturas_digitais_documento_fk FOREIGN KEY (documento_id) 
    REFERENCES documentos(id) ON DELETE CASCADE,
  CONSTRAINT assinaturas_digitais_usuario_fk FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_assinaturas_digitais_documento_id ON assinaturas_digitais(documento_id);
CREATE INDEX idx_assinaturas_digitais_usuario_id ON assinaturas_digitais(usuario_id);

-- ========================================
-- 3. COMPRAS
-- ========================================

-- Tabela de Compras
CREATE TABLE IF NOT EXISTS compras (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  numero_compra VARCHAR(100) NOT NULL UNIQUE,
  solicitante_id TEXT NOT NULL,
  valor FLOAT NOT NULL,
  fornecedor VARCHAR(255) NOT NULL,
  fornecedor_email VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL,
  observacao TEXT,
  status VARCHAR(50) DEFAULT 'Solicitação' NOT NULL,
  aprovado_por_id TEXT,
  aprovado_por VARCHAR(255),
  data_aprovacao TIMESTAMP,
  motivo_rejeicao TEXT,
  data_previsao TIMESTAMP,
  data_entrega TIMESTAMP,
  device_timestamp TIMESTAMP,
  deletado_em TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT compras_solicitante_fk FOREIGN KEY (solicitante_id) 
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT compras_status_check CHECK (status IN ('Solicitação', 'Aprovação', 'Cotação', 'Compra', 'Recebimento', 'Entrega', 'Cancelada'))
);

CREATE INDEX idx_compras_numero_compra ON compras(numero_compra);
CREATE INDEX idx_compras_status ON compras(status);
CREATE INDEX idx_compras_solicitante_id ON compras(solicitante_id);
CREATE INDEX idx_compras_deletado_em ON compras(deletado_em);

-- Tabela de Itens de Compra
CREATE TABLE IF NOT EXISTS compra_itens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  compra_id TEXT NOT NULL,
  descricao VARCHAR(500) NOT NULL,
  quantidade INTEGER NOT NULL,
  valor_unitario FLOAT NOT NULL,
  valor_total FLOAT NOT NULL,
  especificacoes TEXT,
  
  CONSTRAINT compra_itens_compra_fk FOREIGN KEY (compra_id) 
    REFERENCES compras(id) ON DELETE CASCADE
);

CREATE INDEX idx_compra_itens_compra_id ON compra_itens(compra_id);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  compra_id TEXT NOT NULL,
  valor FLOAT NOT NULL,
  data_pagamento TIMESTAMP NOT NULL,
  metodo_pagamento VARCHAR(100) NOT NULL,
  numero VARCHAR(100),
  comprovante VARCHAR(500),
  status VARCHAR(50) DEFAULT 'Pendente' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT pagamentos_compra_fk FOREIGN KEY (compra_id) 
    REFERENCES compras(id) ON DELETE CASCADE,
  CONSTRAINT pagamentos_status_check CHECK (status IN ('Pendente', 'Aprovado', 'Rejeitado'))
);

CREATE INDEX idx_pagamentos_compra_id ON pagamentos(compra_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);

-- Tabela de Documentos Fiscais de Compras
CREATE TABLE IF NOT EXISTS compra_documentos_fiscais (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  compra_id TEXT NOT NULL,
  nome_arquivo VARCHAR(500) NOT NULL,
  caminho VARCHAR(500) NOT NULL,
  numero_nota VARCHAR(100),
  data_emissao TIMESTAMP,
  valor FLOAT,
  tipo VARCHAR(100),
  criado_por_id TEXT,
  criado_por VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT compra_documentos_fiscais_compra_fk FOREIGN KEY (compra_id) 
    REFERENCES compras(id) ON DELETE CASCADE
);

CREATE INDEX idx_compra_documentos_fiscais_compra_id ON compra_documentos_fiscais(compra_id);

-- Tabela de Histórico de Compras
CREATE TABLE IF NOT EXISTS compra_historico (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  compra_id TEXT NOT NULL,
  acao VARCHAR(100) NOT NULL,
  descricao TEXT,
  usuario_id TEXT,
  usuario_email VARCHAR(255),
  endereco VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT compra_historico_compra_fk FOREIGN KEY (compra_id) 
    REFERENCES compras(id) ON DELETE CASCADE
);

CREATE INDEX idx_compra_historico_compra_id ON compra_historico(compra_id);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(14) NOT NULL UNIQUE,
  cpf VARCHAR(11) UNIQUE,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  whatsapp VARCHAR(20),
  endereco VARCHAR(500),
  numero VARCHAR(20),
  complemento VARCHAR(255),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(8),
  contato VARCHAR(255),
  cargo VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'Ativo' NOT NULL,
  avaliacao_media FLOAT DEFAULT 0,
  total_compras INTEGER DEFAULT 0,
  ultima_compra TIMESTAMP,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fornecedores_cnpj_unique UNIQUE(cnpj),
  CONSTRAINT fornecedores_cpf_unique UNIQUE(cpf),
  CONSTRAINT fornecedores_status_check CHECK (status IN ('Ativo', 'Inativo', 'Bloqueado', 'Removido'))
);

CREATE INDEX idx_fornecedores_cnpj ON fornecedores(cnpj);
CREATE INDEX idx_fornecedores_cpf ON fornecedores(cpf);
CREATE INDEX idx_fornecedores_email ON fornecedores(email);
CREATE INDEX idx_fornecedores_status ON fornecedores(status);
CREATE INDEX idx_fornecedores_ativo ON fornecedores(ativo);

-- Tabela de Centros de Custo
CREATE TABLE IF NOT EXISTS centros_custo (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  departamento VARCHAR(100),
  responsavel VARCHAR(255),
  orcamento FLOAT,
  utilizado FLOAT DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT centros_custo_codigo_unique UNIQUE(codigo)
);

CREATE INDEX idx_centros_custo_codigo ON centros_custo(codigo);
CREATE INDEX idx_centros_custo_ativo ON centros_custo(ativo);
CREATE INDEX idx_centros_custo_departamento ON centros_custo(departamento);

-- Tabela de Aprovações de Compra (Fluxo)
CREATE TABLE IF NOT EXISTS aprovacoes_compra (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  compra_id TEXT NOT NULL,
  nivel INTEGER NOT NULL,
  status_aprovacao VARCHAR(50) NOT NULL,
  perfil_requerido VARCHAR(100) NOT NULL,
  usuario_id TEXT,
  motivo TEXT,
  data_aprovacao TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT aprovacoes_compra_compra_fk FOREIGN KEY (compra_id) 
    REFERENCES compras(id) ON DELETE CASCADE,
  CONSTRAINT aprovacoes_compra_usuario_fk FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT aprovacoes_compra_status_check CHECK (status_aprovacao IN ('Pendente', 'Aprovado', 'Rejeitado', 'Aguardando'))
);

CREATE INDEX idx_aprovacoes_compra_compra_id ON aprovacoes_compra(compra_id);
CREATE INDEX idx_aprovacoes_compra_nivel ON aprovacoes_compra(nivel);
CREATE INDEX idx_aprovacoes_compra_status_aprovacao ON aprovacoes_compra(status_aprovacao);
CREATE INDEX idx_aprovacoes_compra_perfil_requerido ON aprovacoes_compra(perfil_requerido);

-- ========================================
-- 4. ESTOQUE
-- ========================================

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome VARCHAR(255) NOT NULL,
  codigo VARCHAR(100) NOT NULL UNIQUE,
  categoria VARCHAR(100) NOT NULL,
  unidade VARCHAR(20) NOT NULL,
  quantidade INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 0,
  estoque_maximo INTEGER,
  localizacao VARCHAR(255),
  descricao TEXT,
  ultima_reposicao TIMESTAMP,
  preco FLOAT,
  fornecedor VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  device_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT produtos_codigo_unique UNIQUE(codigo)
);

CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);

-- Tabela de Movimentações de Estoque
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  produto_id TEXT NOT NULL,
  usuario_id TEXT,
  tipo VARCHAR(50) NOT NULL,
  quantidade INTEGER NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  referencia VARCHAR(100),
  documento VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT movimentacoes_estoque_produto_fk FOREIGN KEY (produto_id) 
    REFERENCES produtos(id) ON DELETE CASCADE,
  CONSTRAINT movimentacoes_estoque_usuario_fk FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT movimentacoes_estoque_tipo_check CHECK (tipo IN ('Entrada', 'Saída', 'Reposição'))
);

CREATE INDEX idx_movimentacoes_estoque_produto_id ON movimentacoes_estoque(produto_id);
CREATE INDEX idx_movimentacoes_estoque_usuario_id ON movimentacoes_estoque(usuario_id);
CREATE INDEX idx_movimentacoes_estoque_tipo ON movimentacoes_estoque(tipo);
CREATE INDEX idx_movimentacoes_estoque_created_at ON movimentacoes_estoque(created_at);

-- ========================================
-- 5. AGENDA
-- ========================================

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  responsavel_id TEXT NOT NULL,
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP,
  local VARCHAR(255),
  tipo VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Ativo' NOT NULL,
  participantes TEXT,
  anexos VARCHAR(500),
  device_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT eventos_responsavel_fk FOREIGN KEY (responsavel_id) 
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT eventos_tipo_check CHECK (tipo IN ('Reunião', 'Evento', 'Reserva', 'Capacitação')),
  CONSTRAINT eventos_status_check CHECK (status IN ('Ativo', 'Concluído', 'Cancelado'))
);

CREATE INDEX idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX idx_eventos_responsavel_id ON eventos(responsavel_id);
CREATE INDEX idx_eventos_tipo ON eventos(tipo);
CREATE INDEX idx_eventos_status ON eventos(status);

-- ========================================
-- 6. OCORRÊNCIAS
-- ========================================

-- Tabela de Ocorrências
CREATE TABLE IF NOT EXISTS ocorrencias (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  numero_ocorrencia VARCHAR(100) NOT NULL UNIQUE,
  titulo VARCHAR(500) NOT NULL,
  descricao TEXT NOT NULL,
  local VARCHAR(255) NOT NULL,
  setor VARCHAR(100) NOT NULL,
  responsavel_id TEXT NOT NULL,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  prioridade VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Aberto' NOT NULL,
  fotos TEXT[] DEFAULT ARRAY[]::text[],
  anexos TEXT[] DEFAULT ARRAY[]::text[],
  data_prazo TIMESTAMP,
  data_resolucao TIMESTAMP,
  device_timestamp TIMESTAMP,
  deletado_em TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT ocorrencias_responsavel_fk FOREIGN KEY (responsavel_id) 
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT ocorrencias_numero_unique UNIQUE(numero_ocorrencia),
  CONSTRAINT ocorrencias_prioridade_check CHECK (prioridade IN ('Baixa', 'Média', 'Alta', 'Crítica')),
  CONSTRAINT ocorrencias_status_check CHECK (status IN ('Aberto', 'Em andamento', 'Resolvido', 'Encerrado', 'Reaberto'))
);

CREATE INDEX idx_ocorrencias_numero_ocorrencia ON ocorrencias(numero_ocorrencia);
CREATE INDEX idx_ocorrencias_status ON ocorrencias(status);
CREATE INDEX idx_ocorrencias_prioridade ON ocorrencias(prioridade);
CREATE INDEX idx_ocorrencias_responsavel_id ON ocorrencias(responsavel_id);
CREATE INDEX idx_ocorrencias_setor ON ocorrencias(setor);
CREATE INDEX idx_ocorrencias_deletado_em ON ocorrencias(deletado_em);

-- Tabela de Histórico de Ocorrências
CREATE TABLE IF NOT EXISTS ocorrencia_historico (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ocorrencia_id TEXT NOT NULL,
  acao VARCHAR(100) NOT NULL,
  descricao TEXT,
  usuario_id VARCHAR(255),
  usuario_email VARCHAR(255),
  endereco VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT ocorrencia_historico_ocorrencia_fk FOREIGN KEY (ocorrencia_id) 
    REFERENCES ocorrencias(id) ON DELETE CASCADE
);

CREATE INDEX idx_ocorrencia_historico_ocorrencia_id ON ocorrencia_historico(ocorrencia_id);
CREATE INDEX idx_ocorrencia_historico_acao ON ocorrencia_historico(acao);

-- Tabela de Comentários de Ocorrências
CREATE TABLE IF NOT EXISTS ocorrencia_comentarios (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ocorrencia_id TEXT NOT NULL,
  usuario_id TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT ocorrencia_comentarios_ocorrencia_fk FOREIGN KEY (ocorrencia_id) 
    REFERENCES ocorrencias(id) ON DELETE CASCADE,
  CONSTRAINT ocorrencia_comentarios_usuario_fk FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_ocorrencia_comentarios_ocorrencia_id ON ocorrencia_comentarios(ocorrencia_id);
CREATE INDEX idx_ocorrencia_comentarios_usuario_id ON ocorrencia_comentarios(usuario_id);

-- ========================================
-- 7. SERVIÇOS E MANUTENÇÕES
-- ========================================

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS servicos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  numero_servico VARCHAR(100) NOT NULL UNIQUE,
  tipo_servico VARCHAR(50) DEFAULT 'Contratado' NOT NULL,
  nome VARCHAR(500) NOT NULL,
  equipamento VARCHAR(255),
  escala VARCHAR(255),
  categoria VARCHAR(100) NOT NULL,
  fornecedor VARCHAR(255),
  documento_id TEXT,
  data_inicio TIMESTAMP,
  data_vencimento TIMESTAMP,
  periodicidade VARCHAR(100),
  ultima_manutencao TEXT,
  proxima_manutencao TIMESTAMP,
  status VARCHAR(100),
  observacoes TEXT,
  fotos TEXT[] DEFAULT ARRAY[]::text[],
  anexos TEXT[] DEFAULT ARRAY[]::text[],
  responsavel_id TEXT NOT NULL,
  responsavel_email VARCHAR(255) NOT NULL,
  user_ip VARCHAR(100),
  deletado_em TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT servicos_numero_servico_unique UNIQUE(numero_servico),
  CONSTRAINT servicos_responsavel_fk FOREIGN KEY (responsavel_id) 
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT servicos_documento_fk FOREIGN KEY (documento_id) 
    REFERENCES documentos(id) ON DELETE SET NULL
);

CREATE INDEX idx_servicos_tipo_servico ON servicos(tipo_servico);
CREATE INDEX idx_servicos_equipamento ON servicos(equipamento);
CREATE INDEX idx_servicos_categoria ON servicos(categoria);
CREATE INDEX idx_servicos_fornecedor ON servicos(fornecedor);
CREATE INDEX idx_servicos_status ON servicos(status);
CREATE INDEX idx_servicos_data_inicio ON servicos(data_inicio);
CREATE INDEX idx_servicos_data_vencimento ON servicos(data_vencimento);
CREATE INDEX idx_servicos_proxima_manutencao ON servicos(proxima_manutencao);
CREATE INDEX idx_servicos_deletado_em ON servicos(deletado_em);
CREATE INDEX idx_servicos_documento_id ON servicos(documento_id);

-- Tabela de Histórico de Serviços
CREATE TABLE IF NOT EXISTS servico_historico (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  servico_id TEXT NOT NULL,
  acao VARCHAR(100) NOT NULL,
  descricao TEXT,
  usuario_id VARCHAR(255),
  usuario_email VARCHAR(255),
  endereco VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT servico_historico_servico_fk FOREIGN KEY (servico_id) 
    REFERENCES servicos(id) ON DELETE CASCADE
);

CREATE INDEX idx_servico_historico_servico_id ON servico_historico(servico_id);

-- ========================================
-- 8. COMUNICAÇÃO
-- ========================================

-- Tabela de Comunicados
CREATE TABLE IF NOT EXISTS comunicados (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  titulo VARCHAR(500) NOT NULL,
  conteudo TEXT NOT NULL,
  autor_id TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  anexos VARCHAR(500),
  status VARCHAR(50) DEFAULT 'Ativo' NOT NULL,
  data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_vencimento TIMESTAMP,
  device_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT comunicados_autor_fk FOREIGN KEY (autor_id) 
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT comunicados_tipo_check CHECK (tipo IN ('Aviso', 'Comunicado', 'Notificação', 'Circular')),
  CONSTRAINT comunicados_status_check CHECK (status IN ('Ativo', 'Arquivado', 'Deletado'))
);

CREATE INDEX idx_comunicados_tipo ON comunicados(tipo);
CREATE INDEX idx_comunicados_status ON comunicados(status);
CREATE INDEX idx_comunicados_autor_id ON comunicados(autor_id);

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS mensagens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  remetente_id TEXT NOT NULL,
  destinatario_id TEXT NOT NULL,
  assunto VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  anexos VARCHAR(500),
  lida BOOLEAN DEFAULT false,
  data_leitura TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Enviada' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT mensagens_remetente_fk FOREIGN KEY (remetente_id) 
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT mensagens_destinatario_fk FOREIGN KEY (destinatario_id) 
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT mensagens_status_check CHECK (status IN ('Rascunho', 'Enviada', 'Deletada'))
);

CREATE INDEX idx_mensagens_remetente_id ON mensagens(remetente_id);
CREATE INDEX idx_mensagens_destinatario_id ON mensagens(destinatario_id);
CREATE INDEX idx_mensagens_lida ON mensagens(lida);
CREATE INDEX idx_mensagens_created_at ON mensagens(created_at);

-- ========================================
-- 9. NOTIFICAÇÕES
-- ========================================

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  usuario_id TEXT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  referencia VARCHAR(100),
  modulo_ref VARCHAR(50),
  lida BOOLEAN DEFAULT false,
  data_leitura TIMESTAMP,
  acao VARCHAR(255),
  prioridade INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expira_em TIMESTAMP,
  
  CONSTRAINT notificacoes_usuario_fk FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT notificacoes_tipo_check CHECK (tipo IN ('info', 'aviso', 'erro', 'sucesso', 'tarefa'))
);

CREATE INDEX idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_tipo ON notificacoes(tipo);
CREATE INDEX idx_notificacoes_modulo_ref ON notificacoes(modulo_ref);
CREATE INDEX idx_notificacoes_created_at ON notificacoes(created_at);

-- ========================================
-- 10. LOGS DO SISTEMA
-- ========================================

-- Tabela de Logs
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  usuario_id TEXT,
  acao VARCHAR(100) NOT NULL,
  modulo VARCHAR(100) NOT NULL,
  tabela VARCHAR(100),
  registro_id VARCHAR(100),
  tipo_operacao VARCHAR(50) NOT NULL,
  dados_antes TEXT,
  dados_depois TEXT,
  endereco VARCHAR(50),
  user_agent TEXT,
  status VARCHAR(50) NOT NULL,
  mensagem TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT logs_usuario_fk FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT logs_tipo_operacao_check CHECK (tipo_operacao IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT'))
);

CREATE INDEX idx_logs_usuario_id ON logs(usuario_id);
CREATE INDEX idx_logs_modulo ON logs(modulo);
CREATE INDEX idx_logs_tabela ON logs(tabela);
CREATE INDEX idx_logs_acao ON logs(acao);
CREATE INDEX idx_logs_tipo_operacao ON logs(tipo_operacao);
CREATE INDEX idx_logs_created_at ON logs(created_at);

-- ========================================
-- 11. AUDITORIA E CONFIGURAÇÕES
-- ========================================

-- Tabela de Auditoria
CREATE TABLE IF NOT EXISTS auditoria_registros (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tabela VARCHAR(100) NOT NULL,
  registro_id VARCHAR(100) NOT NULL,
  tipo_operacao VARCHAR(50) NOT NULL,
  dados_antes TEXT,
  dados_depois TEXT,
  usuario_id VARCHAR(100),
  endereco VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT auditoria_registros_tipo_operacao_check CHECK (tipo_operacao IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX idx_auditoria_registros_tabela ON auditoria_registros(tabela);
CREATE INDEX idx_auditoria_registros_registro_id ON auditoria_registros(registro_id);
CREATE INDEX idx_auditoria_registros_created_at ON auditoria_registros(created_at);

-- Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  chave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT configuracoes_sistema_chave_unique UNIQUE(chave)
);

-- ========================================
-- RECURSOS DO SUPABASE / SSL-TLS
-- ========================================
-- As conexões ao Supabase usam SSL/TLS por padrão
-- A conexão com PGSSLMODE=require é ativada automaticamente
-- O certificado raiz é fornecido pelo Supabase e configurado no .env
-- Não são necessárias alterações adicionais para SSL/TLS neste script

-- ========================================
-- SEED INICIAL (Usuário Admin PADRÃO)
-- ========================================
-- IMPORTANTE: Altere a senha do admin antes de usar em produção!
-- Execute este comando para criar um usuário admin inicial:
/*
INSERT INTO usuarios (nome, email, senha, perfil, status, ativo)
VALUES (
  'Administrador Sistema',
  'admin@siga.local',
  'use bcrypt para hasher uma senha segura',
  'Administrador',
  'Ativo',
  true
);
*/

-- ========================================
-- COMENTÁRIOS DE IMPLEMENTAÇÃO
-- ========================================
-- 1. Todas as tabelas usam UUID como chave primária (TEXT com UUID functions)
-- 2. Timestamps com padrão CURRENT_TIMESTAMP para auditoria
-- 3. Constraints apropriadas para integridade referencial
-- 4. Índices criados em colunas frequentemente consultadas para performance
-- 5. Check constraints para validar enums (perfis, status, tipos, etc)
-- 6. As conexões SSL/TLS com Supabase são automáticas quando usando driver PostgreSQL
-- 7. Para Supabase, use a connection string fornecida com PGSSLMODE=require

-- ========================================
-- VERIFICAÇÃO PÓS-CRIAÇÃO
-- ========================================
-- Execute após criar todas as tabelas:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
