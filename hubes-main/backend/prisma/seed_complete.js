import pkg from '@prisma/client';
import bcrypt from 'bcrypt';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed completo do banco de dados...\n');

  // ========================================
  // 1. USUÁRIOS
  // ========================================
  console.log('📝 Criando usuários...');
  
  const users = [];
  const userPasswords = {
    admin: 'admin123',
    gestor: 'gestor123',
    servidor: 'servidor123',
  };

  for (const [role, password] of Object.entries(userPasswords)) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.usuario.upsert({
      where: { email: `${role}@secult.com` },
      update: {},
      create: {
        nome: role.charAt(0).toUpperCase() + role.slice(1),
        email: `${role}@secult.com`,
        senha: hashedPassword,
        telefone: `(27) 3131-${2000 + Math.floor(Math.random() * 100)}`,
        setor: ['TI', 'Gestão', 'Administrativo'][Object.keys(userPasswords).indexOf(role)],
        perfil: role === 'admin' ? 'Administrador' : role === 'gestor' ? 'Gestor' : 'Servidor',
        status: 'Ativo',
        ativo: true,
      },
    });
    users.push(user);
    console.log(`  ✓ Usuário ${user.nome} criado`);
  }

  // ========================================
  // 2. PERMISSÕES
  // ========================================
  console.log('\n🔐 Criando permissões...');
  
  const modules = ['usuarios', 'documentos', 'compras', 'estoque', 'agenda', 'ocorrencias', 'comunicacao'];
  const actions = ['criar', 'ler', 'atualizar', 'deletar', 'aprovar'];

  for (const user of users) {
    for (const modulo of modules) {
      for (const acao of actions) {
        // Admin tem tudo
        if (user.perfil === 'Administrador') {
          await prisma.permissao.upsert({
            where: { usuarioId_modulo_acao: { usuarioId: user.id, modulo, acao } },
            update: { concedido: true },
            create: { usuarioId: user.id, modulo, acao, concedido: true },
          });
        } 
        // Gestor tem acesso limitado
        else if (user.perfil === 'Gestor') {
          const allowed = ['ler', 'criar', 'atualizar'].includes(acao);
          await prisma.permissao.upsert({
            where: { usuarioId_modulo_acao: { usuarioId: user.id, modulo, acao } },
            update: { concedido: allowed },
            create: { usuarioId: user.id, modulo, acao, concedido: allowed },
          });
        }
        // Servidor tem acesso mínimo
        else {
          const allowed = ['ler'].includes(acao);
          await prisma.permissao.upsert({
            where: { usuarioId_modulo_acao: { usuarioId: user.id, modulo, acao } },
            update: { concedido: allowed },
            create: { usuarioId: user.id, modulo, acao, concedido: allowed },
          });
        }
      }
    }
  }
  console.log(`  ✓ Permissões criadas para ${users.length} usuários`);

  // ========================================
  // 3. DOCUMENTOS
  // ========================================
  console.log('\n📄 Criando documentos...');
  
  const documentTypes = ['Contrato', 'Ofício', 'Edital', 'Memorando', 'PDF'];
  const documentCategories = ['Jurídico', 'Administrativo', 'Financeiro', 'RH', 'Operacional'];
  
  const docs = [];
  for (let i = 0; i < 5; i++) {
    const doc = await prisma.documento.create({
      data: {
        titulo: `Documento ${i + 1} - ${documentTypes[i % documentTypes.length]}`,
        tipo: documentTypes[i % documentTypes.length],
        categoria: documentCategories[i % documentCategories.length],
        descricao: `Descrição do documento ${i + 1} com informações relevantes`,
        responsavelId: users[0].id,
        data: new Date(2026, 6, i + 1),
        arquivo: `/uploads/documento_${i + 1}.pdf`,
        tamanhoArquivo: 1024 * (i + 1),
        numeroDocumento: `DOC-2026-${String(i + 1).padStart(4, '0')}`,
        status: 'Ativo',
        nivelAcesso: i % 2 === 0 ? 'Público' : 'Restrito',
        assinado: i % 3 === 0,
      },
    });
    docs.push(doc);
    console.log(`  ✓ Documento "${doc.titulo}" criado`);
  }

  // Criar versões e histórico de documentos
  for (const doc of docs) {
    await prisma.documentoVersao.create({
      data: {
        documentoId: doc.id,
        versao: 1,
        arquivo: `/uploads/documento_${doc.id}_v1.pdf`,
        mudancas: 'Versão inicial',
      },
    });

    await prisma.documentoHistorico.create({
      data: {
        documentoId: doc.id,
        acao: 'Criado',
        descricao: 'Documento criado no sistema',
        usuarioEmail: users[0].email,
      },
    });
  }

  // ========================================
  // 4. COMPRAS
  // ========================================
  console.log('\n🛒 Criando compras...');
  
  const suppliers = ['Fornecedor A', 'Fornecedor B', 'Fornecedor C', 'Fornecedor D'];
  const compras = [];
  
  for (let i = 0; i < 4; i++) {
    const compra = await prisma.compra.create({
      data: {
        numeroCompra: `COM-2026-${String(i + 1).padStart(4, '0')}`,
        solicitanteId: users[i % users.length].id,
        valor: 1000 * (i + 1),
        fornecedor: suppliers[i % suppliers.length],
        cnpj: `${String(i + 1).padStart(14, '0')}`,
        observacao: `Compra de materiais para o setor ${i + 1}`,
        status: ['Solicitação', 'Aprovação', 'Cotação', 'Compra'][i % 4],
        dataPrevisao: new Date(2026, 7, i + 1),
        dataEntrega: i >= 2 ? new Date(2026, 7, 15 + i) : null,
      },
    });
    compras.push(compra);
    console.log(`  ✓ Compra "${compra.numeroCompra}" criada`);

    // Criar itens da compra
    for (let j = 0; j < 3; j++) {
      await prisma.compraItem.create({
        data: {
          compraId: compra.id,
          descricao: `Item ${j + 1} da compra`,
          quantidade: 10 * (j + 1),
          valorUnitario: 100 * (j + 1),
          valorTotal: 100 * (j + 1) * 10 * (j + 1),
          especificacoes: `Especificação do item ${j + 1}`,
        },
      });
    }

    // Criar pagamento
    if (i >= 2) {
      await prisma.pagamento.create({
        data: {
          compraId: compra.id,
          valor: compra.valor,
          dataPagamento: new Date(2026, 7, 10 + i),
          metodoPagamento: ['Transferência', 'Cheque', 'Cartão'][i % 3],
          numero: `PAG-${String(i + 1).padStart(6, '0')}`,
          status: 'Aprovado',
        },
      });
    }
  }

  // ========================================
  // 5. ESTOQUE
  // ========================================
  console.log('\n📦 Criando produtos e movimentações de estoque...');
  
  const categories = ['Eletrônicos', 'Materiais', 'Equipamentos', 'Consumíveis', 'Informática'];
  const units = ['Un', 'Kg', 'L', 'M', 'M2', 'M3'];
  const produtos = [];
  
  for (let i = 0; i < 8; i++) {
    const produto = await prisma.produto.create({
      data: {
        nome: `Produto ${i + 1}`,
        codigo: `PROD-${String(i + 1).padStart(5, '0')}`,
        categoria: categories[i % categories.length],
        unidade: units[i % units.length],
        quantidade: Math.floor(Math.random() * 500),
        estoqueMinimo: 10,
        estoqueMaximo: 1000,
        localizacao: `Prateleira ${String.fromCharCode(65 + (i % 5))}-${i + 1}`,
        descricao: `Descrição do produto ${i + 1}`,
        preco: 10 * (i + 1),
        fornecedor: suppliers[i % suppliers.length],
        ativo: true,
      },
    });
    produtos.push(produto);
    console.log(`  ✓ Produto "${produto.nome}" criado`);

    // Criar movimentações
    await prisma.movimentacaoEstoque.create({
      data: {
        produtoId: produto.id,
        tipo: 'Entrada',
        quantidade: 100,
        motivo: 'Entrada inicial de estoque',
        referencia: `COM-2026-${String(i + 1).padStart(4, '0')}`,
      },
    });
  }

  // ========================================
  // 6. EVENTOS (AGENDA)
  // ========================================
  console.log('\n📅 Criando eventos de agenda...');
  
  const eventTypes = ['Reunião', 'Evento', 'Capacitação', 'Reserva'];
  const eventos = [];
  
  for (let i = 0; i < 5; i++) {
    const dataInicio = new Date(2026, 7, 15 + i, 9 + i);
    const dataFim = new Date(2026, 7, 15 + i, 11 + i);
    
    const evento = await prisma.evento.create({
      data: {
        titulo: `Evento ${i + 1} - ${eventTypes[i % eventTypes.length]}`,
        descricao: `Descrição do evento ${i + 1}`,
        responsavelId: users[i % users.length].id,
        dataInicio,
        dataFim,
        local: `Sala ${i + 1} - Prédio A`,
        tipo: eventTypes[i % eventTypes.length],
        status: 'Ativo',
        participantes: JSON.stringify({
          confirmados: users.length,
          convidados: users.map(u => u.email),
        }),
      },
    });
    eventos.push(evento);
    console.log(`  ✓ Evento "${evento.titulo}" criado`);
  }

  // ========================================
  // 7. OCORRÊNCIAS
  // ========================================
  console.log('\n⚠️  Criando ocorrências...');
  
  const priorities = ['Baixa', 'Média', 'Alta', 'Crítica'];
  const statuses = ['Aberto', 'Em andamento', 'Resolvido', 'Encerrado'];
  const ocorrencias = [];
  
  for (let i = 0; i < 6; i++) {
    const ocorrencia = await prisma.ocorrencia.create({
      data: {
        numeroOcorrencia: `OCO-2026-${String(i + 1).padStart(4, '0')}`,
        titulo: `Ocorrência ${i + 1}`,
        descricao: `Descrição detalhada da ocorrência ${i + 1}`,
        local: `Departamento ${i + 1}`,
        setor: documentCategories[i % documentCategories.length],
        responsavelId: users[i % users.length].id,
        prioridade: priorities[i % priorities.length],
        status: statuses[i % statuses.length],
        dataPrazo: new Date(2026, 8, i + 1),
        dataResolucao: i >= 2 ? new Date(2026, 7, 20 + i) : null,
      },
    });
    ocorrencias.push(ocorrencia);
    console.log(`  ✓ Ocorrência "${ocorrencia.numeroOcorrencia}" criada`);
  }

  // ========================================
  // 8. COMUNICAÇÃO
  // ========================================
  console.log('\n💬 Criando comunicados e mensagens...');
  
  const comunicadoTypes = ['Aviso', 'Comunicado', 'Notificação', 'Circular'];
  
  for (let i = 0; i < 4; i++) {
    const comunicado = await prisma.comunicado.create({
      data: {
        titulo: `Comunicado ${i + 1}`,
        conteudo: `Conteúdo do comunicado ${i + 1} com informações importantes para todos os usuários.`,
        autorId: users[i % users.length].id,
        tipo: comunicadoTypes[i % comunicadoTypes.length],
        status: 'Ativo',
        dataPublicacao: new Date(2026, 7, i + 1),
        dataVencimento: new Date(2026, 8, i + 1),
      },
    });
    console.log(`  ✓ Comunicado "${comunicado.titulo}" criado`);
  }

  // Criar mensagens entre usuários
  for (let i = 0; i < 3; i++) {
    const remetenteIdx = i % users.length;
    const destinatarioIdx = (i + 1) % users.length;
    
    await prisma.mensagem.create({
      data: {
        remetenteId: users[remetenteIdx].id,
        destinatarioId: users[destinatarioIdx].id,
        assunto: `Mensagem ${i + 1} - Assunto importante`,
        conteudo: `Conteúdo da mensagem ${i + 1} enviada de ${users[remetenteIdx].nome} para ${users[destinatarioIdx].nome}.`,
        lida: i === 0,
        dataLeitura: i === 0 ? new Date() : null,
        status: 'Enviada',
      },
    });
    console.log(`  ✓ Mensagem enviada de ${users[remetenteIdx].nome} para ${users[destinatarioIdx].nome}`);
  }

  // ========================================
  // 9. NOTIFICAÇÕES
  // ========================================
  console.log('\n🔔 Criando notificações...');
  
  for (let i = 0; i < 5; i++) {
    await prisma.notificacao.create({
      data: {
        usuarioId: users[i % users.length].id,
        titulo: `Notificação ${i + 1}`,
        mensagem: `Mensagem da notificação ${i + 1} com informação importante`,
        tipo: ['info', 'aviso', 'erro', 'sucesso', 'tarefa'][i % 5],
        referencia: compras[i % compras.length].id,
        moduloRef: 'compras',
        lida: i % 2 === 0,
        dataLeitura: i % 2 === 0 ? new Date() : null,
        acao: '/compras/' + compras[i % compras.length].id,
        prioridade: i % 2,
        expiraEm: new Date(2026, 8, i + 1),
      },
    });
  }
  console.log(`  ✓ ${5} notificações criadas`);

  // ========================================
  // 10. LOGS DO SISTEMA
  // ========================================
  console.log('\n📊 Criando logs do sistema...');
  
  const logActions = ['criar', 'ler', 'atualizar', 'deletar', 'fazer login'];
  const tables = ['usuarios', 'documentos', 'compras', 'produtos', 'eventos'];
  
  for (let i = 0; i < 10; i++) {
    await prisma.log.create({
      data: {
        usuarioId: users[i % users.length].id,
        acao: logActions[i % logActions.length],
        modulo: tables[i % tables.length],
        tabela: tables[i % tables.length],
        registroId: docs[i % docs.length].id,
        tipoOperacao: ['INSERT', 'UPDATE', 'DELETE', 'SELECT'][i % 4],
        endereco: `192.168.${i}.${i + 1}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: i % 3 === 0 ? 'erro' : 'sucesso',
        mensagem: i % 3 === 0 ? 'Erro ao processar' : 'Operação realizada com sucesso',
      },
    });
  }
  console.log(`  ✓ ${10} logs criados`);

  // ========================================
  // 11. AUDITORIA
  // ========================================
  console.log('\n📋 Criando registros de auditoria...');
  
  for (let i = 0; i < 5; i++) {
    await prisma.auditoriaRegistro.create({
      data: {
        tabela: tables[i % tables.length],
        registroId: docs[i % docs.length].id,
        tipoOperacao: ['INSERT', 'UPDATE', 'DELETE'][i % 3],
        dadosAntes: JSON.stringify({ versao: 'anterior' }),
        dadosDepois: JSON.stringify({ versao: 'atual' }),
        usuarioId: users[i % users.length].email,
        endereco: `192.168.${i}.${i + 1}`,
      },
    });
  }
  console.log(`  ✓ ${5} registros de auditoria criados`);

  // ========================================
  // 12. ASSINATURAS DIGITAIS
  // ========================================
  console.log('\n✍️  Criando assinaturas digitais...');
  
  for (let i = 0; i < 3; i++) {
    if (docs[i]) {
      await prisma.assinaturaDigital.create({
        data: {
          documentoId: docs[i].id,
          usuarioId: users[i % users.length].id,
          assinatura: `ASSINATURA_DIGITAL_${i + 1}`,
          certificado: `CERT-${String(i + 1).padStart(6, '0')}`,
          valido: true,
        },
      });
    }
  }
  console.log(`  ✓ Assinaturas digitais criadas`);

  // ========================================
  // 13. CONFIGURAÇÕES DO SISTEMA
  // ========================================
  console.log('\n⚙️  Criando configurações do sistema...');
  
  const configs = [
    { chave: 'APP_NAME', valor: 'SIGA Secult', tipo: 'texto', descricao: 'Nome da aplicação' },
    { chave: 'APP_VERSION', valor: '1.0.0', tipo: 'texto', descricao: 'Versão atual' },
    { chave: 'MAX_UPLOAD_SIZE', valor: '52428800', tipo: 'numero', descricao: 'Tamanho máximo de upload (bytes)' },
    { chave: 'MAINTENANCE_MODE', valor: 'false', tipo: 'booleano', descricao: 'Modo de manutenção' },
    { chave: 'NOTIFICATION_EMAIL', valor: 'noreply@secult.gov.br', tipo: 'texto', descricao: 'Email de notificações' },
  ];

  for (const config of configs) {
    await prisma.configuracaoSistema.upsert({
      where: { chave: config.chave },
      update: { valor: config.valor },
      create: config,
    });
  }
  console.log(`  ✓ ${configs.length} configurações do sistema criadas`);

  // ========================================
  // RESUMO FINAL
  // ========================================
  console.log('\n' + '='.repeat(60));
  console.log('✅ SEED COMPLETO CONCLUÍDO COM SUCESSO!');
  console.log('='.repeat(60));
  console.log(`
📊 Resumo do que foi criado:
  ✓ ${users.length} usuários com perfis (Admin, Gestor, Servidor)
  ✓ Permissões configuradas para cada usuário
  ✓ ${docs.length} documentos com versões e histórico
  ✓ ${compras.length} compras com itens e pagamentos
  ✓ ${produtos.length} produtos com movimentações de estoque
  ✓ ${eventos.length} eventos de agenda
  ✓ ${ocorrencias.length} ocorrências
  ✓ Comunicados e mensagens de sistema
  ✓ Notificações para usuários
  ✓ Logs de auditoria
  ✓ Assinaturas digitais
  ✓ Configurações do sistema

🔑 Credenciais de teste:
  Admin:    admin@secult.com / admin123
  Gestor:   gestor@secult.com / gestor123
  Servidor: servidor@secult.com / servidor123

📍 Acesse: http://localhost:3001
  `);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
