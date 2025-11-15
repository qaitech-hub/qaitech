const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  parseFromUrl,
  parseFromHtml,
  parseFromUrlCustom,
  parseFromHtmlCustom,
} = require("../../services/webParserService");
const { fetchHtml } = require("../../services/ai/htmlService");
const { processHtml } = require("../../services/ai/aiParserService");
const { isLlmConfigValid } = require("../../services/ai/llmConfigService");

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Парсинг элементов с URL через внутренний AI парсер
 * @route POST /api/web-parser/internal/ai/url
 * @param {string} url - URL для парсинга
 * @param {string|Object} deviceTypeOrViewport - Тип устройства (DESKTOP, MOBILE, TABLET) или объект viewport с width/height
 * @returns {Array} - Распарсенные элементы
 */
router.post("/internal/ai/url", async (req, res) => {
  try {
    const { url, deviceType, viewport } = req.body;

    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    if (!isLlmConfigValid()) {
      return res.status(400).json({ 
        error: "LLM configuration is not set. Please configure LLM using POST /api/llm/config" 
      });
    }

    // Используем viewport если передан, иначе deviceType
    const deviceTypeOrViewport = viewport || deviceType || "DESKTOP";
    const html = await fetchHtml(url, deviceTypeOrViewport);
    const result = await processHtml(html);
    res.json(result?.elements || []);
  } catch (error) {
    console.error("Error in internal AI URL parsing:", error);
    res.status(500).json({
      error: "Failed to parse URL",
      details: error.message,
    });
  }
});

/**
 * Парсинг элементов из HTML файла через внутренний AI парсер
 * @route POST /api/web-parser/internal/ai/file
 * @param {string} htmlFile - HTML контент
 * @returns {Array} - Распарсенные элементы
 */
router.post("/internal/ai/file", async (req, res) => {
  try {
    const { htmlFile } = req.body;

    if (!htmlFile) {
      return res.status(400).json({ error: "htmlFile is required" });
    }

    if (!isLlmConfigValid()) {
      return res.status(400).json({ 
        error: "LLM configuration is not set. Please configure LLM using POST /api/llm/config" 
      });
    }

    const result = await processHtml(htmlFile);
    res.json(result?.elements || []);
  } catch (error) {
    console.error("Error in internal AI HTML parsing:", error);
    res.status(500).json({
      error: "Failed to parse HTML",
      details: error.message,
    });
  }
});

/**
 * Парсинг элементов с URL через AI парсер
 * @route POST /api/web-parser/ai/url
 * @param {string} url - URL для парсинга
 * @param {string|Object} deviceTypeOrViewport - Тип устройства (DESKTOP, MOBILE, TABLET) или объект viewport с width/height
 * @returns {Array} - Распарсенные элементы
 */
router.post("/ai/url", async (req, res) => {
  try {
    const { url, deviceType, viewport } = req.body;

    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    // Используем viewport если передан, иначе deviceType
    const deviceTypeOrViewport = viewport || deviceType || "DESKTOP";
    const elements = await parseFromUrl(url, deviceTypeOrViewport);
    res.json(elements);
  } catch (error) {
    console.error("Error in AI URL parsing:", error);
    res.status(500).json({
      error: "Failed to parse URL",
      details: error.message,
    });
  }
});

/**
 * Парсинг элементов из HTML файла через AI парсер
 * @route POST /api/web-parser/ai/file
 * @param {string} htmlFile - HTML контент
 * @returns {Array} - Распарсенные элементы
 */
router.post("/ai/file", async (req, res) => {
  try {
    const { htmlFile } = req.body;

    if (!htmlFile) {
      return res.status(400).json({ error: "htmlFile is required" });
    }

    const elements = await parseFromHtml(htmlFile);
    res.json(elements);
  } catch (error) {
    console.error("Error in AI HTML parsing:", error);
    res.status(500).json({
      error: "Failed to parse HTML",
      details: error.message,
    });
  }
});

/**
 * Парсинг элементов с URL через кастомный парсер
 * @route POST /api/web-parser/custom/url
 * @param {string} url - URL для парсинга
 * @param {string} deviceType - Тип устройства (DESKTOP, MOBILE, TABLET)
 * @returns {Array} - Распарсенные элементы
 */
router.post("/custom/url", async (req, res) => {
  try {
    const { url, deviceType = "DESKTOP" } = req.body;

    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    const elements = await parseFromUrlCustom(url, deviceType);
    res.json(elements);
  } catch (error) {
    console.error("Error in custom URL parsing:", error);
    res.status(500).json({
      error: "Failed to parse URL",
      details: error.message,
    });
  }
});

/**
 * Парсинг элементов из HTML файла через кастомный парсер
 * @route POST /api/web-parser/custom/file
 * @param {string} htmlFile - HTML контент
 * @returns {Array} - Распарсенные элементы
 */
router.post("/custom/file", async (req, res) => {
  try {
    const { htmlFile } = req.body;

    if (!htmlFile) {
      return res.status(400).json({ error: "htmlFile is required" });
    }

    const elements = await parseFromHtmlCustom(htmlFile);
    res.json(elements);
  } catch (error) {
    console.error("Error in custom HTML parsing:", error);
    res.status(500).json({
      error: "Failed to parse HTML",
      details: error.message,
    });
  }
});

/**
 * Проверка здоровья внутреннего AI парсера
 * @route GET /api/web-parser/health
 * @returns {Object} - Статус сервиса
 */
router.get("/health", async (req, res) => {
  try {
    const isValid = isLlmConfigValid();
    res.json({ 
      status: isValid ? "healthy" : "unconfigured", 
      message: isValid ? "Internal AI parser is ready" : "LLM configuration is not set",
      llmConfigured: isValid
    });
  } catch (error) {
    res.status(503).json({ 
      status: "error", 
      message: "Internal error",
      error: error.message 
    });
  }
});

module.exports = router; 