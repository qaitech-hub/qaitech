const axios = require('axios');
const { getLlmConfig, isLlmConfigValid } = require('./llmConfigService');
const { optimizeHtmlForAI } = require('./htmlService');
const logger = require('../../utils/logger');

const SYSTEM_PROMPT = `
You are an experienced test automation engineer specializing in Playwright. Your task is to thoroughly analyze the provided HTML code of a web page and identify all interactive elements that a user can interact with.

Task requirements:
1. Analyze only elements available for interaction (buttons, links, forms, inputs, etc.)
2. For each element, determine the most precise and stable selector
3. Prioritize selectors in order: role > text > data-testid > other attributes
4. Exclude duplicates and hidden elements (display:none, visibility:hidden)

Output format:
Provide the result as a valid JSON object with the following structure:
{
  "elements": [
    {
      "title": "Human-readable element name",
      "selector": "optimal_selector",
      "type": "element_type (button, link, input, etc.)",
      "recommendedAction": "suggested action (click, fill, check, etc.)"
    }
  ]
}

Additional instructions:
- Maintain JSON validity of the response
- If no elements are found, return an empty array
- Leave comments and explanations only in the special "notes" field if necessary
`.trim();

const processHtml = async (html) => {
  if (!html || typeof html !== 'string') {
    logger.error('Invalid HTML content:', html);
    throw new Error('Invalid HTML content');
  }

  // Проверяем, что LLM конфигурация настроена
  if (!isLlmConfigValid()) {
    throw new Error('LLM configuration is not set. Please configure LLM using POST /api/llm/config');
  }

  // Оптимизируем HTML для экономии токенов
  const originalLength = html.length;
  const optimizedHtml = optimizeHtmlForAI(html);
  const optimizedLength = optimizedHtml.length;
  
  logger.info(`HTML optimization: ${originalLength} -> ${optimizedLength} chars (${Math.round((1 - optimizedLength/originalLength) * 100)}% reduction)`);

  const llmConfig = getLlmConfig();
  const prompt = buildPrompt(optimizedHtml);
  
  // Используем не-streaming режим для стабильности (как в testGeneratorService)
  const response = await queryGPT(prompt, llmConfig);

  return response;
};

function buildPrompt(html) {
  return {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `${html}` }
    ],
    temperature: 0.1,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  };
}

/**
 * Запрос к OpenAI-совместимому API в не-streaming режиме (для стабильности)
 */
