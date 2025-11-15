const axios = require("axios");
const { getLlmConfig, isLlmConfigValid } = require('./llmConfigService');
const logger = require('../../utils/logger');

const SYSTEM_PROMPT = `
You are a senior QA automation engineer. Generate 3-10 comprehensive test scenarios that simulate real user flows.

IMPORTANT: Respond ONLY with valid JSON without any additional text, comments, or markdown formatting.

1. Scenario requirements:
- Each test must contain at least 2 logically connected steps
- Simulate real user behavior

2. Test design techniques:
- Equivalence classes: different valid/invalid values
- Boundary values: minimum/maximum allowable values
- Pairwise testing: combinations of related fields

3. Strict JSON response schema:
{
  "test_cases": [
    {
      "title": "Scenario description (what we are testing)",
      "steps": [
        {
          "value": "specific value for withValue=true, otherwise empty string",
          "webElementId": "element ID",
          "actionId": "action ID"
        }
      ]
    }
  ]
}

4. Prohibited:
- Creating tests with only one step
- Duplicating similar scenarios
- Ignoring element relationships
- Adding text outside the JSON structure

5. Critical requirements:
- Use only valid JSON
- Do not add markdown formatting
- Do not add comments or explanations
- Check for absence of trailing commas
- Escape special characters in strings
`.trim();

async function generateTests(elements, actions, customPrompt = null) {
  const requestId = Math.random().toString(36).substring(2, 8);
  const log = (message, data) => {
    logger.info(`[${requestId}] ${message}`, data);
  };

  try {
    // Проверяем, что LLM конфигурация настроена
    if (!isLlmConfigValid()) {
      throw new Error('LLM configuration is not set. Please configure LLM using POST /api/llm/config');
    }

    const llmConfig = getLlmConfig();
    // Проверяем, заканчивается ли URL на /chat/completions, чтобы не дублировать
    const apiUrl = llmConfig.apiBaseUrl.endsWith('/chat/completions') 
      ? llmConfig.apiBaseUrl 
      : `${llmConfig.apiBaseUrl.replace(/\/$/, '')}/chat/completions`;

    // Адаптируем SYSTEM_PROMPT с учетом кастомного промпта тестировщика
    let systemPrompt = SYSTEM_PROMPT;
    if (customPrompt && customPrompt.trim()) {
      systemPrompt += `\n\n6. Additional instructions from tester:\n${customPrompt.trim()}\n\nIMPORTANT: Follow these additional instructions while generating test scenarios.`;
    }

    const userPrompt = `Elements: ${JSON.stringify(
      elements
    )}\nActions: ${JSON.stringify(actions)}`;

    const requestData = {
      model: llmConfig.modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    };

    // Логирование запроса
    log("Sending request to LLM", {
      original_apiBaseUrl: llmConfig.apiBaseUrl,
      final_url: apiUrl,
      model: llmConfig.modelName,
      elements: elements.map((e) => e.id),
      actions: actions.map((a) => a.id),
      prompt_length: userPrompt.length,
      has_custom_prompt: !!customPrompt,
      has_api_key: !!llmConfig.apiKey,
    });

    const startTime = Date.now();
    let response;
    try {
      response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${llmConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 120000, // Увеличиваем timeout до 2 минут
        maxContentLength: Infinity, // Убираем лимит на размер ответа
        maxBodyLength: Infinity,
      });
    } catch (axiosError) {
      const errorDetails = {
        error: axiosError.message,
        code: axiosError.code,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        url: apiUrl,
        original_apiBaseUrl: llmConfig.apiBaseUrl,
        responseData: axiosError.response?.data,
        responseHeaders: axiosError.response?.headers,
      };
      
      log("Axios request failed", errorDetails);
      
      // Более информативное сообщение об ошибке для 404
      if (axiosError.response?.status === 404) {
        const errorMessage = 
          `LLM API endpoint not found (404). ` +
          `URL: "${apiUrl}". ` +
          `Original apiBaseUrl: "${llmConfig.apiBaseUrl}". ` +
          `Please verify the endpoint exists and the URL is correct. ` +
          `Response: ${JSON.stringify(axiosError.response?.data || 'No response data')}`;
        
        log("404 Error details", {
          fullUrl: apiUrl,
          apiBaseUrl: llmConfig.apiBaseUrl,
          model: llmConfig.modelName,
          responseData: axiosError.response?.data,
        });
        
        throw new Error(errorMessage);
      }
      
      throw axiosError;
    }

    const responseTime = Date.now() - startTime;

    // Логирование ответа
    log("Received response from LLM", {
      status: response.status,
      response_time_ms: responseTime,
      tokens_used: response.data.usage?.total_tokens,
      response_size: JSON.stringify(response.data).length,
    });

    // Подробное логирование тела ответа
    const responseContent = response.data.choices[0]?.message?.content;
    log("API Response content sample", {
      first_500_chars:
        responseContent?.substring(0, 500) +
        (responseContent?.length > 500 ? "..." : ""),
      total_length: responseContent?.length,
    });

    // Очистка и валидация JSON
    let cleanedContent = responseContent;
    
    // Удаляем возможные лишние символы в начале и конце
    if (cleanedContent) {
      cleanedContent = cleanedContent.trim();
      // Удаляем возможные markdown блоки
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
    }

    // Валидация JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedContent);
      log("Parsed response", {
        test_cases_count: parsedResponse.test_cases?.length,
      });
    } catch (parseError) {
      log("JSON parsing failed", {
        error: parseError.message,
        invalid_json: cleanedContent?.substring(0, 1000),
        original_length: responseContent?.length,
        cleaned_length: cleanedContent?.length,
      });
      
      // Попытка найти начало JSON объекта
      const jsonStart = cleanedContent.indexOf('{');
      if (jsonStart !== -1) {
        const potentialJson = cleanedContent.substring(jsonStart);
        try {
          parsedResponse = JSON.parse(potentialJson);
          log("Successfully parsed JSON after finding start", {
            test_cases_count: parsedResponse.test_cases?.length,
          });
        } catch (secondParseError) {
          log("Second JSON parsing attempt failed", {
            error: secondParseError.message,
            potential_json: potentialJson.substring(0, 500),
          });
          throw new Error("Invalid JSON response from API");
        }
      } else {
        throw new Error("Invalid JSON response from API");
      }
    }

    if (!parsedResponse.test_cases) {
      log("Invalid response structure", { parsedResponse });
      throw new Error("Missing test_cases in response");
    }

    return parsedResponse;
  } catch (error) {
    log("Test generation failed", {
      error: error.message,
      stack: error.stack,
    });
    throw new Error(`Test generation failed: ${error.message}`);
  }
}

module.exports = { generateTests };

