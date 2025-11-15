const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createStep } = require("./stepService");
const { createReport } = require("./reportService");
const {
  createReportStep,
  getReportStepsByReportId,
} = require("./reportStepService");
const { exec, fork } = require("child_process");
const generateTest = require("../utils/generateTest");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");
const testQueueService = require("./testQueueService");
const testWorkerService = require("./testWorkerService");

/**
 * Создает новый тест с шагами.
 * @param {string} title - Название теста.
 * @param {string} pageId - ID страницы, к которой привязан тест.
 * @param {Array} steps - Массив шагов.
 * @returns {Promise<Object>} - Созданный тест с шагами.
 */
const createTest = async (title, pageId, steps) => {
  try {
    const test = await prisma.$transaction(async (prisma) => {
      // Создаем тест
      const newTest = await prisma.test.create({
        data: {
          title,
          page: { connect: { id: pageId } },
          Step: {
            createMany: {
              data: [
                ...steps?.map((i) => ({
                  value: i?.value,
                  webElementId: i?.element?.id,
                  actionId: i?.action?.id,
                })),
              ],
            },
          },
        },
      });

      // Возвращаем тест с шагами
      return newTest;
    });

    return test;
  } catch (error) {
    console.error("Error creating test with steps:", error);
    throw error;
  }
};

/**
 * Получает тест по ID.
 * @param {string} testId - ID теста.
 * @returns {Promise<Object>} - Найденный тест.
 */
