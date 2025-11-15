const express = require("express");
const router = express.Router();
const { generateTestCases } = require("../../services/generateTestService");
const { createTest } = require("../../services/testService");
const { generateTests } = require("../../services/ai/testGeneratorService");
const { isLlmConfigValid } = require("../../services/ai/llmConfigService");

/**
 * Генерация и сохранение тестов (использует внутренний или внешний сервис автоматически)
 * @route POST /api/generate-tests
 * @param {string} pageId - ID страницы
 * @param {string} prompt - Дополнительный промпт от тестировщика (опционально)
 * @returns {Array} - Созданные тесты
 */
router.post("/", async (req, res) => {
  const { pageId, prompt } = req.body;

  if (!pageId) {
    return res.status(400).json({ error: "pageId is required" });
  }

  try {
    // Генерируем тест-кейсы (автоматически использует внутренний или внешний сервис)
    const testCases = await generateTestCases(pageId, prompt || null);

    const filteredData = testCases.map((item) => {
      // Фильтруем steps, оставляя только те, у которых webElementId не пустой
      const filteredSteps = item.steps.filter(
        (step) => step.webElementId !== ""
      );
      // Возвращаем объект с отфильтрованными steps
      return {
        ...item,
        steps: filteredSteps,
      };
    });

    // Сохраняем тесты используя существующую функцию createTest
    const createdTests = [];
    for (const testCase of filteredData) {
      const test = await createTest(
        testCase.title,
        pageId,
        testCase.steps.map((step) => ({
          value: step.value,
          element: { id: step.webElementId },
          action: { id: step.actionId },
        }))
      );
      createdTests.push(test);
    }

    res.status(201).json({ success: "Усепх" });
  } catch (error) {
    console.error("Error in test generation:", error);
    res.status(500).json({
      error: "Failed to generate tests",
      details: error.message,
    });
  }
});

/**
 * Генерация тестов через внутренний AI сервис напрямую
 * @route POST /api/generate-tests/internal
 * @param {Array} elements - Массив элементов
 * @param {Array} actions - Массив действий
 * @param {string} prompt - Дополнительный промпт от тестировщика (опционально)
 * @returns {Object} - Сгенерированные тест-кейсы
 */
router.post("/internal", async (req, res) => {
  try {
    const { elements, actions, prompt } = req.body;

    if (
      !elements ||
      !Array.isArray(elements) ||
      !actions ||
      !Array.isArray(actions)
    ) {
      return res.status(400).json({
        error: "Invalid input: elements and actions arrays are required",
      });
    }

    if (!isLlmConfigValid()) {
      return res.status(400).json({
        error: "LLM configuration is not set. Please configure LLM using POST /api/llm/config",
      });
    }

    const tests = await generateTests(elements, actions, prompt || null);

    res.json({ tests });
  } catch (error) {
    console.error("Error in internal test generation:", error);
    res.status(500).json({
      error: "Failed to generate tests",
      details: error.message,
    });
  }
});

module.exports = router;
