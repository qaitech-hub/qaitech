const express = require("express");
const router = express.Router();
const {
  exportPageTests,
  importPageTests,
  getPageExportStats,
} = require("../../services/testExportImportService");

/**
 * Экспорт тестов и веб-элементов страницы в JSON формате
 * @route GET /api/test-export-import/export/:pageId
 * @param {string} pageId - ID страницы для экспорта
 * @returns {Object} - JSON файл с данными для экспорта
 */
router.get("/export/:pageId", async (req, res) => {
  const { pageId } = req.params;

  if (!pageId) {
    return res.status(400).json({ error: "Page ID is required" });
  }

  try {
    const exportData = await exportPageTests(pageId);
    
    // Устанавливаем заголовки для скачивания файла
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="page-tests-${pageId}-${Date.now()}.json"`);
    
    res.status(200).json(exportData);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ 
      error: "Failed to export page tests", 
      details: error.message 
    });
  }
});

/**
 * Импорт тестов и веб-элементов страницы из JSON формата
 * @route POST /api/test-export-import/import/:projectId/:pageId?
 * @param {string} projectId - ID проекта (обязательно)
 * @param {string} pageId - ID целевой страницы (опционально, если не указан - создается новая)
 * @param {Object} importData - Данные для импорта в теле запроса
 * @returns {Object} - Результат импорта
 */
router.post("/import/:projectId/:pageId?", async (req, res) => {
  const { projectId, pageId } = req.params;
  const importData = req.body;

  if (!projectId) {
    return res.status(400).json({ error: "Project ID is required" });
  }

  if (!importData) {
    return res.status(400).json({ error: "Import data is required" });
  }

  console.log("Import request received:", {
    projectId,
    pageId: pageId || "new",
    hasPage: !!importData.page,
    hasWebElements: !!importData.webElements,
    hasTests: !!importData.tests,
    webElementsCount: importData.webElements?.length || 0,
    testsCount: importData.tests?.length || 0,
  });

  try {
    // Добавляем projectId к данным импорта
    if (importData.page) {
      importData.page.projectId = projectId;
    }

    const result = await importPageTests(pageId, importData);
    
    res.status(200).json({
      success: true,
      message: "Import completed successfully",
      ...result,
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ 
      error: "Failed to import page tests", 
      details: error.message 
    });
  }
});

/**
 * Получение статистики страницы для экспорта/импорта
 * @route GET /api/test-export-import/stats/:pageId
 * @param {string} pageId - ID страницы
 * @returns {Object} - Статистика страницы
 */
router.get("/stats/:pageId", async (req, res) => {
  const { pageId } = req.params;

  if (!pageId) {
    return res.status(400).json({ error: "Page ID is required" });
  }

  try {
    const stats = await getPageExportStats(pageId);
    
    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ 
      error: "Failed to get page stats", 
      details: error.message 
    });
  }
});

/**
 * Предварительный просмотр данных для импорта
 * @route POST /api/test-export-import/preview/:pageId
 * @param {string} pageId - ID целевой страницы
 * @param {Object} importData - Данные для предварительного просмотра
 * @returns {Object} - Предварительный анализ данных
 */
router.post("/preview/:pageId", async (req, res) => {
  const { pageId } = req.params;
  const importData = req.body;

  if (!pageId) {
    return res.status(400).json({ error: "Page ID is required" });
  }

  if (!importData) {
    return res.status(400).json({ error: "Import data is required" });
  }

  try {
    // Проверяем структуру данных
    if (!importData.page || !importData.webElements || !importData.tests) {
      return res.status(400).json({ 
        error: "Invalid import data structure",
        required: ["page", "webElements", "tests"]
      });
    }

    // Анализируем данные для импорта
    const preview = {
      sourcePage: {
        title: importData.page.title,
        url: importData.page.url,
        viewport: importData.page.viewport,
      },
      webElements: {
        total: importData.webElements.length,
        list: importData.webElements.map(el => ({
          title: el.title,
          selector: el.selector,
        })),
      },
      tests: {
        total: importData.tests.length,
        list: importData.tests.map(test => ({
          title: test.title,
          stepsCount: test.steps.length,
        })),
      },
      totalSteps: importData.tests.reduce((sum, test) => sum + test.steps.length, 0),
      exportDate: importData.exportDate,
      version: importData.version,
    };

    res.status(200).json({
      success: true,
      preview,
    });
  } catch (error) {
    console.error("Preview error:", error);
    res.status(500).json({ 
      error: "Failed to preview import data", 
      details: error.message 
    });
  }
});

/**
 * Валидация данных для импорта
 * @route POST /api/test-export-import/validate/:pageId
 * @param {string} pageId - ID целевой страницы
 * @param {Object} importData - Данные для валидации
 * @returns {Object} - Результат валидации
 */
router.post("/validate/:pageId", async (req, res) => {
  const { pageId } = req.params;
  const importData = req.body;

  if (!pageId) {
    return res.status(400).json({ error: "Page ID is required" });
  }

  if (!importData) {
    return res.status(400).json({ error: "Import data is required" });
  }

  try {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      conflicts: {
        webElements: [],
        tests: [],
      },
    };

    // Проверяем структуру данных
    if (!importData.page || !importData.webElements || !importData.tests) {
      validation.isValid = false;
      validation.errors.push("Invalid data structure: missing required fields");
    }

    // Проверяем, что целевая страница существует
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    
    const targetPage = await prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!targetPage) {
      validation.isValid = false;
      validation.errors.push("Target page not found");
    } else {
      // Проверяем конфликты с существующими элементами
      const existingElements = await prisma.webElement.findMany({
        where: { pageId: pageId },
      });

      for (const element of importData.webElements) {
        const conflict = existingElements.find(existing => 
          existing.selector === element.selector
        );
        
        if (conflict) {
          validation.conflicts.webElements.push({
            imported: element.title,
            existing: conflict.title,
            selector: element.selector,
          });
        }
      }

      // Проверяем конфликты с существующими тестами
      const existingTests = await prisma.test.findMany({
        where: { pageId: pageId },
      });

      for (const test of importData.tests) {
        const conflict = existingTests.find(existing => 
          existing.title === test.title
        );
        
        if (conflict) {
          validation.conflicts.tests.push({
            imported: test.title,
            existing: conflict.title,
          });
        }
      }

      // Предупреждения
      if (validation.conflicts.webElements.length > 0) {
        validation.warnings.push(`${validation.conflicts.webElements.length} web elements will be reused (existing elements with same selectors)`);
      }

      if (validation.conflicts.tests.length > 0) {
        validation.warnings.push(`${validation.conflicts.tests.length} tests will be updated (existing tests with same titles)`);
      }
    }

    await prisma.$disconnect();

    res.status(200).json({
      success: true,
      validation,
    });
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({ 
      error: "Failed to validate import data", 
      details: error.message 
    });
  }
});

/**
 * Получение списка всех проектов для выбора при создании новой страницы
 * @route GET /api/test-export-import/projects
 * @returns {Object} - Список проектов
 */
router.get("/projects", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    await prisma.$disconnect();
    
    res.status(200).json({
      success: true,
      projects,
      total: projects.length,
    });
  } catch (error) {
    console.error("Projects error:", error);
    res.status(500).json({ 
      error: "Failed to get projects", 
      details: error.message 
    });
  }
});

module.exports = router; 