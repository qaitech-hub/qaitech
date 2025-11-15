const { fetchHtml } = require("./ai/htmlService");
const { processHtml } = require("./ai/aiParserService");
const { isLlmConfigValid } = require("./ai/llmConfigService");

/**
 * Парсит элементы с URL через внутренний AI сервис
 * @param {string} url - URL для парсинга
 * @param {string|Object} deviceTypeOrViewport - Тип устройства (DESKTOP, MOBILE, TABLET) или объект viewport с width/height
 * @returns {Promise<Array>} - Распарсенные элементы
 */
const parseFromUrl = async (url, deviceTypeOrViewport = "DESKTOP") => {
  if (!isLlmConfigValid()) {
    throw new Error("LLM configuration is not set. Please configure LLM using POST /api/llm/config");
  }

  console.log("Using internal AI parser for URL:", { url, deviceTypeOrViewport });
  const html = await fetchHtml(url, deviceTypeOrViewport);
  const result = await processHtml(html);
  return result?.elements || [];
};

/**
 * Парсит элементы из HTML файла через внутренний AI сервис
 * @param {string} htmlContent - HTML контент
 * @returns {Promise<Array>} - Распарсенные элементы
 */
const parseFromHtml = async (htmlContent) => {
  if (!isLlmConfigValid()) {
    throw new Error("LLM configuration is not set. Please configure LLM using POST /api/llm/config");
  }

  console.log("Using internal AI parser for HTML:", { htmlLength: htmlContent.length });
  const result = await processHtml(htmlContent);
  return result?.elements || [];
};

/**
 * Парсит элементы с URL используя кастомный парсер (оставлен для совместимости)
 * @param {string} url - URL для парсинга
 * @param {string} deviceType - Тип устройства (DESKTOP, MOBILE, TABLET)
 * @returns {Promise<Array>} - Распарсенные элементы
 */
const parseFromUrlCustom = async (url, deviceType = "DESKTOP") => {
  // Используем стандартный парсер из parserService
  const { parseFromUrl: parseFromUrlStandard } = require("./parserService");
  return await parseFromUrlStandard(url, deviceType);
};

/**
 * Парсит элементы из HTML файла используя кастомный парсер (оставлен для совместимости)
 * @param {string} htmlContent - HTML контент
 * @returns {Promise<Array>} - Распарсенные элементы
 */
const parseFromHtmlCustom = async (htmlContent) => {
  // Используем стандартный парсер из parserService
  const { parseFromHtml: parseFromHtmlStandard } = require("./parserService");
  return parseFromHtmlStandard(htmlContent);
};

module.exports = {
  parseFromUrl,
  parseFromHtml,
  parseFromUrlCustom,
  parseFromHtmlCustom,
}; 