# 📦 Módulo de Compras - Documentação Completa

## ✅ Funcionalidades Implementadas

### 1. **Cadastro de Compras**
- ✓ Criar compra com número único
- ✓ Informar fornecedor, centro de custo e valor
- ✓ Status progressivo: Solicitação → Aprovação → Cotação → Compra → Recebimento → Entrega → Cancelada
- ✓ Data de previsão e entrega
- ✓ Observações e notas

**Endpoint:**
```
POST /api/compras
GET /api/compras
GET /api/compras/:id
PUT /api/compras/:id
DELETE /api/compras/:id
```

---

### 2. **Itens de Compra**
- ✓ Múltiplos itens por compra
- ✓ Descrição, quantidade e valor unitário
- ✓ Cálculo automático do valor total
- ✓ Especificações detalhadas opcionais

**Exemplo de Requisição:**
```json
{
  "numeroCompra": "CMP-001",
  "fornecedor": "Fornecedor LTDA",
  "centoCusto": "Administrativo",
  "status": "Solicitação",
  "itens": [
    {
      "descricao": "Papel A4 75g",
      "quantidade": 10,
      "valorUnitario": 35.50,
      "especificacoes": "Resma com 500 folhas"
    },
    {
      "descricao": "Caneta azul",
      "quantidade": 100,
      "valorUnitario": 1.50,
      "especificacoes": "Caixa com 50 unidades"
    }
  ]
}
```

---

### 3. **Gestão de Fornecedores**
- ✓ Cadastro completo de fornecedores
- ✓ Validação de CNPJ/CPF único
- ✓ Dados de contato: email, telefone, WhatsApp
- ✓ Endereço completo
- ✓ Status: Ativo, Inativo, Bloqueado, Removido
- ✓ Avaliação média de fornecedor
- ✓ Histórico de compras

**Endpoints:**
```
GET /api/compras/fornecedores/listar?pagina=1&limite=10&search=termo&status=Ativo
POST /api/compras/fornecedores
GET /api/compras/fornecedores/:id
PUT /api/compras/fornecedores/:id
DELETE /api/compras/fornecedores/:id
```

**Exemplo:**
```json
{
  "nome": "Papelaria Premium LTDA",
  "nomeFantasia": "Papelaria Premium",
  "cnpj": "12345678000195",
  "email": "contato@papelaria.com.br",
  "telefone": "(11) 3456-7890",
  "whatsapp": "(11) 98765-4321",
  "endereco": "Rua das Flores",
  "numero": "123",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "contato": "João Silva",
  "cargo": "Gerente Comercial"
}
```

---

### 4. **Centros de Custo**
- ✓ Cadastro de centros de custo
- ✓ Código único e nome
- ✓ Departamento e responsável
- ✓ Orçamento e utilizado
- ✓ Status ativo/inativo

**Endpoints:**
```
GET /api/compras/centros-custo/listar?pagina=1&limite=10&search=termo
GET /api/compras/centros-custo/:id
```

---

### 5. **Valores e Cálculos**
- ✓ Cálculo automático do valor total a partir dos itens
- ✓ Validação de valores (não negativos)
- ✓ Conversão automática para número decimal
- ✓ Precisão de 2 casas decimais

---

### 6. **Fluxo de Aprovação**
- ✓ Múltiplos níveis de aprovação
- ✓ Vinculação com perfis de usuário (Administrador, Gestor, Chefe, etc)
- ✓ Status por nível: Pendente, Aprovado, Rejeitado, Aguardando
- ✓ Rastreamento de quem aprovou e quando
- ✓ Motivos de rejeição

**Endpoints:**
```
GET /api/compras/:id/fluxo-aprovacao
POST /api/compras/:id/fluxo-aprovacao/aprovar
POST /api/compras/:id/fluxo-aprovacao/rejeitar
POST /api/compras/:id/aprovacao (aprovação simples)
```

**Exemplo - Aprovar em Nível:**
```json
{
  "nivel": 1,
  "motivo": "Aprovado conforme políticas de compra"
}
```

**Exemplo - Rejeitar em Nível:**
```json
{
  "nivel": 1,
  "motivo": "Valor acima do orçamento aprovado"
}
```

---

### 7. **Histórico Completo**
- ✓ Registro de todas as ações em cada compra
- ✓ Rastreamento de: Criação, Modificação, Aprovação, Rejeição
- ✓ Informação do usuário que realizou a ação
- ✓ IP do usuário
- ✓ Descrição detalhada da ação
- ✓ Data e hora do registro

