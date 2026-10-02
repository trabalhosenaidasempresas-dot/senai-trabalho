import prisma from '../src/config/database.js';

const generateNumeroServico = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 9000) + 1000);
  return `SERV-${year}${month}${day}-${random}`;
};

const serviçosContratados = [
  { nome: 'Alvará Bombeiros', fornecedor: 'Corpo de Bombeiros', dataVencimento: '2026-06-24' },
  { nome: 'Alvará de Funcionamento', fornecedor: 'PMV' },
  { nome: 'Seguro Incêndio' },
  { nome: 'Segurança', escala: '12x36 (1 diurno e 1 noturno)', fornecedor: 'SEI Vigilancia e Segurança Ltda', dataVencimento: '2027-08-01' },
  { nome: 'Recepção', fornecedor: 'SEGER - MGS' },
  { nome: 'Procuração', fornecedor: 'SEGER - MGS' },
  { nome: 'Copeira' },
  { nome: 'Limpeza', escala: '44 horas semanais' },
  { nome: 'Banheirista', escala: '44 horas semanais' },
  { nome: 'Artífice', fornecedor: 'SECTI' },
  { nome: 'Material' },
];

const manutencoes = [
  { nome: 'Ar condicionado', ultimaManutencao: 'Aguardando laudo técnico pelo IBCA', fornecedor: 'LM Soluções', periodicidade: 'Mensal' },
  { nome: 'Bebedouro', ultimaManutencao: 'Será realizada até 06/03/2026', fornecedor: 'Frimak', periodicidade: 'Semestral' },
  { nome: 'Elevador', ultimaManutencao: '20/02/2026', fornecedor: 'TKE', periodicidade: 'Mensal' },
  { nome: 'Extintores', ultimaManutencao: '12/06/2025', fornecedor: 'Extinvila', periodicidade: 'Anual' },
  { nome: 'Bomba hidráulica', ultimaManutencao: '19/02/2026', fornecedor: 'Eletrobombas', periodicidade: 'Quinzenal' },
  { nome: "Caixa d'água", ultimaManutencao: '21/11/2025', fornecedor: 'Garantia', periodicidade: 'Semestral' },
  { nome: 'Desinsetização', ultimaManutencao: '28/02/2026', fornecedor: 'PET Insetos', periodicidade: 'Trimestral' },
  { nome: 'Limpeza do esgoto', ultimaManutencao: '01/08/2024', periodicidade: 'Conforme demanda' },
  { nome: 'Limpeza do estofado', ultimaManutencao: '15/09/2025', fornecedor: 'VS Clean', periodicidade: 'Mensal' },
  { nome: 'Alarme e câmeras', periodicidade: 'Conforme demanda' },
];

const upsertServico = async (dados, responsavel) => {
  const where = { nome: dados.nome, tipoServico: dados.tipoServico };
  const exists = await prisma.servico.findFirst({ where: { nome: dados.nome, tipoServico: dados.tipoServico } });
  if (exists) return { skipped: true, id: exists.id };

  const data = {
    numeroServico: generateNumeroServico(),
    tipoServico: dados.tipoServico,
    nome: dados.nome,
    equipamento: dados.equipamento || null,
    escala: dados.escala || null,
    categoria: dados.categoria || (dados.tipoServico === 'Manutenção' ? 'Manutencao' : 'Outros'),
    fornecedor: dados.fornecedor || null,
    documentoId: null,
    dataInicio: dados.dataInicio ? new Date(dados.dataInicio) : null,
    dataVencimento: dados.dataVencimento ? new Date(dados.dataVencimento) : null,
    periodicidade: dados.periodicidade || null,
    ultimaManutencao: dados.ultimaManutencao || null,
    proximaManutencao: null,
    status: dados.status || 'Vigente',
    observacoes: dados.observacoes || null,
    fotos: [],
    anexos: [],
    responsavelId: responsavel.id,
    responsavelEmail: responsavel.email,
    userIp: '127.0.0.1',
  };

  const created = await prisma.servico.create({ data });
  await prisma.servicoHistorico.create({ data: { servicoId: created.id, acao: 'Seed criado', descricao: 'Registro inserido via seed script', usuarioId: responsavel.id, usuarioEmail: responsavel.email, endereco: '127.0.0.1' } });
  return { skipped: false, id: created.id };
};

const main = async () => {
  try {
    const admin = await prisma.usuario.findFirst({ where: { email: 'admin@secult.com' } }) || await prisma.usuario.findFirst();
    if (!admin) throw new Error('Nenhum usuário encontrado para usar como responsável. Crie um usuário admin primeiro.');

    const results = { created: [], skipped: [] };

    for (const s of serviçosContratados) {
      const dados = { ...s, tipoServico: 'Contratado' };
      const res = await upsertServico(dados, admin);
      if (res.skipped) results.skipped.push({ nome: s.nome, tipo: 'Contratado' }); else results.created.push({ nome: s.nome, tipo: 'Contratado' });
    }

    for (const m of manutencoes) {
      const dados = { ...m, tipoServico: 'Manutenção' };
      const res = await upsertServico(dados, admin);
      if (res.skipped) results.skipped.push({ nome: m.nome, tipo: 'Manutenção' }); else results.created.push({ nome: m.nome, tipo: 'Manutenção' });
    }

    console.log('Seed results:', JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  } finally {
    await prisma.$Disconnect?.() || await prisma.$disconnect();
  }
};

main();
