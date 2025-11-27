const fastify = require('fastify');
const cors = require('@fastify/cors');
const rateLimit = require('@fastify/rate-limit');
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { gerarRelatorio } = require('./src/services/relatorioService');
const { authMiddleware } = require('./src/middleware/authMiddleware');

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Fastify with logging
// Configure ajvOptions to allow 'example' keyword for Swagger documentation
const app = fastify({
  logger: true,
  ajv: {
    customOptions: {
      keywords: ['example'],
    },
  },
});

// JWT Secret - Must be set via environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set. Using default secret. This is insecure for production!');
}

// Register Swagger for API documentation
app.register(swagger, {
  openapi: {
    info: {
      title: 'Sistema de Gestão de Equipes Externas',
      description: 'API para gerenciamento de ordens de serviço, técnicos e clientes (Field Service Management System)',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticação de usuários' },
      { name: 'Orders', description: 'Gerenciamento de ordens de serviço' },
      { name: 'Health', description: 'Verificação de saúde da API' },
    ],
  },
});

// Register Swagger UI
app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: true,
});

// Register CORS plugin
// WARNING: origin: true allows all origins. In production, configure specific trusted domains.
app.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
});

// Register rate limiting plugin
// Limits requests per IP to prevent abuse
app.register(rateLimit, {
  max: 100, // Maximum 100 requests per window
  timeWindow: '1 minute', // Per minute
  errorResponseBuilder: (request, context) => ({
    error: 'Too Many Requests',
    message: `Limite de requisições excedido. Tente novamente em ${Math.ceil(context.ttl / 1000)} segundos.`,
    statusCode: 429,
  }),
});

// Register routes plugin to ensure routes are collected by Swagger
app.register(async function routes(fastifyInstance) {
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
  fastifyInstance.get('/health', {
  schema: {
    tags: ['Health'],
    summary: 'Verificar saúde da API',
    description: 'Retorna o status da API e timestamp atual',
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          timestamp: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00.000Z' },
        },
      },
    },
  },
}, async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// GET /orders - List all service orders (protected route - requires authentication)
fastifyInstance.get('/orders', {
  preHandler: authMiddleware,
  schema: {
    tags: ['Orders'],
    summary: 'Listar todas as ordens de serviço',
    description: 'Retorna todas as ordens de serviço com informações do técnico, cliente e fotos',
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 10 },
          serviceOrders: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                dataAgendada: { type: 'string', format: 'date-time' },
                status: { type: 'string', enum: ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'] },
                dataInicio: { type: 'string', format: 'date-time', nullable: true },
                dataFim: { type: 'string', format: 'date-time', nullable: true },
                tecnico: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    nome: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                  },
                },
                cliente: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    nome: { type: 'string' },
                    endereco: { type: 'string' },
                    telefone: { type: 'string' },
                  },
                },
                photos: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      url: { type: 'string' },
                      tipo: { type: 'string', enum: ['ANTES', 'DEPOIS'] },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
          message: { type: 'string', example: 'Token de autenticação inválido ou ausente' },
        },
      },
      500: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Internal Server Error' },
          message: { type: 'string', example: 'Erro ao buscar ordens de serviço' },
        },
      },
    },
  },
}, async (request, reply) => {
  try {
    const serviceOrders = await prisma.serviceOrder.findMany({
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
      orderBy: {
        dataAgendada: 'desc',
      },
    });

    return reply.send({
      total: serviceOrders.length,
      serviceOrders,
    });
  } catch (error) {
    fastifyInstance.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Erro ao buscar ordens de serviço',
    });
  }
});

// POST /orders - For Admin to create a new Service Order linked to a technician and client
fastifyInstance.post('/orders', {
  schema: {
    tags: ['Orders'],
    summary: 'Criar nova ordem de serviço',
    description: 'Cria uma nova ordem de serviço. Apenas administradores podem criar ordens.',
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      required: ['tecnicoId', 'clienteId', 'dataAgendada'],
      properties: {
        tecnicoId: { type: 'string', format: 'uuid', description: 'ID do técnico responsável' },
        clienteId: { type: 'string', format: 'uuid', description: 'ID do cliente' },
        dataAgendada: { type: 'string', format: 'date-time', description: 'Data agendada para o serviço', example: '2024-12-01T10:00:00.000Z' },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Ordem de serviço criada com sucesso' },
          serviceOrder: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              dataAgendada: { type: 'string', format: 'date-time' },
              status: { type: 'string', enum: ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'] },
              tecnico: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  nome: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
              },
              cliente: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  nome: { type: 'string' },
                  endereco: { type: 'string' },
                  telefone: { type: 'string' },
                },
              },
            },
          },
        },
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
          message: { type: 'string', example: 'tecnicoId, clienteId e dataAgendada são obrigatórios' },
        },
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
          message: { type: 'string', example: 'Token de autenticação inválido ou ausente' },
        },
      },
      403: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Forbidden' },
          message: { type: 'string', example: 'Apenas administradores podem criar ordens de serviço' },
        },
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Not Found' },
          message: { type: 'string', example: 'Técnico não encontrado' },
        },
      },
      500: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Internal Server Error' },
          message: { type: 'string', example: 'Erro ao criar ordem de serviço' },
        },
      },
    },
  },
}, async (request, reply) => {
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
    fastifyInstance.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Erro ao criar ordem de serviço',
    });
  }
});

