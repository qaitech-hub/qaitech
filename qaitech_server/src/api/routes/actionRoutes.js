const express = require('express');
const router = express.Router();
const {
  getActionById,
  getAllActions,
} = require('../../services/actionService');

/**
 * Получение информации о действии по ID.
 * @route GET /api/actions/:actionId
 * @param {string} actionId - ID действия.
 * @returns {Object} - Найденное действие.
 */
router.get('/:actionId', async (req, res) => {
  const { actionId } = req.params;

  try {
    const action = await getActionById(actionId);
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }
    res.status(200).json(action);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch action' });
  }
});

/**
 * Получение всех действий.
 * @route GET /api/actions
 * @returns {Array} - Список действий.
 */
router.get('/', async (req, res) => {
  try {
    const actions = await getAllActions();
    res.status(200).json(actions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

module.exports = router;