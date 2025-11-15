const express = require("express");
const router = express.Router();
const {
  createViewPort,
  getViewPortById,
  updateViewPort,
  deleteViewPort,
  getAllViewPorts,
} = require("../../services/viewPortService");

/**
 * Создание нового вьюпорта.
 * @route POST /api/viewports
 * @param {string} title - Название вьюпорта.
 * @param {string} type - Тип вьюпорта (DEFAULT или CUSTOM).
 * @param {number} width - Ширина вьюпорта.
 * @param {number} height - Высота вьюпорта.
 * @param {string} projectId - ID проекта, к которому привязан вьюпорт.
 * @returns {Object} - Созданный вьюпорт.
 */
// router.post('/', async (req, res) => {
//   const { title, type, width, height, projectId } = req.body;

//   if (!title || !type || !width || !height || !projectId) {
//     return res.status(400).json({ error: 'All fields are required' });
//   }

//   try {
//     const viewPort = await createViewPort(title, type, width, height, projectId);
//     res.status(201).json(viewPort);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create viewport' });
//   }
// });

/**
 * Получение всех вьюпортов.
 * @route GET /api/viewports/get_all
 */
router.get("/get_all", async (req, res) => {
  const { viewPortId } = req.params;

  try {
    const viewPort = await getAllViewPorts(viewPortId);
    if (!viewPort) {
      return res.status(404).json({ error: "Viewport not found" });
    }
    res.status(200).json(viewPort);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch viewport" });
  }
});

/**
 * Получение информации о вьюпорте по ID.
 * @route GET /api/viewports/:viewPortId
 * @param {string} viewPortId - ID вьюпорта.
 * @returns {Object} - Найденный вьюпорт.
 */
// router.get('/:viewPortId', async (req, res) => {
//   const { viewPortId } = req.params;

//   try {
//     const viewPort = await getViewPortById(viewPortId);
//     if (!viewPort) {
//       return res.status(404).json({ error: 'Viewport not found' });
//     }
//     res.status(200).json(viewPort);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch viewport' });
//   }
// });

/**
 * Получение всех вьюпортов для проекта.
 * @route GET /api/viewports/project/:projectId
 * @param {string} projectId - ID проекта.
 * @returns {Array} - Список вьюпортов.
 */
// router.get('/project/:projectId', async (req, res) => {
//     const { projectId } = req.params;

//     try {
//       const viewPorts = await getViewPortsByProjectId(projectId);
//       res.status(200).json(viewPorts);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to fetch viewports' });
//     }
//   });

/**
 * Обновление данных вьюпорта.
 * @route PUT /api/viewports/:viewPortId
 * @param {string} viewPortId - ID вьюпорта.
 * @param {Object} data - Данные для обновления (title, type, width, height).
 * @returns {Object} - Обновленный вьюпорт.
 */
// router.put('/:viewPortId', async (req, res) => {
//   const { viewPortId } = req.params;
//   const { title, type, width, height } = req.body;

//   if (!title && !type && !width && !height) {
//     return res.status(400).json({ error: 'At least one field is required' });
//   }

//   try {
//     const viewPort = await updateViewPort(viewPortId, { title, type, width, height });
//     res.status(200).json(viewPort);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update viewport' });
//   }
// });

/**
 * Удаление вьюпорта по ID.
 * @route DELETE /api/viewports/:viewPortId
 * @param {string} viewPortId - ID вьюпорта.
 * @returns {Object} - Удаленный вьюпорт.
 */
// router.delete('/:viewPortId', async (req, res) => {
//   const { viewPortId } = req.params;

//   try {
//     const viewPort = await deleteViewPort(viewPortId);
//     res.status(200).json(viewPort);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete viewport' });
//   }
// });

module.exports = router;
