import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Evitar múltiplas instâncias em desenvolvimento
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Tenta conectar ao banco já na inicialização para detectar problemas cedo.
// Não mata o processo automaticamente para permitir que o servidor suba com
// uma mensagem de erro clara no log; requests subsequentes seguirão retornando
// erros até o banco ficar disponível.
console.log('🔌 Tentando conectar ao Prisma...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ NÃO CONFIGURADA');

prisma
  .$connect()
  .then(() => {
    console.log('✅ Prisma conectado ao banco de dados');
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar com o banco de dados via Prisma:', err.message || err);
    console.error('Verifique sua variável DATABASE_URL e se o servidor do banco está rodando.');
    console.error('Error details:', err);
  });

export default prisma;
