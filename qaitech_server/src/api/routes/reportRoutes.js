const express = require("express");
const router = express.Router();
const {
  createReport,
  getReportById,
  getReportsByTestId,
  getReportsGroupedBy,
} = require("../../services/reportService");

/**
 * Создание нового отчета.
 * @route POST /api/reports
 * @param {string} testId - ID теста.
 * @param {boolean} status - Статус выполнения теста.
 * @returns {Object} - Созданный отчет.
 */
router.post("/", async (req, res) => {
  const { testId, status, executionTime } = req.body;

  if (!testId || status === undefined || executionTime === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const report = await createReport(testId, status, executionTime);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to create report" });
  }
});

/**
 * Получение информации о отчете по ID.
 * @route GET /api/reports/:reportId
 * @param {string} reportId - ID отчета.
 * @returns {Object} - Найденный отчет.
 */
router.get("/:reportId", async (req, res) => {
  const { reportId } = req.params;

  try {
    const report = await getReportById(reportId);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

/**
 * Получение всех отчетов для теста.
 * @route GET /api/reports/test/:testId
 * @param {string} testId - ID теста.
 * @returns {Array} - Список отчетов.
 */
router.get("/report/:reportId", async (req, res) => {
  const { reportId } = req.params;

  console.log(reportId);

  try {
    const reports = await getReportsByTestId(reportId);
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

/**
 * Получение всех отчетов для воркспейса.
 * @route GET /api/reports/allreports/:workspaceId
 */
router.get("/allreports/:workspaceId", async (req, res) => {
  const { workspaceId } = req.params;

  try {
    const reports = await getReportsGroupedBy(workspaceId);
    res.status(200).json({ success: "Success", reports });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

module.exports = router;
