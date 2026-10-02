import prisma from '../src/config/database.js';

(async () => {
  try {
    const counts = {};
    counts.produtos = await prisma.produto.count();
    counts.compras = await prisma.compra.count();
    counts.ocorrencias = await prisma.ocorrencia.count();
    counts.comunicados = await prisma.comunicado.count();
    counts.eventos = await prisma.evento.count();
    counts.usuarios = await prisma.usuario.count();

    console.log('Counts:', counts);

    const lastProduto = await prisma.produto.findFirst({ orderBy: { createdAt: 'desc' } });
    const lastCompra = await prisma.compra.findFirst({ orderBy: { createdAt: 'desc' }, include: { itens: true } });
    const lastOcorrencia = await prisma.ocorrencia.findFirst({ orderBy: { createdAt: 'desc' } });
    const lastComunicado = await prisma.comunicado.findFirst({ orderBy: { createdAt: 'desc' } });
    const lastEvento = await prisma.evento.findFirst({ orderBy: { createdAt: 'desc' } });
    const lastUsuario = await prisma.usuario.findFirst({ orderBy: { createdAt: 'desc' } });

    console.log('Last produto:', lastProduto);
    console.log('Last compra:', lastCompra);
    console.log('Last ocorrencia:', lastOcorrencia);
    console.log('Last comunicado:', lastComunicado);
    console.log('Last evento:', lastEvento);
    console.log('Last usuario:', { id: lastUsuario?.id, email: lastUsuario?.email, nome: lastUsuario?.nome });
  } catch (err) {
    console.error('Error checking persistence:', err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
