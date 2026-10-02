@echo off
REM Script de verificação pré-deployment para Windows

echo 🔍 VERIFICACAO PRE-DEPLOYMENT - SIGA SECULT
echo ==========================================
echo.

REM Verificar Node.js
echo ✓ Verificando Node.js...
node -v >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do echo   Node.js: %%i
) else (
    echo   ❌ Node.js não encontrado. Instale de https://nodejs.org
)

npm -v >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm -v') do echo   npm: %%i
)

REM Verificar .env
echo.
echo ✓ Verificando variáveis de ambiente...

if exist "backend\.env" (
    echo   ✅ backend\.env existe
) else (
    echo   ❌ backend\.env não encontrado
)

if exist "frontend\.env" (
    echo   ✅ frontend\.env existe
) else (
    echo   ⚠️  frontend\.env não encontrado
)

REM Verificar diretórios
echo.
echo ✓ Verificando estrutura de diretórios...

setlocal enabledelayedexpansion
for %%d in (backend frontend backend\src frontend\src) do (
    if exist "%%d\" (
        echo   ✅ %%d\
    ) else (
        echo   ❌ %%d\ não encontrado
    )
)

REM Verificar arquivos
echo.
echo ✓ Verificando arquivos importantes...

for %%f in (SUPABASE_SCHEMA.sql GUIA_DEPLOYMENT_PRODUCAO.md ROTEIRO_IMPLEMENTACAO.md backend\package.json frontend\package.json) do (
    if exist "%%f" (
        echo   ✅ %%f
    ) else (
        echo   ❌ %%f não encontrado
    )
)

REM Verificar Git
echo.
echo ✓ Verificando Git...

git status >nul 2>&1
if %errorlevel% neq 0 (
    echo   ⚠️  Nao eh um repositorio Git. Execute: git init
) else (
    echo   ✅ Repositorio Git encontrado
)

echo.
echo ==========================================
echo ✅ Verificação concluída!
echo.
echo Próximas ações:
echo 1. npm install (backend e frontend^)
echo 2. Executar SUPABASE_SCHEMA.sql no Supabase
echo 3. npm run dev (testar localmente^)
echo 4. git push (enviar para GitHub^)
echo 5. Deploy no Vercel/Railway
echo.
pause
