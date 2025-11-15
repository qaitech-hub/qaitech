const express = require('express');
const router = express.Router();
const {
  createStep,
  getStepById,
  getStepsByTestId,
  updateStep,
  deleteStep,
} = require('../../services/stepService');

/**
 * Создание нового шага.
 * @route POST /api/steps
 * @param {string} value - Описание шага.
 * @param {string} testId - ID теста, к которому привязан шаг.
 * @param {string} webElementId - ID веб-элемента, с которым связан шаг.
 * @param {string} actionId - ID действия, которое выполняется на шаге.
 * @returns {Object} - Созданный шаг.
 */
router.post('/', async (req, res) => {
  const { value, testId, webElementId, actionId } = req.body;

  if (!value || !testId || !webElementId || !actionId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const step = await createStep(value, testId, webElementId, actionId);
    res.status(201).json(step);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create step' });
  }
});

/**
 * Получение информации о шаге по ID.
 * @route GET /api/steps/:stepId
 * @param {string} stepId - ID шага.
 * @returns {Object} - Найденный шаг.
 */
router.get('/:stepId', async (req, res) => {
  const { stepId } = req.params;

  try {
    const step = await getStepById(stepId);
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }
    res.status(200).json(step);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch step' });
  }
});

/**
 * Получение всех шагов для теста.
 * @route GET /api/steps/test/:testId
 * @param {string} testId - ID теста.
 * @returns {Array} - Список шагов.
 */
router.get('/test/:testId', async (req, res) => {
  const { testId } = req.params;

  try {
    const steps = await getStepsByTestId(testId);
    res.status(200).json(steps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch steps' });
  }
});

/**
 * Обновление данных шага.
 * @route PUT /api/steps/:stepId
 * @param {string} stepId - ID шага.
 * @param {Object} data - Данные для обновления (value, webElementId, actionId).
 * @returns {Object} - Обновленный шаг.
 */
router.put('/:stepId', async (req, res) => {
  const { stepId } = req.params;
  const { value, webElementId, actionId } = req.body;

  if (!value && !webElementId && !actionId) {
    return res.status(400).json({ error: 'At least one field is required' });
  }

  try {
    const step = await updateStep(stepId, { value, webElementId, actionId });
    res.status(200).json(step);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update step' });
  }
});

/**
 * Удаление шага по ID.
 * @route DELETE /api/steps/:stepId
 * @param {string} stepId - ID шага.
 * @returns {Object} - Удаленный шаг.
 */
router.delete('/:stepId', async (req, res) => {
  const { stepId } = req.params;

  try {
    const step = await deleteStep(stepId);
    res.status(200).json(step);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete step' });
  }
});

module.exports = router;