const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Экспорт тестов и веб-элементов страницы в JSON формат
 * @param {string} pageId - ID страницы
 * @returns {Promise<Object>} - Объект с данными для экспорта
 */
const exportPageTests = async (pageId) => {
  try {
    // Получаем страницу с веб-элементами
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        viewport: true,
        WebElement: {
          include: {
            Step: {
              include: {
                test: true,
                action: true,
              },
            },
          },
        },
        Test: {
          include: {
            Step: {
              include: {
                webElement: true,
                action: true,
              },
            },
          },
        },
      },
    });

    if (!page) {
      throw new Error("Page not found");
    }

    // Формируем структуру для экспорта
    const exportData = {
      page: {
        id: page.id,
        title: page.title,
        url: page.url,
        viewport: {
          id: page.viewport.id,
          title: page.viewport.title,
          width: page.viewport.width,
          height: page.viewport.height,
        },
      },
      webElements: page.WebElement.map((element) => ({
        id: element.id,
        title: element.title,
        selector: element.selector,
        fromEnv: element.fromEnv,
      })),
      tests: page.Test.map((test) => ({
        id: test.id,
        title: test.title,
        steps: test.Step.map((step) => ({
          id: step.id,
          value: step.value,
          webElement: {
            id: step.webElement.id,
            title: step.webElement.title,
            selector: step.webElement.selector,
          },
          action: {
            id: step.action.id,
            name: step.action.name,
            withValue: step.action.withValue,
          },
        })),
      })),
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    return exportData;
  } catch (error) {
    console.error("Error exporting page tests:", error);
    throw error;
  }
};

/**
 * Импорт тестов и веб-элементов страницы из JSON формата
 * @param {string} pageId - ID целевой страницы (может быть null для создания новой)
 * @param {Object} importData - Данные для импорта
 * @returns {Promise<Object>} - Результат импорта
 */
