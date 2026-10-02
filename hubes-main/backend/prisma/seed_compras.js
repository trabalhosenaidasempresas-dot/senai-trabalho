// Script de seed para Fornecedores e Centros de Custo
// Execute com: node prisma/seed_compras.js

import prisma from '../src/config/database.js';

async function seedFornecedores() {
  console.log('🔄 Criando fornecedores...');

  const fornecedores = [
    {
      nome: 'Papelaria Premium LTDA',
      nomeFantasia: 'Papelaria Premium',
      cnpj: '12345678000195',
      email: 'contato@papelaria-premium.com.br',
      telefone: '(11) 3456-7890',
      whatsapp: '(11) 98765-4321',
      endereco: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310100',
      contato: 'João Silva',
      cargo: 'Gerente Comercial',
      ativo: true,
      status: 'Ativo',
      avaliacaoMedia: 4.5,
      totalCompras: 15,
      notas: 'Fornecedor confiável com entrega rápida',
    },
    {
      nome: 'Distribuidora de Materiais de Escritório S.A.',
      nomeFantasia: 'Distribuidora Mat. Escritório',
      cnpj: '98765432000187',
      email: 'vendas@distribuidor.com.br',
      telefone: '(11) 2345-6789',
      whatsapp: '(11) 97654-3210',
      endereco: 'Avenida Paulista',
      numero: '1000',
      complemento: 'Sala 500',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01311100',
      contato: 'Maria Santos',
      cargo: 'Diretora de Vendas',
      ativo: true,
      status: 'Ativo',
      avaliacaoMedia: 4.0,
      totalCompras: 23,
      notas: 'Oferece descontos para compras acima de 5 mil',
    },
    {
      nome: 'Informática e Tecnologia Brasil',
      nomeFantasia: 'Infotech Brasil',
      cnpj: '11223344000156',
      email: 'suporte@infotech.com.br',
      telefone: '(11) 4567-8901',
      whatsapp: '(11) 99876-5432',
      endereco: 'Rua da Tecnologia',
      numero: '456',
      bairro: 'Vila Mariana',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04010000',
      contato: 'Pedro Costa',
      cargo: 'Gerente de Contas',
      ativo: true,
      status: 'Ativo',
      avaliacaoMedia: 3.8,
      totalCompras: 8,
      notas: 'Fornecedor de equipamentos de informática',
    },
    {
      nome: 'Limpeza e Higiene Total LTDA',
      nomeFantasia: 'Limpeza Total',
      cnpj: '55667788000199',
      email: 'vendas@limpezatotal.com.br',
      telefone: '(11) 5678-9012',
      whatsapp: '(11) 91234-5678',
      endereco: 'Rua da Limpeza',
      numero: '789',
      bairro: 'Tatuapé',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '03088010',
      contato: 'Ana Paula',
      cargo: 'Representante de Vendas',
      ativo: true,
      status: 'Ativo',
      avaliacaoMedia: 4.2,
      totalCompras: 31,
      notas: 'Fornecedor regular de produtos de limpeza',
    },
    {
      nome: 'Alimentação e Catering Premium',
      nomeFantasia: 'Alimentação Premium',
      cnpj: '99887766000122',
      email: 'eventos@alimentacao.com.br',
      telefone: '(11) 6789-0123',
      whatsapp: '(11) 92345-6789',
      endereco: 'Avenida Brasil',
      numero: '2000',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310100',
      contato: 'Roberto Oliveira',
      cargo: 'Gerente de Eventos',
      ativo: true,
      status: 'Ativo',
      avaliacaoMedia: 4.7,
      totalCompras: 12,
      notas: 'Qualidade premium, excelente para eventos',
    },
  ];

  for (const fornecedor of fornecedores) {
    const existe = await prisma.fornecedor.findUnique({
      where: { cnpj: fornecedor.cnpj },
    });

    if (!existe) {
      await prisma.fornecedor.create({
        data: fornecedor,
      });
      console.log(`✅ Fornecedor criado: ${fornecedor.nome}`);
    } else {
      console.log(`⏭️  Fornecedor já existe: ${fornecedor.nome}`);
    }
  }
}

async function seedCentrosCusto() {
  console.log('🔄 Criando centros de custo...');

  const centros = [
    {
      codigo: 'ADM',
      nome: 'Administrativo',
      descricao: 'Centro de custo para despesas administrativas gerais',
      departamento: 'Administração',
      responsavel: 'Gerente Administrativo',
      orcamento: 50000.0,
      utilizado: 12500.0,
      ativo: true,
    },
    {
      codigo: 'TI',
      nome: 'Tecnologia da Informação',
      descricao: 'Centro de custo para despesas de TI e infraestrutura',
      departamento: 'TI',
      responsavel: 'Gerente de TI',
      orcamento: 100000.0,
      utilizado: 45000.0,
      ativo: true,
    },
    {
      codigo: 'RH',
      nome: 'Recursos Humanos',
      descricao: 'Centro de custo para despesas de RH e treinamento',
      departamento: 'RH',
      responsavel: 'Gerente de Recursos Humanos',
      orcamento: 75000.0,
      utilizado: 28000.0,
      ativo: true,
    },
    {
      codigo: 'MKT',
      nome: 'Marketing',
      descricao: 'Centro de custo para despesas de marketing e publicidade',
      departamento: 'Marketing',
      responsavel: 'Gerente de Marketing',
      orcamento: 60000.0,
      utilizado: 35000.0,
      ativo: true,
    },
    {
      codigo: 'OPS',
      nome: 'Operações',
      descricao: 'Centro de custo para despesas operacionais',
      departamento: 'Operações',
      responsavel: 'Diretor de Operações',
      orcamento: 150000.0,
      utilizado: 92000.0,
      ativo: true,
    },
    {
      codigo: 'MANUTENCAO',
      nome: 'Manutenção e Infraestrutura',
      descricao: 'Centro de custo para manutenção de prédio e equipamentos',
      departamento: 'Facilities',
      responsavel: 'Chefe de Facilities',
      orcamento: 40000.0,
      utilizado: 15000.0,
      ativo: true,
    },
    {
      codigo: 'CAPACITACAO',
      nome: 'Capacitação e Desenvolvimento',
      descricao: 'Centro de custo para cursos e desenvolvimento de pessoal',
      departamento: 'RH',
      responsavel: 'Coordenador de Treinamento',
      orcamento: 30000.0,
      utilizado: 8000.0,
      ativo: true,
    },
    {
      codigo: 'VIAGEM',
      nome: 'Viagens e Deslocamentos',
      descricao: 'Centro de custo para despesas com viagens e deslocamentos',
      departamento: 'Geral',
      responsavel: 'Assistente de Viagens',
      orcamento: 50000.0,
      utilizado: 22000.0,
      ativo: true,
    },
  ];

  for (const centro of centros) {
    const existe = await prisma.centroCusto.findUnique({
      where: { codigo: centro.codigo },
    });

    if (!existe) {
      await prisma.centroCusto.create({
        data: centro,
      });
      console.log(`✅ Centro de custo criado: ${centro.nome}`);
    } else {
      console.log(`⏭️  Centro de custo já existe: ${centro.nome}`);
    }
  }
}

async function main() {
  console.log('📦 Iniciando seed de dados do módulo Compras...\n');

  try {
    await seedFornecedores();
    console.log();
    await seedCentrosCusto();

    console.log('\n✅ Seed do módulo Compras concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