// GET /orders/tech/:id - List Service Orders for a specific technician
fastifyInstance.get('/orders/tech/:id', {
  schema: {
    tags: ['Orders'],
    summary: 'Listar ordens de serviço por técnico',
    description: 'Retorna todas as ordens de serviço de um técnico específico',
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid', description: 'ID do técnico' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          tecnico: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              nome: { type: 'string' },
            },
          },
          serviceOrders: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                dataAgendada: { type: 'string', format: 'date-time' },
                status: { type: 'string', enum: ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'] },
                dataInicio: { type: 'string', format: 'date-time', nullable: true },
                dataFim: { type: 'string', format: 'date-time', nullable: true },
                cliente: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    nome: { type: 'string' },
                    endereco: { type: 'string' },
                    telefone: { type: 'string' },
                  },
                },
                photos: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      url: { type: 'string' },
                      tipo: { type: 'string', enum: ['ANTES', 'DEPOIS'] },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
          message: { type: 'string', example: 'Token de autenticação inválido ou ausente' },
        },
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Not Found' },
          message: { type: 'string', example: 'Técnico não encontrado' },
        },
      },
      500: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Internal Server Error' },
          message: { type: 'string', example: 'Erro ao buscar ordens de serviço' },
        },
      },
    },
  },
}, async (request, reply) => {
  // Verify authentication
  const user = verifyToken(request);
  if (!user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Token de autenticação inválido ou ausente',
    });
  }

  const { id } = request.params;

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
    fastifyInstance.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Erro ao buscar ordens de serviço',
    });
  }
});

// PATCH /orders/:id/status - Update the status and save current timestamp
fastifyInstance.patch('/orders/:id/status', {
  schema: {
    tags: ['Orders'],
    summary: 'Atualizar status da ordem de serviço',
    description: 'Atualiza o status de uma ordem de serviço. Automaticamente define dataInicio quando muda para EM_ANDAMENTO e dataFim quando muda para CONCLUIDO.',
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid', description: 'ID da ordem de serviço' },
      },
    },
    body: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'],
          description: 'Novo status da ordem de serviço',
          example: 'EM_ANDAMENTO',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Status atualizado com sucesso' },
          serviceOrder: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              dataAgendada: { type: 'string', format: 'date-time' },
              status: { type: 'string', enum: ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'] },
              dataInicio: { type: 'string', format: 'date-time', nullable: true },
              dataFim: { type: 'string', format: 'date-time', nullable: true },
              tecnico: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  nome: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
              },
              cliente: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  nome: { type: 'string' },
                  endereco: { type: 'string' },
                  telefone: { type: 'string' },
                },
              },
              photos: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    url: { type: 'string' },
                    tipo: { type: 'string', enum: ['ANTES', 'DEPOIS'] },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
          message: { type: 'string', example: 'Status é obrigatório' },
        },
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
          message: { type: 'string', example: 'Token de autenticação inválido ou ausente' },
        },
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Not Found' },
          message: { type: 'string', example: 'Ordem de serviço não encontrada' },
        },
      },
      500: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Internal Server Error' },
          message: { type: 'string', example: 'Erro ao atualizar status da ordem de serviço' },
        },
      },
    },
  },
}, async (request, reply) => {
  // Verify authentication
  const user = verifyToken(request);
  if (!user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Token de autenticação inválido ou ausente',
    });
  }

  const { id } = request.params;
  const { status } = request.body || {};

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
    fastifyInstance.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Erro ao atualizar status da ordem de serviço',
    });
  }
});

