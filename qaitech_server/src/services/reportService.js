const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Создает новый отчет.
 * @param {string} testId - ID теста.
 * @param {boolean} status - Статус выполнения теста (true/false).
 * @returns {Promise<Object>} - Созданный отчет.
 */
const createReport = async (testId, status, executionTime) => {
  try {
    const report = await prisma.report.create({
      data: {
        testId,
        status,
        executionTime,
      },
    });
    return report;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

/**
 * Получает отчет по ID, включая шаги и скриншоты.
 * @param {string} reportId - ID отчета.
 * @returns {Promise<Object>} - Найденный отчет с шагами и скриншотами.
 */
const getReportById = async (reportId) => {
  try {
    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      include: {
        ReportStep: {
          include: {
            Screenshot: true,
          },
        },
      },
    });
    return report;
  } catch (error) {
    console.error("Error fetching report:", error);
    throw error;
  }
};

/**
 * Получает все отчеты для указанного теста, включая шаги и скриншоты.
 * @param {string} testId - ID теста.
 * @returns {Promise<Array>} - Список отчетов с шагами и скриншотами.
 */
const getReportsByTestId = async (id) => {
  try {
    const reports = await prisma.report.findUnique({
      where: {
        id,
      },
      include: {
        ReportStep: {
          include: {
            Screenshot: true,
            report: {
              include: {
                test: {
                  include: {
                    page: {
                      include: {
                        viewport: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        test: true,
      },
    });
    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

/**
 * Получает все отчеты для указанного воркспейса, группиря по дате.
 * @param {string} workspaceId - ID воркспейса.
 * @returns {Promise<Array>} - Список отчетов с шагами и скриншотами.
 */
const getReportsGroupedBy = async (workspaceId) => {
  try {
    // Получаем все нужные данные обычным SELECT
    const data = await prisma.$queryRaw`
      SELECT 
        DATE(r."createdAt") AS day,
        p.id as page_id,
        p.title as page_title,
        p.deleted as page_deleted,
        v.id as viewport_id,
        v.title as viewport_title,
        r.id as report_id,
        r."createdAt" as report_createdAt,
        r.status as report_status,
        t.id as test_id,
        t.title as test_title
      FROM "reports" r
      JOIN "tests" t ON r."testId" = t.id
      JOIN "pages" p ON t."pageId" = p.id
      JOIN "ViewPort" v ON p."viewportId" = v.id
      WHERE p."projectId" = ${workspaceId}
      ORDER BY day DESC, p.title, r."createdAt" DESC
    `;

    // Группируем по дню
    const groupedByDay = {};
    for (const row of data) {
      if (!groupedByDay[row.day]) groupedByDay[row.day] = {};
      const pages = groupedByDay[row.day];
      if (!pages[row.page_title]) {
        pages[row.page_title] = {
          id: row.page_id,
          title: row.page_title,
          viewport: {
            id: row.viewport_id,
            title: row.viewport_title,
          },
          reports: [],
          deleted: row.page_deleted,
        };
      }
      // Добавляем отчет
      pages[row.page_title].reports.push({
        id: row.report_id,
        createdAt: row.report_createdAt,
        status: row.report_status,
        test: {
          id: row.test_id,
          title: row.test_title,
        },
        deleted: row.page_deleted,
      });
    }
    // Формируем итоговый массив
    const groupedPages = Object.entries(groupedByDay).map(
      ([day, pagesObj]) => ({
        day,
        pages: Object.values(pagesObj).reverse(),
      })
    );
    return groupedPages;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

module.exports = {
  createReport,
  getReportById,
  getReportsByTestId,
  getReportsGroupedBy,
};
