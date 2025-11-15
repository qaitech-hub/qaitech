const express = require('express');
const router = express.Router();
const {
  createReportStep,
  getReportStepById,
  getReportStepsByReportId,
} = require('../../services/reportStepService');

/**
 * Создание нового шага отчета.
 * @route POST /api/reportsteps
 * @param {string} value - Описание шага.
 * @param {string} reportId - ID отчета.
 * @param {boolean} status - Статус выполнения шага.
 * @returns {Object} - Созданный шаг отчета.
 */
router.post('/', async (req, res) => {
  const { value, reportId, status } = req.body;

  if (!value || !reportId || status === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const reportStep = await createReportStep(value, reportId, status);
    res.status(201).json(reportStep);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create report step' });
  }
});

/**
 * Получение информации о шаге отчета по ID.
 * @route GET /api/reportsteps/:reportStepId
 * @param {string} reportStepId - ID шага отчета.
 * @returns {Object} - Найденный шаг отчета.
 */
router.get('/:reportStepId', async (req, res) => {
  const { reportStepId } = req.params;

  try {
    const reportStep = await getReportStepById(reportStepId);
    if (!reportStep) {
      return res.status(404).json({ error: 'Report step not found' });
    }
    res.status(200).json(reportStep);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report step' });
  }
});

/**
 * Получение всех шагов отчета для указанного отчета.
 * @route GET /api/reportsteps/report/:reportId
 * @param {string} reportId - ID отчета.
 * @returns {Array} - Список шагов отчета.
 */
router.get('/report/:reportId', async (req, res) => {
  const { reportId } = req.params;

  try {
    const reportSteps = await getReportStepsByReportId(reportId);
    res.status(200).json(reportSteps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report steps' });
  }
});

module.exports = router;