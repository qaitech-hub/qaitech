const {
  updateLlmConfig,
  getLlmConfig,
  isLlmConfigValid,
} = require("../services/ai/llmConfigService");
const logger = require("../utils/logger");

/**
 * Получить текущую конфигурацию LLM
 */
exports.getConfig = async (req, res, next) => {
  try {
    const config = getLlmConfig();
    const isValid = isLlmConfigValid();

    res.json({
      ...config,
      apiKey: config.apiKey ? "***" : null, // Скрываем токен в ответе
      isValid,
    });
  } catch (error) {
    logger.error("Error getting LLM config:", error);
    next(error);
  }
};

/**
 * Обновить конфигурацию LLM
 * Body: { apiKey?, modelName?, apiBaseUrl? }
 * Headers: Authorization: Bearer <LLM_CONFIG_TOKEN> (опционально, если установлен в env)
 */
exports.updateConfig = async (req, res, next) => {
  try {
    // Проверка токена авторизации (если установлен)
    const expectedToken = process.env.LLM_CONFIG_TOKEN;
    if (expectedToken) {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error:
            "Authorization token required. Use: Authorization: Bearer <token>",
        });
      }

      const providedToken = authHeader.substring(7);
      if (providedToken !== expectedToken) {
        return res.status(403).json({
          error: "Invalid authorization token",
        });
      }
    }

    const { apiKey, modelName, apiBaseUrl } = req.body;

    // Валидация обязательных полей при первом создании
    const currentConfig = getLlmConfig();
    const isFirstSetup = !isLlmConfigValid();

    if (isFirstSetup) {
      if (!apiKey) {
        return res.status(400).json({
          error: "apiKey is required for initial setup",
        });
      }
      if (!modelName) {
        return res.status(400).json({
          error: "modelName is required for initial setup",
        });
      }
      if (!apiBaseUrl) {
        return res.status(400).json({
          error: "apiBaseUrl is required for initial setup",
        });
      }
    }

    // Валидация URL
    if (apiBaseUrl) {
      try {
        new URL(apiBaseUrl);
      } catch {
        return res.status(400).json({
          error: "Invalid apiBaseUrl format",
        });
      }
    }

    const updatedConfig = await updateLlmConfig({
      apiKey: apiKey === "***" ? currentConfig.apiKey : apiKey,
      modelName,
      apiBaseUrl,
    });

    // Проверяем, что после обновления конфигурация валидна
    if (!isLlmConfigValid()) {
      return res.status(400).json({
        error:
          "Configuration is incomplete. apiKey, modelName, and apiBaseUrl are required",
        config: {
          ...updatedConfig,
          apiKey: updatedConfig.apiKey ? "***" : null,
        },
      });
    }

    res.json({
      message: "LLM configuration updated successfully",
      config: {
        ...updatedConfig,
        apiKey: "***", // Скрываем токен в ответе
      },
    });
  } catch (error) {
    logger.error("Error updating LLM config:", error);
    next(error);
  }
};
