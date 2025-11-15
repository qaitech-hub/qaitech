const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Получает действие по ID.
 * @param {string} actionId - ID действия.
 * @returns {Promise<Object>} - Найденное действие.
 */
const getActionById = async (actionId) => {
  try {
    const action = await prisma.action.findUnique({
      where: {
        id: actionId,
      },
    });
    return action;
  } catch (error) {
    console.error("Error fetching action:", error);
    throw error;
  }
};

/**
 * Получает все действия.
 * @returns {Promise<Array>} - Список действий.
 */
const getAllActions = async () => {
  try {
    const actions = await prisma.WebElementActions.findMany();
    return actions;
  } catch (error) {
    console.error("Error fetching actions:", error);
    throw error;
  }
};

module.exports = {
  getActionById,
  getAllActions,
};
