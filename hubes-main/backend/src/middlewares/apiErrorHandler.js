import { ApiError } from '../utils/errors.js';

export default (err, req, res, next) => {
  // Log sempre que erro ocorre
  console.error(`[ERROR] ${req.method} ${req.path}`);
  console.error('Error object:', {
    message: err?.message,
    name: err?.name,
    code: err?.code,
    status: err?.status,
    stack: err?.stack?.substring(0, 200)
  });

  // Erros que já são ApiError (lançados pelo app)
  if (err instanceof ApiError) {
    const payload = { success: false, message: err.message };
    if (err.details) payload.errors = err.details;
    return res.status(err.status).json(payload);
  }

  // Erros do Prisma: tratar alguns códigos conhecidos para respostas mais claras
  try {
    if (err && err.name === 'PrismaClientInitializationError') {
      console.error('🔴 PrismaClientInitializationError:', err.message);
      return res.status(503).json({ success: false, message: 'Serviço indisponível: falha ao conectar ao banco de dados' });
    }

    // Erros de integridade/validação do Prisma (ex: P2002 unique constraint)
    if (err && err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
      console.error('🔴 Prisma error:', err.code, err.meta || err.message || err);
      // Mapear alguns códigos para status apropriados
      if (err.code === 'P2002') {
        // Conflito por campo único
        const target = err.meta && err.meta.target ? err.meta.target.join(', ') : 'campo único';
        return res.status(409).json({ success: false, message: `Conflito: valor duplicado em ${target}` });
      }
      // Outros erros do Prisma devolvem 400/500 conforme a gravidade
      return res.status(400).json({ success: false, message: 'Erro de banco de dados', details: err.message });
    }
  } catch (e) {
    // Se algo falhar ao inspecionar o erro, cair para tratamento genérico abaixo
    console.error('Erro ao processar erro do Prisma:', e);
  }

  // Caso geral: log completo e resposta genérica
  console.error('🔴 Erro não tratado:', err);
  return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
};