const importPageTests = async (pageId, importData) => {
  try {
    // Проверяем структуру данных
    if (!importData.webElements || !importData.tests) {
      throw new Error("Invalid import data structure: missing webElements or tests");
    }

    // Проверяем существование проекта, если создается новая страница
    if (!pageId && importData.page?.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: importData.page.projectId },
      });
      if (!project) {
        throw new Error(`Project with ID '${importData.page.projectId}' not found`);
      }
      console.log("Project found:", {
        id: project.id,
        title: project.title,
      });
    }

    // Проверяем, что целевая страница существует, или создаем новую
    let targetPage = null;
    
    if (pageId) {
      // Пытаемся найти существующую страницу
      targetPage = await prisma.page.findUnique({
        where: { id: pageId },
        include: {
          viewport: true,
        },
      });
    }

    if (!targetPage) {
      // Создаем новую страницу на основе данных экспорта
      if (!importData.page) {
        throw new Error("Cannot create new page: missing page data in import");
      }

      console.log("Creating new page from import data:", {
        title: importData.page.title,
        url: importData.page.url,
      });

      // Создаем viewport если его нет
      let viewportId = importData.page.viewport?.id;
      if (!viewportId) {
        const viewport = await prisma.viewPort.create({
          data: {
            title: importData.page.viewport?.title || "DESKTOP",
            width: importData.page.viewport?.width || 1920,
            height: importData.page.viewport?.height || 1080,
          },
        });
        viewportId = viewport.id;
      } else {
        // Проверяем, существует ли viewport с таким ID
        const existingViewport = await prisma.viewPort.findUnique({
          where: { id: viewportId },
        });
        if (!existingViewport) {
          const viewport = await prisma.viewPort.create({
            data: {
              title: importData.page.viewport?.title || "DESKTOP",
              width: importData.page.viewport?.width || 1920,
              height: importData.page.viewport?.height || 1080,
            },
          });
          viewportId = viewport.id;
        }
      }

      // Создаем новую страницу
      targetPage = await prisma.page.create({
        data: {
          title: importData.page.title,
          url: importData.page.url,
          viewportId: viewportId,
          projectId: importData.page.projectId,
        },
        include: {
          viewport: true,
        },
      });

      console.log("New page created:", {
        id: targetPage.id,
        title: targetPage.title,
        url: targetPage.url,
      });
    } else {
      console.log("Using existing page:", {
        id: targetPage.id,
        title: targetPage.title,
        url: targetPage.url,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const importedData = {
        webElements: [],
        tests: [],
        errors: [],
      };

      // Если это существующая страница, очищаем предыдущие данные
      if (pageId) {
        console.log("Clearing existing data for page:", pageId);
        
        // Удаляем все шаги тестов
        await tx.step.deleteMany({
          where: {
            test: {
              pageId: targetPage.id
            }
          }
        });
        console.log("Deleted existing steps");

        // Удаляем все тесты
        await tx.test.deleteMany({
          where: {
            pageId: targetPage.id
          }
        });
        console.log("Deleted existing tests");

        // Удаляем все веб-элементы
        await tx.webElement.deleteMany({
          where: {
            pageId: targetPage.id
          }
        });
        console.log("Deleted existing web elements");
      }

      // Создаем маппинг старых ID на новые
      const webElementMapping = new Map();
      const actionMapping = new Map();

      // Импортируем веб-элементы
      console.log("Starting web elements import...");
      for (const elementData of importData.webElements) {
        try {
          console.log("Processing web element:", {
            id: elementData.id,
            title: elementData.title,
            selector: elementData.selector,
          });

          // Создаем новый элемент (старые уже удалены)
          const newElement = await tx.webElement.create({
            data: {
              title: elementData.title,
              selector: elementData.selector,
              fromEnv: elementData.fromEnv,
              pageId: targetPage.id,
            },
          });

          webElementMapping.set(elementData.id, newElement.id);
          importedData.webElements.push({
            oldId: elementData.id,
            newId: newElement.id,
            title: newElement.title,
            status: "created",
          });
          console.log("Created new web element:", newElement.id);
        } catch (error) {
          console.error("Error importing web element:", error);
          importedData.errors.push({
            type: "webElement",
            oldId: elementData.id,
            error: error.message,
          });
        }
      }

      console.log("Web elements import completed. Mapping:", Object.fromEntries(webElementMapping));

      // Импортируем тесты
      console.log("Starting tests import...");
      for (const testData of importData.tests) {
        try {
          console.log("Processing test:", {
            id: testData.id,
            title: testData.title,
            stepsCount: testData.steps?.length || 0,
          });

          // Создаем новый тест (старые уже удалены)
          const newTest = await tx.test.create({
            data: {
              title: testData.title,
              pageId: targetPage.id,
            },
          });
          const testId = newTest.id;
          console.log("Created new test:", testId);

          // Импортируем шаги теста
          const importedSteps = [];
          console.log("Importing steps for test:", testId);
          for (const stepData of testData.steps) {
            try {
              console.log("Processing step:", {
                id: stepData.id,
                value: stepData.value,
                webElementId: stepData.webElement.id,
                actionName: stepData.action.name,
              });

              const newWebElementId = webElementMapping.get(stepData.webElement.id);
              if (!newWebElementId) {
                throw new Error(`Web element not found: ${stepData.webElement.id}`);
              }

              // Проверяем, существует ли действие
              let actionId = stepData.action.id;
              const existingAction = await tx.WebElementActions.findFirst({
                where: { name: stepData.action.name },
              });

              if (!existingAction) {
                // Создаем действие, если его нет
                const newAction = await tx.WebElementActions.create({
                  data: {
                    name: stepData.action.name,
                    withValue: stepData.action.withValue,
                  },
                });
                actionId = newAction.id;
                actionMapping.set(stepData.action.id, newAction.id);
                console.log("Created new action:", newAction.id);
              } else {
                // Используем существующее действие
                actionId = existingAction.id;
                actionMapping.set(stepData.action.id, existingAction.id);
                console.log("Using existing action:", existingAction.id);
              }

              const newStep = await tx.step.create({
                data: {
                  value: stepData.value,
                  testId: testId,
                  webElementId: newWebElementId,
                  actionId: actionId,
                },
              });

              importedSteps.push({
                oldId: stepData.id,
                newId: newStep.id,
                status: "created",
              });
              console.log("Created new step:", newStep.id);
            } catch (error) {
              console.error("Error importing step:", error);
              importedData.errors.push({
                type: "step",
                testId: testId,
                oldStepId: stepData.id,
                error: error.message,
              });
            }
          }

          importedData.tests.push({
            oldId: testData.id,
            newId: testId,
            title: testData.title,
            steps: importedSteps,
            status: "created",
          });
          console.log("Test import completed:", testId);
        } catch (error) {
          console.error("Error importing test:", error);
          importedData.errors.push({
            type: "test",
            oldId: testData.id,
            error: error.message,
          });
        }
      }

      console.log("Import transaction completed. Results:", {
        webElements: importedData.webElements.length,
        tests: importedData.tests.length,
        errors: importedData.errors.length,
      });

      return importedData;
    });

    return {
      success: true,
      importedData: result,
      pageInfo: {
        id: targetPage.id,
        title: targetPage.title,
        url: targetPage.url,
        wasCreated: !pageId, // true если страница была создана
      },
      summary: {
        totalWebElements: importData.webElements.length,
        totalTests: importData.tests.length,
        importedWebElements: result.webElements.length,
        importedTests: result.tests.length,
        errors: result.errors.length,
      },
    };
  } catch (error) {
    console.error("Error importing page tests:", error);
    console.error("Import data structure:", {
      pageId,
      hasWebElements: !!importData.webElements,
      hasTests: !!importData.tests,
      webElementsCount: importData.webElements?.length || 0,
      testsCount: importData.tests?.length || 0,
    });
    throw error;
  }
};

/**
 * Получение статистики импорта/экспорта для страницы
 * @param {string} pageId - ID страницы
 * @returns {Promise<Object>} - Статистика страницы
 */
const getPageExportStats = async (pageId) => {
  try {
    const stats = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        _count: {
          select: {
            WebElement: true,
            Test: true,
          },
        },
        Test: {
          include: {
            _count: {
              select: {
                Step: true,
              },
            },
          },
        },
      },
    });

    if (!stats) {
      throw new Error("Page not found");
    }

    const totalSteps = stats.Test.reduce((sum, test) => sum + test._count.Step, 0);

    return {
      pageId: stats.id,
      pageTitle: stats.title,
      webElementsCount: stats._count.WebElement,
      testsCount: stats._count.Test,
      totalStepsCount: totalSteps,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting page export stats:", error);
    throw error;
  }
};

module.exports = {
  exportPageTests,
  importPageTests,
  getPageExportStats,
}; 