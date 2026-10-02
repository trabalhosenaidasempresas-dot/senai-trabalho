#!/bin/bash
# Script de verificação pré-deployment

echo "🔍 VERIFICAÇÃO PRÉ-DEPLOYMENT - SIGA SECULT"
echo "=========================================="
echo ""

# Verificar Node.js
echo "✓ Verificando Node.js..."
node_version=$(node -v)
echo "  Node.js: $node_version"

npm_version=$(npm -v)
echo "  npm: $npm_version"

# Verificar .env
echo ""
echo "✓ Verificando variáveis de ambiente..."

if [ -f "backend/.env" ]; then
    echo "  ✅ backend/.env existe"
    db_url=$(grep DATABASE_URL backend/.env)
    if [[ ! -z "$db_url" ]]; then
        echo "  ✅ DATABASE_URL configurada"
    else
        echo "  ❌ DATABASE_URL não encontrada"
    fi
else
    echo "  ❌ backend/.env não encontrado"
fi

if [ -f "frontend/.env" ]; then
    echo "  ✅ frontend/.env existe"
else
    echo "  ❌ frontend/.env não encontrado"
fi

# Verificar diretórios
echo ""
echo "✓ Verificando estrutura de diretórios..."

for dir in "backend" "frontend" "backend/src" "frontend/src"; do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir/"
    else
        echo "  ❌ $dir/ não encontrado"
    fi
done

# Verificar arquivos importantes
echo ""
echo "✓ Verificando arquivos importantes..."

files=("SUPABASE_SCHEMA.sql" "GUIA_DEPLOYMENT_PRODUCAO.md" "ROTEIRO_IMPLEMENTACAO.md" "backend/package.json" "frontend/package.json")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file não encontrado"
    fi
done

# Verificar Git
echo ""
echo "✓ Verificando Git..."

if command -v git &> /dev/null; then
    git_status=$(git status 2>&1 | head -1)
    if [[ "$git_status" == *"Not a git repository"* ]]; then
        echo "  ⚠️  Não é um repositório Git. Execute: git init"
    else
        echo "  ✅ Repositório Git encontrado"
        echo "  Branch: $(git branch --show-current)"
    fi
else
    echo "  ⚠️  Git não está instalado"
fi

echo ""
echo "=========================================="
echo "✅ Verificação concluída!"
echo ""
echo "Próximas ações:"
echo "1. npm install (backend e frontend)"
echo "2. Executar SUPABASE_SCHEMA.sql no Supabase"
echo "3. npm run dev (testar localmente)"
echo "4. git push (enviar para GitHub)"
echo "5. Deploy no Vercel/Railway"