**Endpoint:**
```
GET /api/compras/:id/historico
```

**Retorno:**
```json
[
  {
    "id": "cuid123",
    "compraId": "compra123",
    "acao": "Criado",
    "descricao": "Compra CMP-001 criada",
    "usuarioEmail": "user@example.com",
    "endereco": "192.168.1.1",
    "createdAt": "2026-07-15T19:30:00Z"
  },
  {
    "acao": "Aprovado",
    "descricao": "Compra aprovada no nível 1",
    "usuarioEmail": "gestor@example.com",
    "createdAt": "2026-07-15T20:00:00Z"
  }
]
```

---

### 8. **Upload de Documentos Fiscais**
- ✓ Upload de notas fiscais, RPA, CTe, XML
- ✓ Múltiplos documentos por compra
- ✓ Número da nota e data de emissão
- ✓ Valor do documento
- ✓ Tipo de documento (NF-e, RPA, CT-e, etc)
- ✓ Limite de 20MB por arquivo
- ✓ Download de documentos

**Endpoints:**
```
POST /api/compras/:id/documentos-fiscais (upload)
GET /api/compras/:id/documentos-fiscais (listar)
GET /api/compras/:id/documentos-fiscais/:documentoId/download
DELETE /api/compras/:id/documentos-fiscais/:documentoId
```

**Exemplo - Upload:**
```
POST /api/compras/compra123/documentos-fiscais
Content-Type: multipart/form-data

- arquivo: [arquivo.pdf]
- numeroNota: "123456"
- dataEmissao: "2026-07-15"
- valor: "1500.00"
- tipo: "NF-e"
```

---

### 9. **Estatísticas e Relatórios**

#### Estatísticas Gerais
```
GET /api/compras/estatisticas/geral
```

Retorna:
- Total de compras
- Compras pendentes
- Compras aprovadas
- Compras canceladas
- Valor total

#### Estatísticas por Status
```
GET /api/compras/estatisticas/por-status
```

Retorna grupos de compras agrupadas por status com contagem e valor total.

#### Estatísticas por Centro de Custo
```
GET /api/compras/estatisticas/por-centro-custo
```

Retorna grupos de compras agrupadas por centro de custo.

#### Relatório de Compras
```
GET /api/compras/relatorios/compras?dataInicio=2026-01-01&dataFim=2026-07-31&status=Compra&formato=json
```

Parâmetros:
- `dataInicio` - Data inicial (YYYY-MM-DD)
- `dataFim` - Data final (YYYY-MM-DD)
- `status` - Filtrar por status
- `fornecedor` - Filtrar por fornecedor
- `centroCusto` - Filtrar por centro de custo
- `formato` - json ou csv

---

## 📊 Estrutura de Dados

### Tabelas Criadas

#### `compras`
```
- id (String, PK)
- numeroCompra (String, UNIQUE)
- solicitanteId (String, FK → usuarios)
- centoCusto (String)
- valor (Float)
- fornecedor (String)
- cnpj (String)
- observacao (Text)
- status (String: Solicitação|Aprovação|Cotação|Compra|Recebimento|Entrega|Cancelada)
- aprovadoPorId (String, FK → usuarios)
- aprovadoPor (String)
- dataAprovacao (DateTime)
- motivoRejeicao (Text)
- dataPrevisao (DateTime)
- dataEntrega (DateTime)
- deletadoEm (DateTime - soft delete)
- createdAt (DateTime)
- updatedAt (DateTime)
```

#### `compra_itens`
```
- id (String, PK)
- compraId (String, FK → compras)
- descricao (String)
- quantidade (Int)
- valorUnitario (Float)
- valorTotal (Float)
- especificacoes (Text)
```

#### `compra_documentos_fiscais`
```
- id (String, PK)
- compraId (String, FK → compras)
- nomeArquivo (String)
- caminho (String)
- numeroNota (String)
- dataEmissao (DateTime)
- valor (Float)
- tipo (String)
- criadoPorId (String)
- criadoPor (String)
- createdAt (DateTime)
```

#### `compra_historico`
```
- id (String, PK)
- compraId (String, FK → compras)
- acao (String)
- descricao (Text)
- usuarioId (String)
- usuarioEmail (String)
- endereco (String - IP)
- createdAt (DateTime)
```

