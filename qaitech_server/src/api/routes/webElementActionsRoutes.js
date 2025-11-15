// src/api/routes/webElementActionsRoutes.js

const express = require('express');
const router = express.Router();
const prisma = require('../../db/db');

/**
 * GET /web-element-actions - Получение всех WebElementActions.
 */
router.get('/', async (req, res) => {
  try {
    // Выполняем запрос к сервису для получения всех действий
    const webElementActions = await prisma.WebElementActions.findMany();
    res.status(200).json(webElementActions);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении списка действий над веб-элементами.' });
  }
});

module.exports = router;