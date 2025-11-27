const jwt = require('jsonwebtoken');

// JWT Secret - Must be set via environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui';

/**
 * Middleware de autenticação para rotas Fastify.
 * Verifica se o Header da requisição possui um token Bearer válido.
 * Se o token for inválido ou ausente, retorna erro 401.
 *
 * @param {Object} request - Objeto de requisição Fastify
 * @param {Object} reply - Objeto de resposta Fastify
 * @returns {Promise<void>} - Retorna erro 401 se não autenticado
 */
async function authMiddleware(request, reply) {
  const authHeader = request.headers.authorization;

  // Verifica se o header Authorization existe e possui o formato Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Token de autenticação ausente ou formato inválido. Use: Bearer <token>',
    });
  }

  // Extrai o token do header (remove 'Bearer ')
  const token = authHeader.substring(7);

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Anexa as informações do usuário ao request para uso nas rotas
    request.user = decoded;
  } catch (error) {
    // Token inválido ou expirado
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Token de autenticação inválido ou expirado',
    });
  }
}

module.exports = { authMiddleware };
