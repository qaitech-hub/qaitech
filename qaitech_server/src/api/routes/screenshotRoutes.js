const express = require('express');
const router = express.Router();
const {
  createScreenshot,
  getScreenshotById,
} = require('../../services/screenshotService');

/**
 * Создание нового скриншота.
 * @route POST /api/screenshots
 * @param {string} data - Данные скриншота (base64 или URL).
 * @param {string} reportStepId - ID шага отчета.
 * @returns {Object} - Созданный скриншот.
 */
router.post('/', async (req, res) => {
  const { data, reportStepId } = req.body;

  if (!data || !reportStepId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const screenshot = await createScreenshot(data, reportStepId);
    res.status(201).json(screenshot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create screenshot' });
  }
});

/**
 * Получение информации о скриншоте по ID.
 * @route GET /api/screenshots/:screenshotId
 * @param {string} screenshotId - ID скриншота.
 * @returns {Object} - Найденный скриншот.
 */
router.get('/:screenshotId', async (req, res) => {
  const { screenshotId } = req.params;

  try {
    const screenshot = await getScreenshotById(screenshotId);
    if (!screenshot) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }
    res.status(200).json(screenshot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch screenshot' });
  }
});

module.exports = router;