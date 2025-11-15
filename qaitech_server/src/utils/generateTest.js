const fs = require("fs");
const path = require("path");
const prismaPool = require("./prismaPool");

// Получаем цвет подсветки из переменной окружения или используем значение по умолчанию
const HIGHLIGHT_BOXSHADOW_COLOR = process.env.HIGHLIGHT_BOXSHADOW_COLOR;
// Получаем стиль border из переменной окружения или используем значение по умолчанию
const HIGHLIGHT_BORDER_STYLE = process.env.HIGHLIGHT_BORDER_STYLE ;

// Создаем директорию для тестов, если она не существует
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Генерация теста в виде файла Playwright
 * @param {string} testId - ID теста
 * @returns {Promise<string>} - Путь к сгенерированному файлу
 */
async function generateTest(testId, reportIdManual) {
  const generatedTestsDir = path.join(__dirname, "../../tests/generated");
  ensureDirectoryExists(generatedTestsDir);

  const test = await prismaPool.withClient(async (prisma) => {
    return await prisma.test.findUnique({
      where: { id: testId },
      include: {
        Step: {
          include: {
            webElement: true,
            action: true,
          },
        },
        page: {
          include: {
            viewport: true,
          },
        },
      },
    });
  });

  if (!test) {
    throw new Error(`Test with ID ${testId} not found.`);
  }

  const { width, height } = test.page.viewport;

  // Добавляем функцию highlightElement в генерируемый код
  const highlightFunction = `
    async function highlightElement(page, selector) {
      await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) {
          element.style.border = '${HIGHLIGHT_BORDER_STYLE}';
          element.style.boxShadow = '${HIGHLIGHT_BOXSHADOW_COLOR}';
          element.style.transition = 'all 0.3s ease';
        }
      }, selector);
      await new Promise(resolve => setTimeout(resolve, 300)); // Даем время для визуализации
    }

    async function unhighlightElement(page, selector) {
      await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) {
          element.style.border = '';
          element.style.boxShadow = '';
        }
      }, selector);
    }
  `;

  // Модифицируем генерацию кода шагов для добавления подсветки
  const stepsCode = test.Step.map((step) => {
    const { selector, title } = step.webElement;
    const { name: actionName } = step.action;
    const { value } = step;

    const safeSelector = selector.replaceAll("'", '"').replaceAll("`", '"');

    // Для действий, работающих с элементами, добавляем подсветку
    const elementActions = [
      "click",
      "fill",
      "hover",
      "checkText",
      "waitForElement",
      "selectOption",
      "checkVisibility",
      "pressKey",
      "clearInput",
      "doubleClick",
      "rightClick",
      "focus",
      "blur",
    ];

    if (elementActions.includes(actionName)) {
      return `
        await highlightElement(page, '${safeSelector}');
        ${getActionCode(actionName, safeSelector, value, title)}
        await unhighlightElement(page, '${safeSelector}');
      `;
    }

    return getActionCode(actionName, safeSelector, value, title);

    function getActionCode(action, selector, value, title) {
      switch (action) {
        case "click":
          return `await playwrightService.click('${selector}', report.id, '${title}');`;
        case "fill":
          return `await playwrightService.fill('${selector}', '${value}', report.id, '${title}');`;
        case "hover":
          return `await playwrightService.hover('${selector}', report.id, '${title}');`;
        case "checkText":
          return `await playwrightService.checkText('${selector}', '${value}', report.id, '${title}');`;
        case "waitForElement":
          return `await playwrightService.waitForElement('${selector}', ${
            value || 5000
          }, report.id, '${title}');`;
        case "goBack":
          return `await playwrightService.goBack(report.id, '${title}');`;
        case "goForward":
          return `await playwrightService.goForward(report.id, '${title}');`;
        case "selectOption":
          return `await playwrightService.selectOption('${selector}', '${value}', report.id, '${title}');`;
        case "checkVisibility":
          return `await playwrightService.checkVisibility('${selector}', report.id, '${title}');`;
        case "pressKey":
          return `await playwrightService.pressKey('${selector}', '${value}', report.id, '${title}');`;
        case "clearInput":
          return `await playwrightService.clearInput('${selector}', report.id, '${title}');`;
        case "doubleClick":
          return `await playwrightService.doubleClick('${selector}', report.id, '${title}');`;
        case "rightClick":
          return `await playwrightService.rightClick('${selector}', report.id, '${title}');`;
        case "focus":
          return `await playwrightService.focus('${selector}', report.id, '${title}');`;
        case "blur":
          return `await playwrightService.blur('${selector}', report.id, '${title}');`;
        case "takeScreenshot":
          return `await playwrightService.takeScreenshot(report.id, '${title}');`;
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    }
  }).join("\n        ");

  // Генерация полного кода теста
  const testCode = `
    const { test, expect } = require('@playwright/test');
    const PlaywrightService = require('../../src/utils/playwrightService');
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    ${highlightFunction}

    test('${test.title}', async ({ page }) => {
      const playwrightService = new PlaywrightService();
      await playwrightService.init();
      playwrightService.page = page;

      await page.setViewportSize({ width: ${width}, height: ${height} });

      const report = await prisma.report.create({
        data: {
          id: '${reportIdManual}',
          testId: '${testId}',
          status: false,
          executionTime: 0,
        },
      });

      const startTime = Date.now();

      try {
        await playwrightService.openPage('${test.page.url}', report.id);

        ${stepsCode}

        await prisma.report.update({
          where: { id: report.id },
          data: {
            status: true,
            executionTime: Date.now() - startTime,
          },
        });
      } catch (error) {
        console.error('Test failed:', error);

        await prisma.report.update({
          where: { id: report.id },
          data: {
            status: false,
            executionTime: Date.now() - startTime,
          },
        });

        throw error;
      } finally {
        await playwrightService.close();
        await prisma.$disconnect();
      }
    });
  `;

  const testFileName = `test_${testId}.spec.js`;
  const testFilePath = path.join(
    __dirname,
    "../../tests/generated",
    testFileName
  );

  // Используем writeFileSync для синхронной записи файла
  fs.writeFileSync(testFilePath, testCode);

  return testFilePath;
}

module.exports = generateTest;
