const logger = require('../../utils/logger');
const prisma = require('../../db/db');

// Кэш конфигурации в памяти для быстрого доступа
let llmConfigCache = null;
let cacheInitialized = false;

/**
 * Инициализация конфигурации из БД при старте
 */
async function initializeConfig() {
  try {
    const config = await prisma.llmConfig.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    
    if (config) {
      llmConfigCache = {
        apiKey: config.apiKey,
        modelName: config.modelName,
        apiBaseUrl: config.apiBaseUrl
      };
      logger.info('LLM configuration loaded from database');
    } else {
      // Инициализация из env переменных, если есть
      llmConfigCache = {
        apiKey: process.env.LLM_API_KEY || null,
        modelName: process.env.LLM_MODEL_NAME || null,
        apiBaseUrl: process.env.LLM_API_BASE_URL || null
      };
      if (llmConfigCache.apiKey && llmConfigCache.modelName && llmConfigCache.apiBaseUrl) {
        // Сохраняем в БД, если есть env переменные
        await saveConfigToDb(llmConfigCache);
        logger.info('LLM configuration initialized from environment variables');
      }
    }
    cacheInitialized = true;
  } catch (error) {
    logger.error('Error initializing LLM config:', error);
    // Fallback на env переменные
    llmConfigCache = {
      apiKey: process.env.LLM_API_KEY || null,
      modelName: process.env.LLM_MODEL_NAME || null,
      apiBaseUrl: process.env.LLM_API_BASE_URL || null
    };
    cacheInitialized = true;
  }
}

/**
 * Сохранить конфигурацию в БД
 */
async function saveConfigToDb(config) {
  try {
    // Получаем существующую конфигурацию или создаем новую
    const existing = await prisma.llmConfig.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    if (existing) {
      await prisma.llmConfig.update({
        where: { id: existing.id },
        data: {
          apiKey: config.apiKey,
          modelName: config.modelName,
          apiBaseUrl: config.apiBaseUrl,
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.llmConfig.create({
        data: {
          apiKey: config.apiKey,
          modelName: config.modelName,
          apiBaseUrl: config.apiBaseUrl
        }
      });
    }
  } catch (error) {
    logger.error('Error saving LLM config to database:', error);
    throw error;
  }
}

/**
 * Получить текущую конфигурацию LLM
 */
function getLlmConfig() {
  if (!cacheInitialized) {
    logger.warn('LLM config cache not initialized, using fallback');
    return {
      apiKey: process.env.LLM_API_KEY || null,
      modelName: process.env.LLM_MODEL_NAME || null,
      apiBaseUrl: process.env.LLM_API_BASE_URL || null
    };
  }
  return { ...llmConfigCache };
}

/**
 * Обновить конфигурацию LLM
 * @param {Object} newConfig - Новая конфигурация { apiKey, modelName, apiBaseUrl }
 */
async function updateLlmConfig(newConfig) {
  // Обновляем кэш
  if (newConfig.apiKey !== undefined) {
    llmConfigCache.apiKey = newConfig.apiKey;
  }
  if (newConfig.modelName !== undefined) {
    llmConfigCache.modelName = newConfig.modelName;
  }
  if (newConfig.apiBaseUrl !== undefined) {
    llmConfigCache.apiBaseUrl = newConfig.apiBaseUrl;
  }

  // Сохраняем в БД
  await saveConfigToDb(llmConfigCache);
  
  logger.info('LLM configuration updated:', {
    modelName: llmConfigCache.modelName,
    apiBaseUrl: llmConfigCache.apiBaseUrl,
    hasApiKey: !!llmConfigCache.apiKey
  });
  
  return { ...llmConfigCache };
}

/**
 * Проверить, что конфигурация LLM полностью настроена
 */
function isLlmConfigValid() {
  if (!cacheInitialized) {
    // Проверяем env переменные как fallback
    return !!(process.env.LLM_API_KEY && process.env.LLM_MODEL_NAME && process.env.LLM_API_BASE_URL);
  }
  return !!(llmConfigCache?.apiKey && llmConfigCache?.modelName && llmConfigCache?.apiBaseUrl);
}

module.exports = {
  getLlmConfig,
  updateLlmConfig,
  isLlmConfigValid,
  initializeConfig
};

