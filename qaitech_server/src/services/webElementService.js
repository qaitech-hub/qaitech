const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Создает новый веб-элемент.
 * @param {string} title - Название веб-элемента.
 * @param {string} selector - Селектор веб-элемента.
 * @param {string} pageId - ID страницы, к которой привязан веб-элемент.
 * @returns {Promise<Object>} - Созданный веб-элемент.
 */
const createWebElement = async (title, selector, pageId) => {
  try {
    const webElements = await prisma.webElement.findUnique({
      where: {
        pageId,
      },
    });

    return;
  } catch (error) {
    console.error("Error creating web element:", error);
    throw error;
  }
};

/**
 * Создает новый веб-элемент.
 * @param {string} title - Название веб-элемента.
 * @param {string} selector - Селектор веб-элемента.
 * @param {string} pageId - ID страницы, к которой привязан веб-элемент.
 * @returns {Promise<Object>} - Созданный веб-элемент.
 */
const createWebElement_Env = async (pageId, elements, fromEnv = true) => {
  try {
    await prisma.page.update({
      where: { id: pageId },
      data: {
        WebElement: {
          deleteMany: {},
          createMany: {
            data: [
              ...elements?.map((i) => ({
                id: i?.id,
                title: i?.title,
                selector: i?.selector,
                fromEnv,
              })),
            ],
          },
        },
      },
    });

    for (var i = 0; i < elements?.length; i++) {
      if (!!elements[i]?.Step) {
        await prisma.webElement.update({
          where: { id: elements[i].id },
          data: {
            Step: {
              deleteMany: {},
              createMany: {
                data: [
                  ...elements[i]?.Step?.map((j) => ({
                    value: j?.value,
                    testId: j?.testId,
                    actionId: j?.actionId,
                  })),
                ],
              },
            },
          },
        });
      }
    }

    return;
  } catch (error) {
    console.error("Error creating web element:", error);
    throw error;
  }
};

/**
 * Получает веб-элемент по ID.
 * @param {string} webElementId - ID веб-элемента.
 * @returns {Promise<Object>} - Найденный веб-элемент.
 */
const getWebElementById = async (webElementId) => {
  try {
    const webElement = await prisma.webElement.findUnique({
      where: {
        id: webElementId,
      },
      include: { Step: true },
    });
    return webElement;
  } catch (error) {
    console.error("Error fetching web element:", error);
    throw error;
  }
};

/**
 * Получает все веб-элементы для указанной страницы.
 * @param {string} pageId - ID страницы.
 * @returns {Promise<Array>} - Список веб-элементов.
 */
const getWebElementsByPageId = async (pageId) => {
  try {
    const webElements = await prisma.webElement.findMany({
      where: {
        pageId,
      },
      include: { Step: true },
    });
    return webElements;
  } catch (error) {
    console.error("Error fetching web elements:", error);
    throw error;
  }
};

/**
 * Получает все веб-элементы из Environment для указанной страницы.
 * @param {string} pageId - ID страницы.
 * @returns {Promise<Array>} - Список веб-элементов.
 */
const getWebElementsByPageId_Env = async (pageId) => {
  try {
    const webElements = await prisma.webElement.findMany({
      where: {
        pageId,
      },
      include: { Step: true },
    });
    return webElements;
  } catch (error) {
    console.error("Error fetching web elements:", error);
    throw error;
  }
};

/**
 * Обновляет данные веб-элемента.
 * @param {string} webElementId - ID веб-элемента.
 * @param {Object} data - Данные для обновления (title, selector).
 * @returns {Promise<Object>} - Обновленный веб-элемент.
 */
const updateWebElement = async (webElementId, data) => {
  try {
    const webElement = await prisma.webElement.update({
      where: {
        id: webElementId,
      },
      data,
    });
    return webElement;
  } catch (error) {
    console.error("Error updating web element:", error);
    throw error;
  }
};

/**
 * Удаляет веб-элемент по ID.
 * @param {string} webElementId - ID веб-элемента.
 * @returns {Promise<Object>} - Удаленный веб-элемент.
 */
const deleteWebElement = async (webElementId) => {
  try {
    const webElement = await prisma.webElement.delete({
      where: {
        id: webElementId,
      },
    });
    return webElement;
  } catch (error) {
    console.error("Error deleting web element:", error);
    throw error;
  }
};

module.exports = {
  createWebElement,
  createWebElement_Env,
  getWebElementById,
  getWebElementsByPageId,
  getWebElementsByPageId_Env,
  updateWebElement,
  deleteWebElement,
};
