/**
 * Script de Seed para popular o banco de dados
 * 
 * ⚠️ ATENÇÃO: Este script é apenas para DESENVOLVIMENTO e DEMONSTRAÇÃO.
 * Não usar em ambiente de produção.
 * 
 * Cria dados iniciais para demonstração e apresentação acadêmica:
 * - 1 Admin + 3 Técnicos
 * - 10 Clientes com endereços fictícios
 * - 20 Ordens de Serviço (5 CONCLUIDO, 5 EM_ANDAMENTO, 10 PENDENTE)
 * 
 * NOTA: As senhas são armazenadas em texto simples para fins de demonstração,
 * seguindo o padrão atual do servidor (server.js). Em produção, usar bcrypt.
 * 
 * Uso: npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Limpar dados existentes (na ordem correta para respeitar foreign keys)
  console.log('🗑️  Limpando dados existentes...');
  await prisma.maintenanceReminder.deleteMany();
  await prisma.servicePhoto.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Dados limpos com sucesso!\n');

  // Criar usuários (1 Admin + 3 Técnicos)
  console.log('👥 Criando usuários...');
  const admin = await prisma.user.create({
    data: {
      nome: 'Administrador Geral',
      email: 'admin@fieldservice.com',
      senha: 'admin123',
      tipo: 'ADMIN',
    },
  });
  console.log(`   ✅ Admin criado: ${admin.nome} (${admin.email})`);

  const tecnicos = await Promise.all([
    prisma.user.create({
      data: {
        nome: 'Carlos Silva',
        email: 'carlos.silva@fieldservice.com',
        senha: 'tecnico123',
        tipo: 'TECNICO',
      },
    }),
    prisma.user.create({
      data: {
        nome: 'Maria Santos',
        email: 'maria.santos@fieldservice.com',
        senha: 'tecnico123',
        tipo: 'TECNICO',
      },
    }),
    prisma.user.create({
      data: {
        nome: 'João Oliveira',
        email: 'joao.oliveira@fieldservice.com',
        senha: 'tecnico123',
        tipo: 'TECNICO',
      },
    }),
  ]);
  tecnicos.forEach((tecnico) => {
    console.log(`   ✅ Técnico criado: ${tecnico.nome} (${tecnico.email})`);
  });
  console.log('');

  // Criar 10 clientes com endereços fictícios (localizações reais de São Paulo)
  console.log('🏢 Criando clientes...');
  const clientesData = [
    { nome: 'Empresa Alpha Ltda', endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP', latitude: -23.5629, longitude: -46.6544, telefone: '(11) 3333-1001' },
    { nome: 'Comércio Beta ME', endereco: 'Rua Augusta, 500 - Consolação, São Paulo - SP', latitude: -23.5538, longitude: -46.6566, telefone: '(11) 3333-1002' },
    { nome: 'Indústria Gamma S.A.', endereco: 'Av. Brigadeiro Faria Lima, 2000 - Itaim Bibi, São Paulo - SP', latitude: -23.5771, longitude: -46.6859, telefone: '(11) 3333-1003' },
    { nome: 'Loja Delta EIRELI', endereco: 'Rua Oscar Freire, 700 - Jardins, São Paulo - SP', latitude: -23.5645, longitude: -46.6702, telefone: '(11) 3333-1004' },
    { nome: 'Restaurante Epsilon', endereco: 'Rua Haddock Lobo, 350 - Cerqueira César, São Paulo - SP', latitude: -23.5582, longitude: -46.6647, telefone: '(11) 3333-1005' },
    { nome: 'Clínica Zeta Saúde', endereco: 'Av. Brasil, 1500 - Jardim Paulista, São Paulo - SP', latitude: -23.5623, longitude: -46.6676, telefone: '(11) 3333-1006' },
    { nome: 'Escritório Eta Advocacia', endereco: 'Rua da Consolação, 2300 - Consolação, São Paulo - SP', latitude: -23.5521, longitude: -46.6580, telefone: '(11) 3333-1007' },
    { nome: 'Mercado Theta Express', endereco: 'Av. Rebouças, 800 - Pinheiros, São Paulo - SP', latitude: -23.5667, longitude: -46.6777, telefone: '(11) 3333-1008' },
    { nome: 'Academia Iota Fitness', endereco: 'Rua dos Pinheiros, 1200 - Pinheiros, São Paulo - SP', latitude: -23.5673, longitude: -46.6849, telefone: '(11) 3333-1009' },
    { nome: 'Padaria Kappa Premium', endereco: 'Av. Cidade Jardim, 400 - Itaim Bibi, São Paulo - SP', latitude: -23.5822, longitude: -46.6765, telefone: '(11) 3333-1010' },
  ];

  const clientes = await Promise.all(
    clientesData.map((cliente) => prisma.client.create({ data: cliente }))
  );
  clientes.forEach((cliente) => {
    console.log(`   ✅ Cliente criado: ${cliente.nome}`);
  });
  console.log('');

  // Criar 20 Ordens de Serviço
  console.log('📋 Criando ordens de serviço...');
  
  const hoje = new Date();
  
  // Helper para criar datas relativas
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // 5 Ordens CONCLUIDO (datas passadas)
  const ordensConcluidas = [];
  for (let i = 0; i < 5; i++) {
    const dataAgendada = addDays(hoje, -(30 - i * 5));
    const dataInicio = addDays(dataAgendada, 0);
    const dataFim = addDays(dataAgendada, 1);
    
    const ordem = await prisma.serviceOrder.create({
      data: {
        tecnicoId: tecnicos[i % 3].id,
        clienteId: clientes[i].id,
        dataAgendada,
        status: 'CONCLUIDO',
        dataInicio,
        dataFim,
        relatorioTecnico: `Serviço concluído com sucesso. Manutenção preventiva realizada no cliente ${clientes[i].nome}.`,
      },
    });
    ordensConcluidas.push(ordem);
    console.log(`   ✅ OS Concluída #${i + 1}: Cliente ${clientes[i].nome}`);
  }

  // 5 Ordens EM_ANDAMENTO
  const ordensEmAndamento = [];
  for (let i = 0; i < 5; i++) {
    const dataAgendada = addDays(hoje, -2 + i);
    const dataInicio = addDays(hoje, -1);
    
    const ordem = await prisma.serviceOrder.create({
      data: {
        tecnicoId: tecnicos[i % 3].id,
        clienteId: clientes[5 + (i % 5)].id,
        dataAgendada,
        status: 'EM_ANDAMENTO',
        dataInicio,
        relatorioTecnico: null,
      },
    });
    ordensEmAndamento.push(ordem);
    console.log(`   ✅ OS Em Andamento #${i + 1}: Cliente ${clientes[5 + (i % 5)].nome}`);
  }

  // 10 Ordens PENDENTE (datas futuras)
  const ordensPendentes = [];
  for (let i = 0; i < 10; i++) {
    const dataAgendada = addDays(hoje, 3 + i * 2);
    
    const ordem = await prisma.serviceOrder.create({
      data: {
        tecnicoId: tecnicos[i % 3].id,
        clienteId: clientes[i % 10].id,
        dataAgendada,
        status: 'PENDENTE',
      },
    });
    ordensPendentes.push(ordem);
    console.log(`   ✅ OS Pendente #${i + 1}: Cliente ${clientes[i % 10].nome} - Agendada para ${dataAgendada.toLocaleDateString('pt-BR')}`);
  }

  console.log('\n📊 Resumo do Seed:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   👤 Usuários: 1 Admin + 3 Técnicos = 4 total`);
  console.log(`   🏢 Clientes: ${clientes.length}`);
  console.log(`   📋 Ordens de Serviço:`);
  console.log(`      ✅ Concluídas: ${ordensConcluidas.length}`);
  console.log(`      🔄 Em Andamento: ${ordensEmAndamento.length}`);
  console.log(`      ⏳ Pendentes: ${ordensPendentes.length}`);
  console.log(`      📝 Total: ${ordensConcluidas.length + ordensEmAndamento.length + ordensPendentes.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n🔐 Credenciais de Acesso (APENAS PARA DESENVOLVIMENTO):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   ⚠️  ATENÇÃO: Senhas em texto simples - não usar em produção!');
  console.log('');
  console.log('   Admin:');
  console.log('   📧 Email: admin@fieldservice.com');
  console.log('   🔑 Senha: admin123');
  console.log('');
  console.log('   Técnicos:');
  console.log('   📧 carlos.silva@fieldservice.com | 🔑 tecnico123');
  console.log('   📧 maria.santos@fieldservice.com | 🔑 tecnico123');
  console.log('   📧 joao.oliveira@fieldservice.com | 🔑 tecnico123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n✨ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
