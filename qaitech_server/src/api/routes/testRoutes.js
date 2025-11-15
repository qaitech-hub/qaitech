const express = require("express");
const path = require("path");
const router = express.Router();
const {
  createTest,
  getTestById,
  getTestsByPageId,
  updateTest,
  deleteTest,
  cleanupGeneratedTests,
  runTestsInSeparateProcess,
  relocateStepTest,
} = require("../../services/testService");
const {
  setTrueTestsStatus,
  setFalseTestsStatus,
  isTrueTestsStatus,
} = require("../../services/testRunningStatusService");
const { resetRunningTests } = require(path.resolve(
  __dirname,
  "../../../scripts/resetRunningTests"
));

/**
 * Создание нового теста.
 * @route POST /api/tests
 * @param {string} title - Название теста.
 * @param {string} pageId - ID страницы, к которой привязан тест.
 * @returns {Object} - Созданный тест.
 */
router.post("/", async (req, res) => {
  const { title, pageId, steps } = req.body;

  // console.log(title, pageId, steps);

  if (
    !title ||
    !pageId ||
    !!steps?.find((i) => !i?.action?.id || !i?.element?.id)
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const test = await createTest(title, pageId, steps);
    res.status(201).json({ success: "Success", test });
  } catch (error) {
    res.status(500).json({ error: "Failed to create test" });
  }
});

/**
 * Получение информации о тесте по ID.
 * @route GET /api/tests/:testId
 * @param {string} testId - ID теста.
 * @returns {Object} - Найденный тест.
 */
router.get("/:testId", async (req, res) => {
  const { testId } = req.params;

  try {
    const test = await getTestById(testId);
    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }
    res
      .status(200)
      .json({ success: "Success", test: test?.arr, name: test?.name });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch test" });
  }
});

/**
 * Получение всех тестов для страницы.
 * @route GET /api/tests/page/:pageId
 * @param {string} pageId - ID страницы.
 * @returns {Array} - Список тестов.
 */
router.get("/page/:pageId", async (req, res) => {
  const { pageId } = req.params;

  try {
    const tests = await getTestsByPageId(pageId);
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});

/**
 * Обновление данных теста.
 * @route PUT /api/tests/:testId
 * @param {string} testId - ID теста.
 * @param {Object} data - Данные для обновления (title).
 * @returns {Object} - Обновленный тест.
 */
router.put("/:testId", async (req, res) => {
  const { title, steps, testId } = req.body;

  // console.log(title, pageId, steps);

  if (
    !testId ||
    !title ||
    !!steps?.find((i) => !i?.action?.id || !i?.element?.id)
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const test = await updateTest(title, steps, testId);
    res
      .status(200)
      .json({ success: "Success", test: test?.arr, name: test?.name });
  } catch (error) {
    res.status(500).json({ error: "Failed to update test" });
  }
});

/**
 * Удаление теста по ID.
 * @route DELETE /api/tests/:testId
 * @param {string} testId - ID теста.
 * @returns {Object} - Удаленный тест.
 */
router.delete("/:testId", async (req, res) => {
  const { testId } = req.params;

  try {
    const test = await deleteTest(testId);
    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete test" });
  }
});

/**
 * Изменение позиции шагатеста.
 * @route POST /api/tests/relocate
 * @param {string} testId - ID теста.
 * @returns {Object} - Удаленный тест.
 */
router.post("/relocate", async (req, res) => {
  const { element, nextElement } = req.body;
  try {
    await relocateStepTest(element, nextElement);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to relocate" });
  }
});

/**
 * Роут для запуска тестов по массиву ID
 */
router.post("/run-tests", async (req, res) => {
  const { testIds, browser } = req.body;

  console.log(browser);

  // Валидация testIds
  if (!testIds || !Array.isArray(testIds)) {
    return res.status(400).json({ error: "testIds must be an array" });
  }

  // Валидация browser
  const allowedBrowsers = ["Safari", "Chrome", "Firefox"];
  if (!browser || !allowedBrowsers.includes(browser)) {
    return res.status(400).json({
      error: `Invalid browser. Allowed values are: ${allowedBrowsers.join(
        ", "
      )}`,
    });
  }

  try {
    const statuses = await isTrueTestsStatus();
    if (!!statuses.find((i) => i.isRunning === true)) {
      console.log(
        "⚠️ Обнаружены тесты со статусом 'выполняется'. Автоматический сброс..."
      );
      try {
        await resetRunningTests();
        console.log(
          "✅ Статус зависших тестов сброшен. Повторная попытка запуска..."
        );

        // Повторная проверка после сброса
        const statusesAfterReset = await isTrueTestsStatus();
        if (!!statusesAfterReset.find((i) => i.isRunning === true)) {
          return res.status(500).json({
            error: "Some tests is running",
            message:
              "Не удалось сбросить статус зависших тестов. Попробуйте позже.",
          });
        }
      } catch (resetError) {
        console.error("❌ Ошибка при сбросе статуса тестов:", resetError);
        return res.status(500).json({
          error: "Some tests is running",
          message: "Ошибка при автоматическом сбросе статуса тестов",
        });
      }
    }

    await setTrueTestsStatus(testIds);
    // Передаем browser в функцию runTestsInSeparateProcess
    const report = await runTestsInSeparateProcess(testIds, browser);
    return res.status(200).json(report);
  } catch (error) {
    await setFalseTestsStatus(testIds);
    console.error("Error running tests:", error);
    return res.status(500).json({ error: error });
  } finally {
    await setFalseTestsStatus(testIds);
    cleanupGeneratedTests();
    console.log("success");
  }
});

/**
 * Роут для сброса статуса "зависших" тестов
 * @route POST /api/tests/reset-running-status
 */
router.post("/reset-running-status", async (req, res) => {
  try {
    console.log("🔄 Ручной сброс статуса зависших тестов...");

    // Найти все тесты со статусом isRunning = true
    const runningTests = await isTrueTestsStatus();

    if (runningTests.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Нет тестов со статусом 'выполняется'",
        resetCount: 0,
      });
    }

    // Вызвать функцию сброса
    await resetRunningTests();

    console.log(`✅ Статус сброшен для ${runningTests.length} тестов`);

    return res.status(200).json({
      success: true,
      message: `Статус сброшен для ${runningTests.length} тестов`,
      resetCount: runningTests.length,
      resetTests: runningTests.map((test) => ({
        id: test.id,
        title: test.title || "Без названия",
      })),
    });
  } catch (error) {
    console.error("❌ Ошибка при сбросе статуса тестов:", error);
    return res.status(500).json({
      success: false,
      error: "Ошибка при сбросе статуса тестов",
      details: error.message,
    });
  }
});

module.exports = router;