#### `fornecedores`
```
- id (String, PK)
- nome (String)
- nomeFantasia (String)
- cnpj (String, UNIQUE)
- cpf (String, UNIQUE)
- email (String)
- telefone (String)
- whatsapp (String)
- endereco (String)
- numero (String)
- complemento (String)
- bairro (String)
- cidade (String)
- estado (String)
- cep (String)
- contato (String)
- cargo (String)
- ativo (Boolean)
- status (String: Ativo|Inativo|Bloqueado|Removido)
- avaliacaoMedia (Float)
- totalCompras (Int)
- ultimaCompra (DateTime)
- notas (Text)
- createdAt (DateTime)
- updatedAt (DateTime)
```

#### `centros_custo`
```
- id (String, PK)
- codigo (String, UNIQUE)
- nome (String)
- descricao (Text)
- departamento (String)
- responsavel (String)
- orcamento (Float)
- utilizado (Float)
- ativo (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)
```

#### `aprovacoes_compra`
```
- id (String, PK)
- compraId (String, FK → compras)
- nivel (Int)
- statusAprovacao (String: Pendente|Aprovado|Rejeitado|Aguardando)
- perfilRequerido (String)
- usuarioId (String, FK → usuarios)
- motivo (Text)
- dataAprovacao (DateTime)
- createdAt (DateTime)
- updatedAt (DateTime)
```

---

## 🔐 Permissões Necessárias

As seguintes permissões devem ser configuradas no sistema:

```
- compras:read    (Ler compras e documentos)
- compras:create  (Criar novas compras)
- compras:update  (Atualizar e aprovar compras)
- compras:delete  (Deletar compras)
```

---

## 📝 Exemplos de Uso

### 1. Criar uma Compra Completa

```bash
curl -X POST http://localhost:3000/api/compras \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "numeroCompra": "CMP-2026-001",
    "fornecedor": "Papelaria Premium",
    "centoCusto": "Administrativo",
    "observacao": "Compra para suprimentos de escritório",
    "status": "Solicitação",
    "dataPrevisao": "2026-08-15",
    "itens": [
      {
        "descricao": "Papel A4 75g",
        "quantidade": 20,
        "valorUnitario": 35.50,
        "especificacoes": "Resma com 500 folhas - Marca X"
      },
      {
        "descricao": "Caneta Azul BIC",
        "quantidade": 10,
        "valorUnitario": 15.00,
        "especificacoes": "Caixa com 50 unidades"
      }
    ]
  }'
```

### 2. Aprovar uma Compra no Fluxo

```bash
curl -X POST http://localhost:3000/api/compras/compra123/fluxo-aprovacao/aprovar \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nivel": 1,
    "motivo": "Aprovado conforme políticas de compra"
  }'
```

### 3. Rejeitar uma Compra

```bash
curl -X POST http://localhost:3000/api/compras/compra123/fluxo-aprovacao/rejeitar \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nivel": 1,
    "motivo": "Valor acima do orçamento autorizado para o mês"
  }'
```

### 4. Upload de Documento Fiscal

```bash
curl -X POST http://localhost:3000/api/compras/compra123/documentos-fiscais \
  -H "Authorization: Bearer TOKEN" \
  -F "arquivo=@nota_fiscal.pdf" \
  -F "numeroNota=123456" \
  -F "dataEmissao=2026-07-15" \
  -F "valor=1500.00" \
  -F "tipo=NF-e"
```

### 5. Gerar Relatório CSV

```bash
curl -X GET "http://localhost:3000/api/compras/relatorios/compras?dataInicio=2026-01-01&dataFim=2026-07-31&formato=csv" \
  -H "Authorization: Bearer TOKEN" \
  --output relatorio-compras.csv
```

---

## 🚀 Próximas Melhorias

- [ ] Integração com NFe (consulta automática de notas)
- [ ] Integração com API de CNPJ
- [ ] Sistema de lembretes de vencimento
- [ ] Notificações automáticas
- [ ] Cálculo de Lead Time por fornecedor
- [ ] Ranking e avaliação de fornecedores
- [ ] Integração com estoque (reservar produtos)
- [ ] Pedidos de compra agrupados (ORC)
- [ ] Comparativo de cotações
- [ ] Integração com sistema de pagamentos

---

## 📞 Suporte

Para dúvidas ou sugestões sobre o módulo de Compras, consulte a documentação da API ou entre em contato com a equipe de desenvolvimento.

**Versão:** 1.0.0  
**Data:** 15 de julho de 2026  
**Status:** ✅ Produção
