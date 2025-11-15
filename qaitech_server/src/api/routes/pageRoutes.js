const express = require("express");
const router = express.Router();
const {
  createPage,
  getPageById,
  getPagesByProjectId,
  updatePage,
  deletePage,
  renamePage,
} = require("../../services/pageService");
const { parseWebElements } = require("../../utils/webElementParser"); // Импортируем парсер

const multer = require("multer");
const upload = multer();

/**
 * Создание новой страницы и запуск парсера.
 * @route POST /api/pages
 * @param {string} title - Название страницы.
 * @param {string} url - URL страницы.
 * @param {number} viewport - viewport
 * @param {string} projectId - ID проекта, к которому привязана страница.
 * @returns {Object} - Созданная страница.
 */
router.post("/", upload.any(), async (req, res) => {
  let newViewport = {};
  try {
    if (req.body.viewport) {
      newViewport = JSON.parse(req.body.viewport);
    }
  } catch (e) {
    console.warn("Ошибка парсинга viewport:", e);
  }

  // Получаем файл (если был передан)
  const newFile = req.files?.find((f) => f.fieldname === "file");

  // Основные данные
  const pageData = {
    title: req.body.title,
    url: req.body.url,
    projectId: req.body.projectId,
    isAi: req.body.isAi === "true", // Конвертируем в boolean
    viewport: newViewport,
    file: newFile
      ? {
          originalname: newFile.originalname,
          buffer: newFile.buffer,
          size: newFile.size,
          mimetype: newFile.mimetype,
        }
      : null,
  };

  console.log("Обработанные данные:", pageData);

  const { title, url, projectId, isAi, viewport, file } = pageData;

  // Проверка обязательных полей
  if (!title || (!url && !file) || !projectId || !viewport?.id) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Создаем страницу
    const page = await createPage(title, url, viewport, projectId);
    // Запускаем парсер с теми же width и height
    try {
      await parseWebElements(url, page.id, page?.viewport?.title, isAi, file);
    } catch (err) {
      await deletePage(page?.id);
      return res.status(500).json({
        error: "Failed to create page or parse elements",
        details: err.message,
      });
    }

    return res.status(201).json({
      // page,
      message: "Page created successfully",
      success: "Success",
    });
  } catch (error) {
    console.error("Error creating page or parsing elements:", error);
    return res.status(500).json({
      error: "Failed to create page or parse elements",
      details: error.message,
    });
  }
});

/**
 * Получение информации о странице по ID.
 * @route GET /api/pages/:pageId
 * @param {string} pageId - ID страницы.
 * @returns {Object} - Найденная страница.
 */
router.get("/:pageId", async (req, res) => {
  const { pageId } = req.params;

  try {
    const page = await getPageById(pageId);
    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

/**
 * Получение всех страниц для проекта.
 * @route POST /api/pages/project/:projectId
 * @param {string} projectId - ID проекта.
 * @param {string} input - строка поиска.
 * @returns {Array} - Список страниц.
 */
router.post("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const { input } = req.body;

  try {
    const pages = await getPagesByProjectId(projectId, input);
    res.status(200).json(
      // pages?.sort((a, b) =>
      //   a.title > b.title ? 1 : b.title > a.title ? -1 : 0
      // )
      pages
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

/**
 * Обновление данных страницы.
 * @route PUT /api/pages/:pageId
 * @param {string} pageId - ID страницы.
 * @param {Object} data - Данные для обновления (title, url, width, height).
 * @returns {Object} - Обновленная страница.
 */
router.put("/:pageId", async (req, res) => {
  const { pageId } = req.params;
  const { title, url, width, height } = req.body;

  if (!title && !url && !width && !height) {
    return res.status(400).json({ error: "At least one field is required" });
  }

  try {
    const page = await updatePage(pageId, { title, url, width, height });
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ error: "Failed to update page" });
  }
});

/**
 * Удаление страницы по ID.
 * @route DELETE /api/pages/:pageId
 * @param {string} pageId - ID страницы.
 * @returns {Object} - Удаленная страница.
 */
router.delete("/:pageId", async (req, res) => {
  const { pageId } = req.params;

  try {
    const page = await deletePage(pageId);
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete page" });
  }
});

/**
 * Изменение title страницы
 * @route POST /api/pages/rename
 * @param {string} pageId - ID страницы.
 * @param {string} name - title страницы.
 * @returns {Object} - Удаленная страница.
 */
router.post("/rename", async (req, res) => {
  const { pageId, name } = req.body;

  try {
    const page = await renamePage(pageId, name);
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ error: "Failed to rename page" });
  }
});

module.exports = router;
