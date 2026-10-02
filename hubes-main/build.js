#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔨 Iniciando build...');

try {
  console.log('📦 Instalando frontend...');
  execSync('npm install', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

  console.log('🔨 Buildando frontend...');
  execSync('npm run build', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

  console.log('🔄 Gerando Prisma Client...');
  execSync('npm run prisma:generate', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });

  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}
