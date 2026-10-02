#!/bin/bash

echo "🚀 Instalando SIGA Secult..."

# Backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install

echo "🔧 Configurando variáveis de ambiente do backend..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env criado. Edite com suas configurações de banco de dados."
fi

echo "✅ Backend preparado!"

# Frontend
cd ../frontend
echo "📦 Instalando dependências do frontend..."
npm install
echo "✅ Frontend preparado!"

echo ""
echo "🎉 Instalação concluída!"
echo ""
echo "Para iniciar:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Acesse: http://localhost:3001"
echo "Login: admin@secult.com / admin123"
