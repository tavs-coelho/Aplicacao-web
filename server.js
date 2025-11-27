const fastify = require('fastify');
const cors = require('@fastify/cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Fastify with logging
const app = fastify({ logger: true });

// JWT Secret - Must be set via environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set. Using default secret. This is insecure for production!');
}

// Register CORS plugin
// WARNING: origin: true allows all origins. In production, configure specific trusted domains.
app.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
});

// Helper function to verify JWT token and extract user info
const verifyToken = (request) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// Health check route
app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// POST /orders - For Admin to create a new Service Order linked to a technician and client
app.post('/orders', async (request, reply) => {
  // Verify authentication
  const user = verifyToken(request);
  if (!user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Token de autenticação inválido ou ausente',
    });
  }

  // Only ADMIN can create orders
  if (user.tipo !== 'ADMIN') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Apenas administradores podem criar ordens de serviço',
    });
  }

  const { tecnicoId, clienteId, dataAgendada } = request.body || {};

  // Validate required fields
  if (!tecnicoId || !clienteId || !dataAgendada) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'tecnicoId, clienteId e dataAgendada são obrigatórios',
    });
  }

  try {
    // Verify the technician exists and is of type TECNICO
    const tecnico = await prisma.user.findUnique({
      where: { id: tecnicoId },
    });

    if (!tecnico) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Técnico não encontrado',
      });
    }

    if (tecnico.tipo !== 'TECNICO') {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'O usuário especificado não é um técnico',
      });
    }

    // Verify the client exists
    const cliente = await prisma.client.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Cliente não encontrado',
      });
    }

    // Create the service order
    const serviceOrder = await prisma.serviceOrder.create({
      data: {
        tecnicoId,
        clienteId,
        dataAgendada: new Date(dataAgendada),
        status: 'PENDENTE',
      },
      include: {
        tecnico: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        cliente: true,
      },
    });

    return reply.status(201).send({
      message: 'Ordem de serviço criada com sucesso',
      serviceOrder,
    });
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Erro ao criar ordem de serviço',
    });
  }
});

// GET /orders/tech/:id - List Service Orders for a specific technician
app.get('/orders/tech/:id', async (request, reply) => {
  const { id } = request.params;

  if (!id) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'ID do técnico é obrigatório',
    });
  }

  try {
    // Verify the technician exists
    const tecnico = await prisma.user.findUnique({
      where: { id },
    });

    if (!tecnico) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Técnico não encontrado',
      });
    }

    // Get all service orders for this technician
    const serviceOrders = await prisma.serviceOrder.findMany({
      where: { tecnicoId: id },
      include: {
        cliente: true,
        photos: true,
      },
      orderBy: {
        dataAgendada: 'asc',
      },
    });

    return reply.send({
      tecnico: {
        id: tecnico.id,
        nome: tecnico.nome,
      },
      serviceOrders,
    });
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Erro ao buscar ordens de serviço',
    });
  }
});

// PATCH /orders/:id/status - Update the status and save current timestamp
app.patch('/orders/:id/status', async (request, reply) => {
  const { id } = request.params;
  const { status } = request.body || {};

  if (!id) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'ID da ordem de serviço é obrigatório',
    });
  }

  if (!status) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Status é obrigatório',
    });
  }

  // Validate status value
  const validStatuses = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'];
  if (!validStatuses.includes(status)) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`,
    });
  }

  try {
    // Find the existing service order
    const existingOrder = await prisma.serviceOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Ordem de serviço não encontrada',
      });
    }

    // Prepare update data
    const updateData = { status };
    const now = new Date();

    // Set dataInicio when changing to EM_ANDAMENTO
    if (status === 'EM_ANDAMENTO' && !existingOrder.dataInicio) {
      updateData.dataInicio = now;
    }

    // Set dataFim when changing to CONCLUIDO
    if (status === 'CONCLUIDO' && !existingOrder.dataFim) {
      updateData.dataFim = now;
    }

    // Update the service order
    const serviceOrder = await prisma.serviceOrder.update({
      where: { id },
      data: updateData,
      include: {
        tecnico: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        cliente: true,
        photos: true,
      },
    });

    return reply.send({
      message: 'Status atualizado com sucesso',
      serviceOrder,
    });
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Erro ao atualizar status da ordem de serviço',
    });
  }
});

// POST /login route
app.post('/login', async (request, reply) => {
  const { email, senha } = request.body || {};

  // Validate input
  if (!email || !senha) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Email e senha são obrigatórios',
    });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Credenciais inválidas',
      });
    }

    // WARNING: In production, use bcrypt.compare() with hashed passwords.
    // Example: const isValid = await bcrypt.compare(senha, user.senha);
    // For this basic implementation, doing simple comparison.
    if (user.senha !== senha) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Credenciais inválidas',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        tipo: user.tipo,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return reply.send({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
    });
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Erro ao processar login',
    });
  }
});

// Graceful shutdown
const gracefulShutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';
    await app.listen({ port: Number(port), host });
    app.log.info(`Server running at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
