const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Создает новый вьюпорт.
 * @param {string} title - Название вьюпорта.
 * @param {string} type - Тип вьюпорта (DEFAULT или CUSTOM).
 * @param {number} width - Ширина вьюпорта.
 * @param {number} height - Высота вьюпорта.
 * @param {string} projectId - ID проекта, к которому привязан вьюпорт.
 * @returns {Promise<Object>} - Созданный вьюпорт.
 */
const createViewPort = async (title, type, width, height, projectId) => {
  try {
    const viewPort = await prisma.viewPort.create({
      data: {
        title,
        type,
        width,
        height,
        projectId,
      },
    });
    return viewPort;
  } catch (error) {
    console.error("Error creating viewport:", error);
    throw error;
  }
};

/**
 * Получает вьюпорт по ID.
 * @param {string} viewPortId - ID вьюпорта.
 * @returns {Promise<Object>} - Найденный вьюпорт.
 */
const getViewPortById = async (viewPortId) => {
  try {
    const viewPort = await prisma.viewPort.findUnique({
      where: {
        id: viewPortId,
      },
    });
    return viewPort;
  } catch (error) {
    console.error("Error fetching viewport:", error);
    throw error;
  }
};

/**
 * Получает все вьюпорты для указанного проекта.
 * @param {string} projectId - ID проекта.
 * @returns {Promise<Array>} - Список вьюпортов.
 */
const getViewPortsByProjectId = async (projectId) => {
  try {
    const viewPorts = await prisma.viewPort.findMany({
      where: {
        projectId,
      },
    });
    return viewPorts;
  } catch (error) {
    console.error("Error fetching viewports:", error);
    throw error;
  }
};

/**
 * Обновляет данные вьюпорта.
 * @param {string} viewPortId - ID вьюпорта.
 * @param {Object} data - Данные для обновления (title, type, width, height).
 * @returns {Promise<Object>} - Обновленный вьюпорт.
 */
const updateViewPort = async (viewPortId, data) => {
  try {
    const viewPort = await prisma.viewPort.update({
      where: {
        id: viewPortId,
      },
      data,
    });
    return viewPort;
  } catch (error) {
    console.error("Error updating viewport:", error);
    throw error;
  }
};

/**
 * Удаляет вьюпорт по ID.
 * @param {string} viewPortId - ID вьюпорта.
 * @returns {Promise<Object>} - Удаленный вьюпорт.
 */
const deleteViewPort = async (viewPortId) => {
  try {
    const viewPort = await prisma.viewPort.delete({
      where: {
        id: viewPortId,
      },
    });
    return viewPort;
  } catch (error) {
    console.error("Error deleting viewport:", error);
    throw error;
  }
};

/**
 * Получает все вьюпорты для указанного проекта.
 * @param {string} projectId - ID проекта.
 * @returns {Promise<Array>} - Список вьюпортов.
 */
const getAllViewPorts = async () => {
  try {
    const viewPorts = await prisma.viewPort.findMany({});
    return viewPorts;
  } catch (error) {
    console.error("Error fetching viewports:", error);
    throw error;
  }
};

/**
 * Инициализация предопределенных ViewPort в базе данных.
 */
async function initializeViewPorts() {
  const predefinedActions = [
    { title: "DESKTOP", width: 2560, height: 1440 },
    { title: "TABLET", width: 768, height: 1024 },
    { title: "MOBILE", width: 320, height: 480 },
  ];

  for (const action of predefinedActions) {
    try {
      // Проверяем, существует ли уже запись с таким именем
      const existingAction = await prisma.viewPort.findFirst({
        where: { title: action.title },
      });

      if (!existingAction) {
        // Если записи нет, создаем новую
        await prisma.viewPort.create({
          data: {
            title: action.title,
            width: action.width,
            height: action.height,
          },
        });
      }
    } catch (error) {
      console.error(
        `Ошибка при инициализации действия "${action.name}":`,
        error.message
      );
    }
  }

  console.log(
    "Предопределенные действия над веб-элементами успешно инициализированы."
  );
}

module.exports = {
  createViewPort,
  getViewPortById,
  getViewPortsByProjectId,
  updateViewPort,
  deleteViewPort,
  getAllViewPorts,
  initializeViewPorts,
};
