const { PrismaClient } = require('@prisma/client');

// Singleton Prisma client instance for the audit log service
let prismaInstance = null;

/**
 * Sets the Prisma client instance for the audit log service.
 * This allows dependency injection for testing and shared client usage.
 * 
 * @param {PrismaClient} prisma - The Prisma client instance
 */
function setPrismaInstance(prisma) {
  prismaInstance = prisma;
}

/**
 * Gets the Prisma client instance.
 * Creates a new instance if not already set.
 * 
 * @returns {PrismaClient} - The Prisma client instance
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
 * @returns {Promise<Object>} - O registro de auditoria criado
 */
async function logAction(userId, action, details) {
  const prisma = getPrismaInstance();
  
  const auditLog = await prisma.auditLog.create({
    data: {
      userId,
      action,
      details,
    },
  });
  
  return auditLog;
}

module.exports = { logAction, setPrismaInstance, getPrismaInstance };
