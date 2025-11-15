const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Создает новый шаг отчета.
 * @param {string} value - Описание шага.
 * @param {string} reportId - ID отчета.
 * @param {boolean} status - Статус выполнения шага (true/false).
 * @returns {Promise<Object>} - Созданный шаг отчета.
 */
const createReportStep = async (value, reportId, status) => {
  try {
    const reportStep = await prisma.reportStep.create({
      data: {
        value,
        reportId,
        status,
      },
    });
    return reportStep;
  } catch (error) {
    console.error("Error creating report step:", error);
    throw error;
  }
};

/**
 * Получает шаг отчета по ID.
 * @param {string} reportStepId - ID шага отчета.
 * @returns {Promise<Object>} - Найденный шаг отчета.
 */
const getReportStepById = async (reportStepId) => {
  try {
    const reportStep = await prisma.reportStep.findUnique({
      where: {
        id: reportStepId,
      },
      include: {
        Screenshot: true, // Включаем скриншоты
      },
    });
    return reportStep;
  } catch (error) {
    console.error("Error fetching report step:", error);
    throw error;
  }
};

/**
 * Получает все шаги отчета для указанного отчета.
 * @param {string} reportId - ID отчета.
 * @returns {Promise<Array>} - Список шагов отчета.
 */
const getReportStepsByReportId = async (reportId) => {
  try {
    const reportSteps = await prisma.reportStep.findMany({
      where: {
        reportId,
      },
      include: {
        Screenshot: true, // Включаем скриншоты
      },
    });
    return reportSteps;
  } catch (error) {
    console.error("Error fetching report steps:", error);
    throw error;
  }
};

module.exports = {
  createReportStep,
  getReportStepById,
  getReportStepsByReportId,
};
