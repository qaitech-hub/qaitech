const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Создает новый шаг.
 * @param {string} value - Описание шага.
 * @param {string} testId - ID теста, к которому привязан шаг.
 * @param {string} webElementId - ID веб-элемента, с которым связан шаг.
 * @param {string} actionId - ID действия, которое выполняется на шаге.
 * @param {Object} prismaInstance - Экземпляр Prisma (для транзакций).
 * @returns {Promise<Object>} - Созданный шаг.
 */
const createStep = async (value, testId, webElementId, actionId, prismaInstance = prisma) => {
  try {
    const step = await prismaInstance.step.create({
      data: {
        value,
        testId,
        webElementId,
        actionId,
      },
    });
    return step;
  } catch (error) {
    console.error('Error creating step:', error);
    throw error;
  }
};


/**
 * Получает шаг по ID.
 * @param {string} stepId - ID шага.
 * @returns {Promise<Object>} - Найденный шаг.
 */
const getStepById = async (stepId) => {
  try {
    const step = await prisma.step.findUnique({
      where: {
        id: stepId,
      },
      include: {
        webElement: true, // Включаем веб-элемент
        action: true, // Включаем действие
      },
    });
    return step;
  } catch (error) {
    console.error('Error fetching step:', error);
    throw error;
  }
};

/**
 * Получает все шаги для указанного теста.
 * @param {string} testId - ID теста.
 * @returns {Promise<Array>} - Список шагов.
 */
const getStepsByTestId = async (testId) => {
  try {
    const steps = await prisma.step.findMany({
      where: {
        testId,
      },
      include: {
        webElement: true, // Включаем веб-элемент
        action: true, // Включаем действие
      },
    });
    return steps;
  } catch (error) {
    console.error('Error fetching steps:', error);
    throw error;
  }
};

/**
 * Обновляет данные шага.
 * @param {string} stepId - ID шага.
 * @param {Object} data - Данные для обновления (value, webElementId, actionId).
 * @returns {Promise<Object>} - Обновленный шаг.
 */
const updateStep = async (stepId, data) => {
  try {
    const step = await prisma.step.update({
      where: {
        id: stepId,
      },
      data,
    });
    return step;
  } catch (error) {
    console.error('Error updating step:', error);
    throw error;
  }
};

/**
 * Удаляет шаг по ID.
 * @param {string} stepId - ID шага.
 * @returns {Promise<Object>} - Удаленный шаг.
 */
const deleteStep = async (stepId) => {
  try {
    const step = await prisma.step.delete({
      where: {
        id: stepId,
      },
    });
    return step;
  } catch (error) {
    console.error('Error deleting step:', error);
    throw error;
  }
};

module.exports = {
  createStep,
  getStepById,
  getStepsByTestId,
  updateStep,
  deleteStep,
};