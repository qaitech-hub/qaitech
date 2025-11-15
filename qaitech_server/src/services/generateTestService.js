const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();
const { getAllActions } = require("../services/actionService");
const { getWebElementsByPageId } = require("../services/webElementService");
const { generateTests } = require("../services/ai/testGeneratorService");
const { isLlmConfigValid } = require("../services/ai/llmConfigService");

/**
 * Генерирует тесты через внутренний AI сервис
 * @param {string} pageId - ID страницы
 * @param {string} customPrompt - Дополнительный промпт от тестировщика (опционально)
 * @returns {Promise<Array>} - Сгенерированные тест-кейсы
 */
const generateTestCases = async (pageId, customPrompt = null) => {
  if (!isLlmConfigValid()) {
    throw new Error("LLM configuration is not set. Please configure LLM using POST /api/llm/config");
  }

  // Получаем данные из БД используя существующие функции
  const elements = await getWebElementsByPageId(pageId);
  const actions = await getAllActions();

  // Подготавливаем данные для запроса
  const requestData = {
    elements: elements.map((el) => ({
      id: el.id,
      title: el.title,
      selector: el.selector,
      type: el.type || "element",
    })),
    actions: actions.map((act) => ({
      id: act.id,
      name: act.name,
      withValue: act.withValue,
    })),
  };

  console.log("Using internal AI test generator:", {
    elementsCount: elements.length,
    actionsCount: actions.length,
    hasCustomPrompt: !!customPrompt,
  });

  const result = await generateTests(requestData.elements, requestData.actions, customPrompt);
  return result.test_cases || [];
};

const saveGeneratedTests = async (pageId, testCases) => {
  return await prisma.$transaction(async (tx) => {
    const savedTests = [];

    for (const testCase of testCases) {
      const test = await tx.test.create({
        data: {
          title: testCase.title,
          pageId: pageId,
          Step: {
            create: testCase.steps.map((step) => ({
              // Используем create вместо createMany для лучшей обработки ошибок
              value: step.value,
              webElementId: step.webElementId,
              actionId: step.actionId,
            })),
          },
        },
        include: {
          Step: {
            include: {
              webElement: true,
              action: true,
            },
          },
        },
      });
      savedTests.push(test);
    }

    return savedTests;
  });
};

module.exports = {
  generateTestCases,
  saveGeneratedTests,
};
