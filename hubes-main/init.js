#!/usr/bin/env node

/**
 * Script de Inicialização - SIGA Secult
 * Este arquivo pode ser executado com: node init.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 SIGA SECULT - INICIALIZAÇÃO RÁPIDA\n');

const steps = [
  {
    name: '✅ Verificar Node.js',
    check: () => {
      try {
        execSync('node -v');
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: '✅ Verificar npm',
    check: () => {
      try {
        execSync('npm -v');
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    name: '✅ Backend .env',
    check: () => fs.existsSync('./backend/.env'),
  },
  {
    name: '✅ Frontend .env',
    check: () => fs.existsSync('./frontend/.env'),
  },
  {
    name: '✅ Node modules Backend',
    check: () => fs.existsSync('./backend/node_modules'),
  },
  {
    name: '✅ Node modules Frontend',
    check: () => fs.existsSync('./frontend/node_modules'),
  },
  {
    name: '✅ SUPABASE_SCHEMA.sql',
    check: () => fs.existsSync('./SUPABASE_SCHEMA.sql'),
  },
];

console.log('Verificando status...\n');

let all_ok = true;
steps.forEach(step => {
  const result = step.check();
  console.log(`${result ? '✓' : '✗'} ${step.name}`);
  if (!result) all_ok = false;
});

console.log('\n' + '='.repeat(50));

if (all_ok) {
  console.log('✅ Tudo pronto! Você pode começar:\n');
  console.log('   cd backend && npm run dev');
  console.log('   # Em outro terminal:');
  console.log('   cd frontend && npm run dev\n');
} else {
  console.log('⚠️  Alguns passos estão pendentes:\n');
  console.log('1. Verificar .env files');
  console.log('2. Executar: npm install (backend e frontend)');
  console.log('3. Executar SUPABASE_SCHEMA.sql no Supabase\n');
}

console.log('Documentação disponível:');
console.log('  • OVERVIEW.md - Visão geral do projeto');
console.log('  • RESUMO_IMPLEMENTACAO.md - Resumo do que foi feito');
console.log('  • GUIA_DEPLOYMENT_PRODUCAO.md - Guia detalhado');
console.log('  • INSTRUCOES_PRODUCAO.md - Instruções de produção\n');
