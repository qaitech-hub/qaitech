// src/services/webElementActionsService.js

// Инициализация Prisma Client

const prisma = require("../db/db");

/**
 * Инициализация предопределенных WebElementActions в базе данных.
 */
async function initializeWebElementActions() {
  const predefinedActions = [
    { name: "click", withValue: false },
    { name: "fill", withValue: true },
    { name: "hover", withValue: false },
    { name: "checkText", withValue: true },
    { name: "waitForElement", withValue: true },
    { name: "goBack", withValue: false },
    { name: "goForward", withValue: false },
    { name: "selectOption", withValue: true },
    { name: "checkVisibility", withValue: false },
    { name: "pressKey", withValue: true },
    { name: "clearInput", withValue: false },
    { name: "doubleClick", withValue: false },
    { name: "rightClick", withValue: false },
    { name: "focus", withValue: false },
    { name: "blur", withValue: false },
    { name: "takeScreenshot", withValue: true },
  ];

  for (const action of predefinedActions) {
    try {
      // Проверяем, существует ли уже запись с таким именем
      const existingAction = await prisma.WebElementActions.findFirst({
        where: { name: action.name },
      });

      if (!existingAction) {
        // Если записи нет, создаем новую
        await prisma.WebElementActions.create({
          data: {
            name: action.name,
            withValue: action.withValue,
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
  initializeWebElementActions,
};
