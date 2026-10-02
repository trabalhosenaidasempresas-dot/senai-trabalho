# 🎯 Roadmap SIGA Secult - Próximas Funcionalidades

## 📅 Fase 1: MVP (Semanas 1-4) ✅ CONCLUÍDO

### Autenticação ✅
- [x] Login com JWT
- [x] Refresh token
- [x] Middleware de autenticação
- [x] Controle de perfis

### Usuários ✅
- [x] CRUD completo
- [x] Upload de foto
- [x] Paginação
- [x] Interface Material-UI

### Base de Dados ✅
- [x] Schema Prisma
- [x] Migrations
- [x] Seed de dados

### Frontend Base ✅
- [x] Login page
- [x] Dashboard
- [x] Layout responsivo
- [x] Navegação

---

## 📅 Fase 2: Módulo Documental (Semanas 5-8)

### Gestão de Documentos
- [ ] Upload de arquivos (PDF, Word, etc)
- [ ] Categorização de documentos
- [ ] Busca avançada
- [ ] Versionamento
- [ ] Histórico de acesso
- [ ] Download seguro
- [ ] Compartilhamento

### Controllers/Services/Repos Necessários
- [ ] DocumentoController
- [ ] DocumentoService
- [ ] DocumentoRepository
- [ ] DocumentoVersaoController

### Frontend
- [ ] Página de documentos
- [ ] Upload form
- [ ] Table de documentos
- [ ] Componente de versões
- [ ] Componente de histórico

### Testes
- [ ] Upload de documento
- [ ] Download
- [ ] Versionamento
- [ ] Histórico
- [ ] Permissões

---

## 📅 Fase 3: Controle de Compras (Semanas 9-14)

### Funcionalidades
- [ ] Fluxo completo: Solicitação → Aprovação → Cotação → Compra → Recebimento → Entrega
- [ ] Aprovação por hierarquia
- [ ] Cotação de fornecedores
- [ ] Rastreamento
- [ ] Notificações de status
- [ ] Relatórios

### Arquitetura
- [ ] CompraController
- [ ] CompraService
- [ ] CompraRepository
- [ ] CompraItem (Controller/Service/Repo)
- [ ] CompraWorkflow (Service)

### Frontend
- [ ] Página de compras
- [ ] Formulário de solicitação
- [ ] Dashboard de compras
- [ ] Status timeline
- [ ] Aprovações
- [ ] Relatórios

### Testes
- [ ] Criar solicitação
- [ ] Aprovação
- [ ] Cotação
- [ ] Workflow completo
- [ ] Permissões por setor

---

## 📅 Fase 4: Gestão de Estoque (Semanas 15-18)

### Funcionalidades
- [ ] Cadastro de produtos
- [ ] Entrada e saída
- [ ] Inventário
- [ ] Alertas de mínimo
- [ ] Histórico de movimentações
- [ ] Relatório de estoque

### Arquitetura
- [ ] ProdutoController
- [ ] ProdutoService
- [ ] ProdutoRepository
- [ ] MovimentacaoEstoqueController
- [ ] MovimentacaoEstoqueService
- [ ] AlertaEstoque (Serviço)

### Frontend
- [ ] Página de estoque
- [ ] Cadastro de produtos
- [ ] Entrada/Saída
- [ ] Alertas
- [ ] Histórico
- [ ] Relatório

---

## 📅 Fase 5: Agenda (Semanas 19-21)

### Funcionalidades
- [ ] Calendário mensal/semanal/diário
- [ ] Reserva de espaços
- [ ] Reserva de equipamentos
- [ ] Sincronização
- [ ] Notificações
- [ ] Disponibilidade

### Arquitetura
- [ ] EventoController
- [ ] EventoService
- [ ] EventoRepository
- [ ] ReservaService

### Frontend
- [ ] Componente calendário
- [ ] Formulário de evento
- [ ] Reservas de espaço
- [ ] Disponibilidade

