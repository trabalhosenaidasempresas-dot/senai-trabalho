@echo off
setlocal enabledelayedexpansion

echo 🚀 SIGA SECULT - SETUP RAPIDO
echo ==============================
echo.

REM 1. Verificar Node.js
echo 📦 Instalando dependências...
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ Node.js não encontrado. Instale em https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do echo ✓ Node.js %%i
for /f "tokens=*" %%i in ('npm -v') do echo ✓ npm %%i

REM 2. Backend
echo.
echo ⚙️  Backend...

cd backend

if not exist "node_modules\" (
    echo ⚠️  Instalando dependências...
    call npm install --silent >nul 2>&1
    echo ✓ npm install concluído
) else (
    echo ✓ Dependências já instaladas
)

if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
    )
)

echo ✓ Backend pronto

cd ..

REM 3. Frontend
echo.
echo 🎨 Frontend...

cd frontend

if not exist "node_modules\" (
    echo ⚠️  Instalando dependências...
    call npm install --silent >nul 2>&1
    echo ✓ npm install concluído
) else (
    echo ✓ Dependências já instaladas
)

echo ✓ Frontend pronto

cd ..

REM 4. Resumo
echo.
echo ==============================
echo ✅ Setup concluído!
echo.
echo Próximas ações:
echo 1. Configurar .env files com credenciais
echo 2. Executar SUPABASE_SCHEMA.sql no Supabase
echo 3. npm run dev (testar localmente)
echo 4. git push (enviar para GitHub)
echo 5. Deploy no Vercel/Railway
echo.
echo Para mais info, leia:
echo   - RESUMO_IMPLEMENTACAO.md
echo   - GUIA_DEPLOYMENT_PRODUCAO.md
echo   - INSTRUCOES_PRODUCAO.md
echo.
pause
