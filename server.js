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

// Health check route
app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
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