---

## 📅 Fase 6: Ocorrências (Semanas 22-24)

### Funcionalidades
- [ ] Registro de problemas
- [ ] Priorização
- [ ] Workflow: Aberto → Em Andamento → Resolvido → Encerrado
- [ ] Upload de fotos/anexos
- [ ] Atribuição de responsáveis
- [ ] Relatório de ocorrências

### Arquitetura
- [ ] OcorrenciaController
- [ ] OcorrenciaService
- [ ] OcorrenciaRepository

### Frontend
- [ ] Página de ocorrências
- [ ] Formulário
- [ ] Status timeline
- [ ] Fotos/anexos

---

## 📅 Fase 7: Comunicação (Semanas 25-26)

### Funcionalidades
- [ ] Avisos
- [ ] Comunicados
- [ ] Mensagens internas
- [ ] Notificações em tempo real
- [ ] Destinatários por grupo

### Arquitetura
- [ ] ComunicadoController
- [ ] MensagemController
- [ ] Socket.io para tempo real

### Frontend
- [ ] Página de comunicação
- [ ] Centro de notificações
- [ ] Formulário de comunicados

---

## 📅 Fase 8: Indicadores e Dashboard (Semanas 27-30)

### Funcionalidades
- [ ] Dashboard analítico
- [ ] KPIs
- [ ] Gráficos (compras, estoque, ocorrências)
- [ ] Exportação PDF
- [ ] Exportação Excel
- [ ] Timeline de atividades

### Frontend
- [ ] Página de indicadores
- [ ] Gráficos com Chart.js
- [ ] Filtros
- [ ] Exportação

---

## 🔄 Melhorias Transversais

### Performance
- [ ] Caching com Redis
- [ ] Paginação em todas as listas
- [ ] Lazy loading de imagens
- [ ] Code splitting no React

### Segurança
- [ ] 2FA
- [ ] Logs de auditoria
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] HTTPS em produção

### Experiência do Usuário
- [ ] Notificações toast
- [ ] Confirmações
- [ ] Validações em tempo real
- [ ] Modo dark
- [ ] PWA

### Infraestrutura
- [ ] Docker
- [ ] CI/CD com GitHub Actions
- [ ] Deploy automático
- [ ] Monitoramento
- [ ] Backups automáticos

---

## 🧪 Qualidade de Código

### Testes
- [ ] Testes unitários (Jest)
- [ ] Testes de integração
- [ ] Testes E2E (Cypress)
- [ ] Cobertura de 80%+

### Documentação
- [ ] API docs (Swagger)
- [ ] Guias de uso
- [ ] Comentários no código
- [ ] Changelog

---

## 📊 Estimativa de Esforço

| Fase | Semanas | Prioridade | Status |
|------|---------|-----------|--------|
| 1    | 4       | 🔴 Alta    | ✅ Concluído |
| 2    | 4       | 🔴 Alta    | ⏳ Próxima |
| 3    | 6       | 🔴 Alta    | 📅 Planejada |
| 4    | 4       | 🟠 Média   | 📅 Planejada |
| 5    | 3       | 🟠 Média   | 📅 Planejada |
| 6    | 3       | 🟠 Média   | 📅 Planejada |
| 7    | 2       | 🟡 Baixa   | 📅 Planejada |
| 8    | 4       | 🟠 Média   | 📅 Planejada |
| Melhorias | 4 | 🟡 Baixa | 📅 Contínuo |

**Total: ~30 semanas (~7 meses) para MVP completo**

---

## 🎯 Próxima Ação

Iniciar **Fase 2: Módulo de Gestão Documental**
- Criar DocumentoController
- Implementar DocumentoService
- Criar interface de upload
- Testar funcionalidades

---

## 📞 Contato / Suporte

Para dúvidas ou sugestões sobre o roadmap, consulte o documento de especificações ou entre em contato com o arquiteto de software.
