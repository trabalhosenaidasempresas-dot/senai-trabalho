-- SIGA Secult SQL seed data
-- Insere usuários padrão e exemplo de documento

INSERT INTO usuarios (id, nome, email, senha, telefone, setor, perfil, status, foto, createdAt, updatedAt) VALUES
('user-admin', 'Administrador', 'admin@secult.com', '$2b$10$4tGpDDJZixp/rRHI7TKD3.aVu1fFlJkq4hnlcfK1.hilKmELTDyJC', '(27) 3131-2000', 'TI', 'Administrador', 'Ativo', NULL, now(), now()),
('user-gestor', 'Gestor', 'gestor@secult.com', '$2b$10$PaWJ3BP0dWaEq4TDaszteuKTi0CIrVLFJx.4/FeLYzzXU/CI7rYkK', '(27) 3131-2001', 'Gestão', 'Gestor', 'Ativo', NULL, now(), now()),
('user-servidor', 'Servidor', 'servidor@secult.com', '$2b$10$SWIrQxzDtM/RM40jC1f6puZFsdRPNI129vpMgCvKEHPCKS07nG5IC', '(27) 3131-2002', 'Administrativo', 'Servidor', 'Ativo', NULL, now(), now());

INSERT INTO documentos (id, titulo, tipo, categoria, responsavelId, data, arquivo, status, createdAt, updatedAt) VALUES
('doc-001', 'Documento de Exemplo', 'Ofício', 'Administração', 'user-admin', now(), '/uploads/exemplo.pdf', 'Ativo', now(), now());

INSERT INTO documento_versoes (id, documentoId, versao, arquivo, createdAt) VALUES
('versao-doc-001-v1', 'doc-001', 1, '/uploads/exemplo.pdf', now());

INSERT INTO documento_historico (id, documentoId, acao, descricao, createdAt) VALUES
('hist-doc-001-1', 'doc-001', 'Criado', 'Documento de Exemplo criado durante seed', now());
