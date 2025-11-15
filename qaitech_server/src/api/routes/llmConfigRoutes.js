const express = require("express");
const {
  getConfig,
  updateConfig,
} = require("../../controllers/llmConfigController");

const router = express.Router();

// GET /api/llm/config - получить текущую конфигурацию
router.get("/llm/config", getConfig);

// POST /api/llm/config - обновить конфигурацию LLM
router.post("/llm/config", updateConfig);

// PUT /api/llm/config - обновить конфигурацию LLM (алиас)
router.put("/llm/config", updateConfig);

module.exports = router;

