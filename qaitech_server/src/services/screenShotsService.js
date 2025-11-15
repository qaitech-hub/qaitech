const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Создает новый скриншот.
 * @param {string} data - Данные скриншота (base64 или URL).
 * @param {string} reportStepId - ID шага отчета.
 * @returns {Promise<Object>} - Созданный скриншот.
 */
const createScreenshot = async (data, reportStepId) => {
  try {
    const screenshot = await prisma.screenshot.create({
      data: {
        data,
        reportStepId,
      },
    });
    return screenshot;
  } catch (error) {
    console.error("Error creating screenshot:", error);
    throw error;
  }
};

/**
 * Получает скриншот по ID.
 * @param {string} screenshotId - ID скриншота.
 * @returns {Promise<Object>} - Найденный скриншот.
 */
const getScreenshotById = async (screenshotId) => {
  try {
    const screenshot = await prisma.screenshot.findUnique({
      where: {
        id: screenshotId,
      },
    });
    return screenshot;
  } catch (error) {
    console.error("Error fetching screenshot:", error);
    throw error;
  }
};

module.exports = {
  createScreenshot,
  getScreenshotById,
};