const getTestById = async (testId) => {
  try {
    const test = await prisma.test.findUnique({
      where: {
        id: testId,
        deleted: false,
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

    let arr = test?.Step?.map((i) => ({
      ...i,
      element: { ...i?.webElement, name: i?.webElement?.title },
      action: { ...i?.action },
    }));

    return { arr, name: test?.title };
  } catch (error) {
    console.error("Error fetching test:", error);
    throw error;
  }
};

/**
 * Получает все тесты для указанной страницы.
 * @param {string} pageId - ID страницы.
 * @returns {Promise<Array>} - Список тестов.
 */
const getTestsByPageId = async (pageId) => {
  try {
    const tests = await prisma.test.findMany({
      where: {
        pageId,
        deleted: false,
      },
      include: {
        Step: true,
      },
    });
    return tests;
  } catch (error) {
    console.error("Error fetching tests:", error);
    throw error;
  }
};

/**
 * Обновляет данные теста.
 * @param {string} testId - ID теста.
 * @param {Object} data - Данные для обновления (title).
 * @returns {Promise<Object>} - Обновленный тест.
 */
const updateTest = async (title, steps, testId) => {
  try {
    const test = await prisma.test.update({
      where: {
        id: testId,
      },
      data: {
        title,
        Step: {
          deleteMany: {},
          createMany: {
            data: [
              ...steps?.map((i) => ({
                value: i?.value,
                webElementId: i?.element?.id,
                actionId: i?.action?.id,
              })),
            ],
          },
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

    let arr = test?.Step?.map((i) => ({
      ...i,
      element: { ...i?.webElement, name: i?.webElement?.title },
      action: { ...i?.action },
    }));

    return { arr, name: test?.title };
  } catch (error) {
    console.error("Error updating test:", error);
    throw error;
  }
};

/**
 * Удаляет тест по ID.
 * @param {string} testId - ID теста.
 * @returns {Promise<Object>} - Удаленный тест.
 */
const deleteTest = async (testId) => {
  try {
    await prisma.test.update({
      where: {
        id: testId,
      },
      data: {
        deleted: true,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting test:", error);
    throw error;
  }
};

/**
 * Меняет позицию шагов.
 * @param {string} testId - ID теста.
 * @returns {Promise<Object>} - Удаленный тест.
 */
const relocateStepTest = async (element, nextElement) => {
  try {
    await prisma.step.update({
      where: {
        id: element.id,
      },
      data: {
        value: nextElement.value,
        webElementId: nextElement.webElement.id,
        actionId: nextElement.action.id,
      },
    });
    await prisma.step.update({
      where: {
        id: nextElement.id,
      },
      data: {
        value: element.value,
        webElementId: element.webElement.id,
        actionId: element.action.id,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting test:", error);
    throw error;
  }
};

/**
 * Запуск одного теста
 * @param {string} testFilePath - Путь к файлу теста
 * @param {string} browser - Браузер для запуска теста ("Safari", "Chrome", "Firefox")
 * @returns {Promise<{ status: boolean, output: string }>}
 */
function runTest(testFilePath, browser) {
  return new Promise((resolve, reject) => {
    const formattedTestFilePath = testFilePath?.replaceAll("\\", "/");
    // Используем разные команды для Windows и Linux
    const command = `npx playwright test ${formattedTestFilePath} --project=${browser}`;

    exec(command, (error, stdout, stderr) => {
      console.log("Test output:", stdout);
      console.log("Test errors:", stderr);

      if (error) {
        console.error("Test execution error:", error);
        resolve({ status: false, output: stderr || error.message });
        return;
      }

      resolve({ status: true, output: stdout });
    });
  });
}

/**
 * Запуск всех тестов по массиву ID
 * @param {string[]} testIds - Массив ID тестов
 * @param {string} browser - Браузер для запуска тестов ("Safari", "Chrome", "Firefox")
 * @returns {Promise<{ overallStatus: boolean, steps: Array<{ value: string, status: boolean, screenshot?: string }> }>}
 */
async function runTestsInSeparateProcess(testIds, browser) {
  return new Promise((resolve, reject) => {
    const testProcess = fork(path.join(__dirname, "testRunnerService.js"));

    testProcess.send({ testIds, browser });

    testProcess.on("message", async (message) => {
      console.log(message, "asassaww22222222222");

      if (message.status === "success") {
        // Сохраняем отчет в основной БД
        try {
          // const report = await createReport(
          //   testIds[0],
          //   message.data.overallStatus,
          //   message.data.executionTime
          // );

          // const reportSteps = await Promise.all(
          //   message.data.steps.map((step) =>
          //     createReportStep(step.value, report.id, step.status)
          //   )
          // );

          resolve({
            reportId: message.data?.reportIdManual,
            steps: message.data.steps,
            executionTime: message.data.executionTime,
            overallStatus: message.data.overallStatus,
          });
        } catch (err) {
          console.log(err);
          reject(err);
        }
      } else {
        reject(new Error(message.error));
      }
    });

    testProcess.on("error", (err) => {
      reject(err);
    });
  });
}

// Удаляем тест
function cleanupGeneratedTests() {
  const dir = path.join(__dirname, "../../tests/generated");
  fs.readdir(dir, (err, files) => {
    if (err) return;
    files.forEach((file) => {
      if (file.startsWith("test_") && file.endsWith(".spec.js")) {
        fs.unlinkSync(path.join(dir, file));
      }
    });
  });
}

// Добавляем новую функцию для добавления тестов в очередь
const queueTests = async (testIds, browser, userId) => {
  try {
    const queueId = await testQueueService.addToQueue(testIds, browser, userId);
    return { queueId };
  } catch (error) {
    console.error("Error queuing tests:", error);
    throw error;
  }
};

// Добавляем функцию для получения статуса тестов пользователя
const getUserTestsStatus = async (userId) => {
  try {
    return await testQueueService.getQueueStatus(userId);
  } catch (error) {
    console.error("Error getting user tests status:", error);
    throw error;
  }
};

// Инициализация обработчика очереди при запуске сервера
const initializeQueueProcessor = () => {
  testWorkerService.startProcessing();
};

module.exports = {
  createTest,
  getTestById,
  getTestsByPageId,
  updateTest,
  deleteTest,
  runTestsInSeparateProcess,
  cleanupGeneratedTests,
  runTest,
  queueTests,
  getUserTestsStatus,
  initializeQueueProcessor,
  relocateStepTest,
};
