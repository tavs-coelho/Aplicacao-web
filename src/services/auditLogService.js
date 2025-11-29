const { PrismaClient } = require('@prisma/client');

// Instância singleton do Prisma client para o serviço de log de auditoria
let prismaInstance = null;

/**
 * Define a instância do Prisma client para o serviço de log de auditoria.
 * Permite injeção de dependência para testes e uso compartilhado do client.
 * 
 * @param {PrismaClient} prisma - A instância do Prisma client
 */
function setPrismaInstance(prisma) {
  prismaInstance = prisma;
}

/**
 * Obtém a instância do Prisma client.
 * Cria uma nova instância se ainda não estiver definida.
 * 
 * @returns {PrismaClient} - A instância do Prisma client
 */
function getPrismaInstance() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

/**
 * Registra uma ação no log de auditoria.
 * 
 * @param {string} userId - ID do usuário que realizou a ação
 * @param {string} action - Tipo da ação (ex: 'DELETE_ORDER', 'LOGIN')
 * @param {Object} details - Detalhes da ação (dados antigos/novos)
 * @param {Object} [tx] - Cliente de transação opcional para operações atômicas
 * @returns {Promise<Object>} - O registro de auditoria criado
 */
async function logAction(userId, action, details, tx = null) {
  const client = tx || getPrismaInstance();
  
  const auditLog = await client.auditLog.create({
    data: {
      userId,
      action,
      details,
    },
  });
  
  return auditLog;
}

module.exports = { logAction, setPrismaInstance, getPrismaInstance };
