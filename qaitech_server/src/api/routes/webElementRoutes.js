const express = require("express");
const {
  parseWebElements,
  parseWebElementsAndDontSave,
} = require("../../utils/webElementParser");
const router = express.Router();
const {
  createWebElement,
  getWebElementById,
  getWebElementsByPageId,
  updateWebElement,
  deleteWebElement,
  getWebElementsByPageId_Env,
  createWebElement_Env,
} = require("../../services/webElementService");
const multer = require("multer");
const upload = multer();

/**
 * Создание нового веб-элемента.
 * @route POST /api/webelements
 * @param {string} title - Название веб-элемента.
 * @param {string} selector - Селектор веб-элемента.
 * @param {string} pageId - ID страницы, к которой привязан веб-элемент.
 * @returns {Object} - Созданный веб-элемент.
 */
router.post("/", async (req, res) => {
  const { title, selector, pageId } = req.body;

  if (!title || !selector || !pageId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const webElement = await createWebElement(title, selector, pageId);
    res.status(201).json(webElement);
  } catch (error) {
    res.status(500).json({ error: "Failed to create web element" });
  }
});

/**
 * POST /api/parse-elements
 * Запуск парсера веб-элементов с учетом ширины и высоты
 */
router.post("/parse-elements", async (req, res) => {
  const { pageUrl, pageId, width, height } = req.body;

  if (!pageUrl || !pageId) {
    return res.status(400).json({ error: "pageUrl and pageId are required" });
  }

  try {
    await parseWebElements(pageUrl, pageId, width, height); // Передаем width и height
    res.json({ message: "Парсинг завершен успешно" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при парсинге веб-элементов" });
  }
});

/**
 * Получение информации о веб-элементе по ID.
 * @route GET /api/webelements/:webElementId
 * @param {string} webElementId - ID веб-элемента.
 * @returns {Object} - Найденный веб-элемент.
 */
router.get("/:webElementId", async (req, res) => {
  const { webElementId } = req.params;

  try {
    const webElement = await getWebElementById(webElementId);
    if (!webElement) {
      return res.status(404).json({ error: "Web element not found" });
    }
    res.status(200).json(webElement);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch web element" });
  }
});

/**
 * Получение всех веб-элементов для страницы.
 * @route GET /api/webelements/page/:pageId
 * @param {string} pageId - ID страницы.
 * @returns {Array} - Список веб-элементов.
 */
router.get("/page/:pageId", async (req, res) => {
  const { pageId } = req.params;

  try {
    const webElements = await getWebElementsByPageId(pageId);
    res.status(200).json(webElements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch web elements" });
  }
});

/**
 * Получение всех веб-элементов для страницы, созданных в Environment.
 * @route GET /api/webelements/page/:pageId
 * @param {string} pageId - ID страницы.
 * @returns {Array} - Список веб-элементов.
 */
router.get("/page/env/:pageId", async (req, res) => {
  const { pageId } = req.params;

  try {
    const webElements = await getWebElementsByPageId_Env(pageId);
    res.status(200).json(webElements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch web elements" });
  }
});

/**
 * Создание веб-элементов для страницы в Environment.
 * @route GET /api/webelements/page/:pageId
 * @param {string} pageId - ID страницы.
 * @returns {Array} - Список веб-элементов.
 */
router.post("/page/env/create/:pageId", async (req, res) => {
  const { pageId } = req.params;
  const { elements } = req.body;

  if (elements === null) {
    res.status(500).json({ error: "Failed to create web elements" });
    return;
  }

  if (
    elements?.length > 0 &&
    elements.find((i) => i?.title === "" || i?.selector === "")
  ) {
    res.status(500).json({ error: "All fields are required" });
    return;
  }

  try {
    await createWebElement_Env(pageId, elements);
    res.status(200).json({ success: "Success" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create web elements" });
  }
});

/**
 * Обновление данных веб-элемента.
 * @route PUT /api/webelements/:webElementId
 * @param {string} webElementId - ID веб-элемента.
 * @param {Object} data - Данные для обновления (title, selector).
 * @returns {Object} - Обновленный веб-элемент.
 */
router.put("/:webElementId", async (req, res) => {
  const { webElementId } = req.params;
  const { title, selector } = req.body;

  if (!title && !selector) {
    return res.status(400).json({ error: "At least one field is required" });
  }

  try {
    const webElement = await updateWebElement(webElementId, {
      title,
      selector,
    });
    res.status(200).json(webElement);
  } catch (error) {
    res.status(500).json({ error: "Failed to update web element" });
  }
});

/**
 * Удаление веб-элемента по ID.
 * @route DELETE /api/webelements/:webElementId
 * @param {string} webElementId - ID веб-элемента.
 * @returns {Object} - Удаленный веб-элемент.
 */
router.delete("/:webElementId", async (req, res) => {
  const { webElementId } = req.params;

  try {
    const webElement = await deleteWebElement(webElementId);
    res.status(200).json(webElement);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete web element" });
  }
});

router.post("/add_new_elements", upload.any(), async (req, res) => {
  // Получаем файл (если был передан)
  const newFile = req.files?.find((f) => f.fieldname === "file");

  // Основные данные
  const pageData = {
    url: req.body.url,
    pageId: req.body.pageId,
    isAi: req.body.isAi === "true", // Конвертируем в boolean
    viewport: req.body.viewport,
    file: newFile
      ? {
          originalname: newFile.originalname,
          buffer: newFile.buffer,
          size: newFile.size,
          mimetype: newFile.mimetype,
        }
      : null,
  };

  const { url, pageId, isAi, file, viewport } = pageData;

  const elements = await getWebElementsByPageId(pageId);
  console.log("Обработанные данные:", pageData);

  try {
    const data = await parseWebElementsAndDontSave(
      url,
      pageId,
      viewport,
      isAi,
      file
    );
    if (!data)
      return res.status(500).json({
        error: "Failed to parse elements",
        details: err.message,
      });

    try {
      await createWebElement_Env(pageId, [...elements, ...data], true);
      return res.status(200).json({
        success: "Succees",
      });
    } catch (err) {
      return res.status(500).json({
        error: "Failed to save elements",
        details: err?.message,
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: "Failed to parse elements",
      details: err.message,
    });
  }

  res.status(200).json({ error: "true" });
});

module.exports = router;