async function queryGPT(prompt, llmConfig) {
  try {
    // Формируем URL
    const apiUrl = llmConfig.apiBaseUrl.endsWith('/chat/completions') 
      ? llmConfig.apiBaseUrl 
      : `${llmConfig.apiBaseUrl.replace(/\/$/, '')}/chat/completions`;
    logger.info(`Sending request to ${apiUrl} with model: ${llmConfig.modelName}`);

    const response = await axios.post(
      apiUrl,
      {
        model: llmConfig.modelName,
        ...prompt
      },
      {
        headers: {
          Authorization: `Bearer ${llmConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    // Обрабатываем ответ (не-streaming режим)
    const responseContent = response.data.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('Empty response from API');
    }

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
      logger.info('Parsed response successfully', {
        elements_count: parsedResponse.elements?.length,
      });
    } catch (parseError) {
      logger.error('JSON parsing failed', {
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
          logger.info('Successfully parsed JSON after finding start', {
            elements_count: parsedResponse.elements?.length,
          });
        } catch (secondParseError) {
          logger.error('Second JSON parsing attempt failed', {
            error: secondParseError.message,
            potential_json: potentialJson.substring(0, 500),
          });
          
          // Пытаемся извлечь валидные элементы из обрезанного JSON
          try {
            const elementsMatch = potentialJson.match(/"elements"\s*:\s*\[/);
            if (elementsMatch) {
              const elementsStart = elementsMatch.index + elementsMatch[0].length;
              
              // Ищем все позиции, где закрывается элемент (braceCount становится 0)
              let braceCount = 0;
              let bracketCount = 1; // Уже открыли [
              let inString = false;
              let escapeNext = false;
              const completeElementPositions = [];
              
              for (let i = elementsStart; i < potentialJson.length; i++) {
                const char = potentialJson[i];
                const prevChar = i > 0 ? potentialJson[i - 1] : '';
                
                if (escapeNext) {
                  escapeNext = false;
                  continue;
                }
                
                if (char === '\\') {
                  escapeNext = true;
                  continue;
                }
                
                if (char === '"' && prevChar !== '\\') {
                  inString = !inString;
                  continue;
                }
                
                if (inString) continue;
                
                if (char === '{') {
                  braceCount++;
                }
                if (char === '}') {
                  braceCount--;
                  // Если закрыли элемент (braceCount вернулся к 0) и мы внутри массива elements
                  if (braceCount === 0 && bracketCount === 1) {
                    // Проверяем, что следующий символ - запятая, пробел+запятая, или конец массива
                    const afterBrace = potentialJson.substring(i + 1).trim();
                    if (afterBrace.startsWith(',') || afterBrace.startsWith(']') || afterBrace === '') {
                      // Сохраняем позицию закрывающей скобки (i + 1, так как нужно включить })
                      completeElementPositions.push(i + 1);
                    }
                  }
                }
                if (char === '[') bracketCount++;
                if (char === ']') {
                  bracketCount--;
                  if (bracketCount === 0) {
                    break;
                  }
                }
              }
              
              // Пробуем извлечь валидные элементы
              if (completeElementPositions.length > 0) {
                logger.info(`Found ${completeElementPositions.length} potential complete element positions`);
                
                // Метод 1: Извлекаем каждый элемент отдельно
                const extractedElements = [];
                let currentStart = elementsStart;
                
                for (let posIdx = 0; posIdx < completeElementPositions.length; posIdx++) {
                  const endPos = completeElementPositions[posIdx];
                  
                  // Ищем начало текущего элемента (открывающая скобка {)
                  let elementStart = -1;
                  for (let j = currentStart; j < endPos; j++) {
                    if (potentialJson[j] === '{') {
                      elementStart = j;
                      break;
                    }
                  }
                  
                  if (elementStart !== -1) {
                    // endPos указывает на позицию после }, так что включаем саму }
                    const elementJson = potentialJson.substring(elementStart, endPos);
                    try {
                      const element = JSON.parse(elementJson);
                      if (element.title && element.selector && element.type) {
                        extractedElements.push(element);
                        logger.debug(`Successfully parsed element ${posIdx + 1}: ${element.title}`);
                      }
                    } catch (e) {
                      logger.debug(`Failed to parse element at position ${posIdx}: ${e.message}, JSON: ${elementJson.substring(0, 150)}`);
                    }
                  }
                  
                  // Следующий элемент начинается после текущего (пропускаем запятую, если есть)
                  const afterEnd = potentialJson.substring(endPos).trim();
                  if (afterEnd.startsWith(',')) {
                    currentStart = endPos + afterEnd.indexOf(',') + 1;
                  } else {
                    currentStart = endPos;
                  }
                }
                
                if (extractedElements.length > 0) {
                  logger.info(`Extracted ${extractedElements.length} individual elements from truncated JSON`);
                  parsedResponse = { elements: extractedElements };
                } else {
                  // Fallback: пробуем извлечь валидные элементы, начиная с последнего
                  logger.warn('Individual element extraction failed, trying full JSON extraction');
                  for (let posIdx = completeElementPositions.length - 1; posIdx >= 0; posIdx--) {
                    const pos = completeElementPositions[posIdx];
                    const truncated = potentialJson.substring(0, pos);
                    let fixedJson = truncated.trim();
                    if (!fixedJson.endsWith(']')) {
                      fixedJson += ']';
                    }
                    if (!fixedJson.endsWith('}')) {
                      fixedJson += '}';
                    }
                    try {
                      const extracted = JSON.parse(fixedJson);
                      if (extracted.elements && Array.isArray(extracted.elements) && extracted.elements.length > 0) {
                        logger.info(`Successfully extracted ${extracted.elements.length} elements from truncated JSON (fallback)`);
                        parsedResponse = extracted;
                        break;
                      }
                    } catch (e) {
                      logger.debug(`Failed to parse at position ${pos}: ${e.message}`);
                      continue;
                    }
                  }
                }
              } else {
                logger.warn('No complete element positions found, trying alternative extraction method');
                
                // Альтернативный метод: ищем элементы через более гибкое регулярное выражение
                try {
                  // Ищем все объекты, которые выглядят как элементы (содержат title, selector, type)
                  const elementPattern = /\{\s*"title"\s*:\s*"([^"\\]|\\.)*"\s*,\s*"selector"\s*:\s*"([^"\\]|\\.)*"\s*,\s*"type"\s*:\s*"([^"\\]|\\.)*"\s*(?:,\s*"recommendedAction"\s*:\s*"([^"\\]|\\.)*")?\s*\}/g;
                  const elements = [];
                  let match;
                  
                  while ((match = elementPattern.exec(potentialJson)) !== null) {
                    try {
                      const elementJson = match[0];
                      const element = JSON.parse(elementJson);
                      if (element.title && element.selector && element.type) {
                        elements.push(element);
                      }
                    } catch (e) {
                      // Пропускаем невалидные элементы
                      logger.debug(`Failed to parse element from regex match: ${e.message}`);
                    }
                  }
                  
                  if (elements.length > 0) {
                    logger.info(`Extracted ${elements.length} elements using regex method`);
                    parsedResponse = { elements };
                  } else {
                    // Еще более простой метод: ищем все закрывающиеся фигурные скобки и пытаемся распарсить
                    const braceMatches = [];
                    let inString = false;
                    let escapeNext = false;
                    let braceCount = 0;
                    let startBrace = -1;
                    
                    for (let i = elementsStart; i < potentialJson.length; i++) {
                      const char = potentialJson[i];
                      const prevChar = i > 0 ? potentialJson[i - 1] : '';
                      
                      if (escapeNext) {
                        escapeNext = false;
                        continue;
                      }
                      
                      if (char === '\\') {
                        escapeNext = true;
                        continue;
                      }
                      
                      if (char === '"' && prevChar !== '\\') {
                        inString = !inString;
                        continue;
                      }
                      
                      if (inString) continue;
                      
                      if (char === '{') {
                        if (braceCount === 0) {
                          startBrace = i;
                        }
                        braceCount++;
                      }
                      if (char === '}') {
                        braceCount--;
                        if (braceCount === 0 && startBrace !== -1) {
                          const elementJson = potentialJson.substring(startBrace, i + 1);
                          try {
                            const element = JSON.parse(elementJson);
                            if (element.title && element.selector && element.type) {
                              elements.push(element);
                            }
                          } catch (e) {
                            // Пропускаем
                          }
                          startBrace = -1;
                        }
                      }
                    }
                    
                    if (elements.length > 0) {
                      logger.info(`Extracted ${elements.length} elements using brace counting method`);
                      parsedResponse = { elements };
                    }
                  }
                } catch (regexError) {
                  logger.debug('Alternative extraction methods failed:', regexError.message);
                }
              }
              
              if (parsedResponse && parsedResponse.elements && parsedResponse.elements.length > 0) {
                logger.info('Using extracted elements from truncated JSON', {
                  elements_count: parsedResponse.elements.length,
                });
              } else {
                // Последняя попытка: логируем что было найдено для отладки
                logger.error('Could not extract valid elements', {
                  completeElementPositions_count: completeElementPositions.length,
                  potentialJson_length: potentialJson.length,
                  potentialJson_sample: potentialJson.substring(0, 500),
                });
                throw new Error('Invalid JSON response from API - could not extract valid elements');
              }
            } else {
              throw new Error('Invalid JSON response from API - no elements array found');
            }
          } catch (extractError) {
            logger.error('Failed to extract elements from truncated JSON', {
              error: extractError.message,
            });
            throw new Error('Invalid JSON response from API');
          }
        }
      } else {
        throw new Error('Invalid JSON response from API');
      }
    }

    if (!parsedResponse.elements) {
      logger.error('Invalid response structure', { parsedResponse });
      throw new Error('Missing elements in response');
    }

    return parsedResponse;
  } catch (error) {
    logger.error('API Error:', error.response ? error.response.data : error.message);
    throw new Error('Failed to process HTML with AI: ' + error.message);
  }
}

module.exports = { processHtml };

