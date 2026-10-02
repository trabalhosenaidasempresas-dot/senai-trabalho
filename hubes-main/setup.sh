#!/bin/bash
# Script rápido de setup - SIGA Secult

echo "🚀 SIGA SECULT - SETUP RÁPIDO"
echo "=============================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para exibir status
status_ok() {
    echo -e "${GREEN}✓${NC} $1"
}

status_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

status_error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Verificar Node.js
echo "📦 Instalando dependências..."
echo ""

if ! command -v node &> /dev/null; then
    status_error "Node.js não encontrado. Instale em https://nodejs.org"
    exit 1
fi

status_ok "Node $(node -v)"
status_ok "npm $(npm -v)"

# 2. Instalar backend
echo ""
echo "⚙️  Backend..."
cd backend > /dev/null 2>&1

if [ ! -d "node_modules" ]; then
    status_warning "Instalando dependências..."
    npm install --silent > /dev/null 2>&1
    status_ok "npm install concluído"
else
    status_ok "Dependências já instaladas"
fi

cp .env.example .env 2>/dev/null || true
status_ok "Backend pronto"

cd .. > /dev/null

# 3. Instalar frontend
echo ""
echo "🎨 Frontend..."
cd frontend > /dev/null 2>&1

if [ ! -d "node_modules" ]; then
    status_warning "Instalando dependências..."
    npm install --silent > /dev/null 2>&1
    status_ok "npm install concluído"
else
    status_ok "Dependências já instaladas"
fi

status_ok "Frontend pronto"

cd .. > /dev/null

# 4. Resumo
echo ""
echo "=============================="
echo "✅ Setup concluído!"
echo ""
echo "Próximas ações:"
echo "1. Configurar .env files com credenciais"
echo "2. Executar SUPABASE_SCHEMA.sql no Supabase"
echo "3. npm run dev (testar localmente)"
echo "4. git push (enviar para GitHub)"
echo "5. Deploy no Vercel/Railway"
echo ""
echo "Para mais info, leia:"
echo "  - RESUMO_IMPLEMENTACAO.md"
echo "  - GUIA_DEPLOYMENT_PRODUCAO.md"
echo "  - INSTRUCOES_PRODUCAO.md"
echo ""