// POST /login route
fastifyInstance.post('/login', {
  schema: {
    tags: ['Auth'],
    summary: 'Login de usuário',
    description: 'Autentica um usuário e retorna um token JWT',
    body: {
      type: 'object',
      required: ['email', 'senha'],
      properties: {
        email: { type: 'string', format: 'email', description: 'Email do usuário', example: 'admin@example.com' },
        senha: { type: 'string', description: 'Senha do usuário', example: 'senha123' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Login realizado com sucesso' },
          token: { type: 'string', description: 'Token JWT para autenticação' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              nome: { type: 'string' },
              email: { type: 'string', format: 'email' },
              tipo: { type: 'string', enum: ['ADMIN', 'TECNICO'] },
            },
          },
        },
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
          message: { type: 'string', example: 'Email e senha são obrigatórios' },
        },
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
          message: { type: 'string', example: 'Credenciais inválidas' },
        },
      },
      500: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Internal Server Error' },
          message: { type: 'string', example: 'Erro ao processar login' },
        },
      },
    },
  },
}, async (request, reply) => {
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
    fastifyInstance.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Erro ao processar login',
    });
  }
});

  // GET /orders/:id/relatorio - Generate and download Technical Report PDF
  fastifyInstance.get('/orders/:id/relatorio', {
    schema: {
      tags: ['Orders'],
      summary: 'Gerar relatório técnico em PDF',
      description: 'Gera e baixa o relatório técnico de uma ordem de serviço em formato PDF',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid', description: 'ID da ordem de serviço' },
        },
      },
      response: {
        200: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF do relatório técnico',
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Unauthorized' },
            message: { type: 'string', example: 'Token de autenticação inválido ou ausente' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Not Found' },
            message: { type: 'string', example: 'Ordem de serviço não encontrada' },
          },
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Internal Server Error' },
            message: { type: 'string', example: 'Erro ao gerar relatório técnico' },
          },
        },
      },
    },
  }, async (request, reply) => {
    // Verify authentication
    const user = verifyToken(request);
    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Token de autenticação inválido ou ausente',
      });
    }

    const { id } = request.params;

    try {
      // Generate the PDF report
      const pdfBuffer = await gerarRelatorio(id, prisma);

      // Set response headers for PDF download
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="relatorio-os-${id}.pdf"`);
      reply.header('Content-Length', pdfBuffer.length);

      return reply.send(pdfBuffer);
    } catch (error) {
      fastifyInstance.log.error(error);
      
      if (error.message === 'Ordem de serviço não encontrada') {
        return reply.status(404).send({
          error: 'Not Found',
          message: error.message,
        });
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Erro ao gerar relatório técnico',
      });
    }
  });

}); // End of routes plugin

/**
 * Gera um lembrete de manutenção preventiva quando uma Ordem de Serviço é concluída.
 * Calcula a data atual + 180 dias e cria um registro no banco de dados sugerindo
 * uma nova visita preventiva para o cliente.
 *
 * @param {Object} serviceOrder - A ordem de serviço concluída
 * @param {string} serviceOrder.id - ID da ordem de serviço
 * @param {string} serviceOrder.clienteId - ID do cliente
 * @param {string} serviceOrder.status - Status da ordem de serviço (deve ser CONCLUIDO)
 * @returns {Promise<Object|null>} O lembrete de manutenção criado ou null se a OS não estiver concluída
 */
async function gerarLembreteManutencao(serviceOrder) {
  // Verifica se a ordem de serviço está concluída
  if (serviceOrder.status !== 'CONCLUIDO') {
    app.log.info(`Ordem de serviço ${serviceOrder.id} não está concluída. Lembrete não gerado.`);
    return null;
  }

  // Calcula a data sugerida para a próxima visita (hoje + 180 dias)
  const dataAtual = new Date();
  const diasParaProximaVisita = 180;
  const milissegundosPorDia = 24 * 60 * 60 * 1000;
  const dataSugerida = new Date(dataAtual.getTime() + (diasParaProximaVisita * milissegundosPorDia));

  try {
    // Busca informações do cliente para personalizar a mensagem
    const cliente = await prisma.client.findUnique({
      where: { id: serviceOrder.clienteId },
    });

    const nomeCliente = cliente ? cliente.nome : 'Cliente';
    const mensagem = `Visita preventiva sugerida para ${nomeCliente}. Baseada na conclusão da OS ${serviceOrder.id}.`;

    // Cria o registro de lembrete de manutenção no banco de dados
    const lembrete = await prisma.maintenanceReminder.create({
      data: {
        dataSugerida,
        mensagem,
        clienteId: serviceOrder.clienteId,
        serviceOrderId: serviceOrder.id,
      },
    });

    app.log.info(`Lembrete de manutenção criado para o cliente ${serviceOrder.clienteId}. Data sugerida: ${dataSugerida.toISOString()}`);

    return lembrete;
  } catch (error) {
    app.log.error(`Erro ao gerar lembrete de manutenção: ${error.message}`);
    throw error;
  }
}

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

// Exporta componentes para uso em outros módulos ou testes
// NOTA: Esta exportação é usada apenas para testes e não afeta a funcionalidade do servidor
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gerarLembreteManutencao, app, prisma };
}
