@echo off
echo 🚀 Instalando SIGA Secult...

REM Backend
echo 📦 Instalando dependências do backend...
cd backend
call npm install

echo 🔧 Configurando variáveis de ambiente do backend...
if not exist .env (
    copy .env.example .env
    echo ✅ .env criado. Edite com suas configurações de banco de dados.
)

echo ✅ Backend preparado!

REM Frontend
cd ..\frontend
echo 📦 Instalando dependências do frontend...
call npm install
echo ✅ Frontend preparado!

echo.
echo 🎉 Instalação concluída!
echo.
echo Para iniciar:
echo 1. Backend: cd backend ^&^& npm run dev
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.
echo Acesse: http://localhost:3001
echo Login: admin@secult.com / admin123
