const { createWebElement, createWebElement_Env } = require("../services/webElementService");
const { parseFromUrl, parseFromHtml } = require('../services/parserService');
const { parseFromUrl: parseFromUrlAI, parseFromHtml: parseFromHtmlAI } = require('../services/webParserService');

async function parseWebElementsAndDontSave(pageUrl, pageId, viewport, isAi, file) {
  let elements = [];
  try {
    if (file) {
      if (!file.buffer) throw new Error('File buffer is missing');
      if (file.mimetype !== 'text/html') throw new Error('File is not HTML');
      
      if (isAi) {
        try {
          elements = await parseFromHtmlAI(file.buffer.toString('utf-8'));
        } catch (aiError) {
          console.log("AI parser failed, falling back to regular parser:", aiError.message);
          elements = parseFromHtml(file.buffer.toString('utf-8'));
        }
      } else {
        elements = parseFromHtml(file.buffer.toString('utf-8'));
      }
    } else {
      if (isAi) {
        try {
          elements = await parseFromUrlAI(pageUrl, viewport);
        } catch (aiError) {
          console.log("AI parser failed, falling back to regular parser:", aiError.message);
          elements = await parseFromUrl(pageUrl, viewport);
        }
      } else {
        elements = await parseFromUrl(pageUrl, viewport);
      }
    }
    return elements;
  } catch (error) {
    console.log("Parser failed for URL:", pageUrl, error);
    throw new Error("Failed to parse page: " + error.message);
  }
}

async function parseWebElements(pageUrl, pageId, viewport, isAi, file) {
  let elements = [];
  try {
    if (file) {
      if (!file.buffer) throw new Error('File buffer is missing');
      if (file.mimetype !== 'text/html') throw new Error('File is not HTML');
      
      if (isAi) {
        try {
          elements = await parseFromHtmlAI(file.buffer.toString('utf-8'));
        } catch (aiError) {
          console.log("AI parser failed, falling back to regular parser:", aiError.message);
          elements = parseFromHtml(file.buffer.toString('utf-8'));
        }
      } else {
        elements = parseFromHtml(file.buffer.toString('utf-8'));
      }
    } else {
      if (isAi) {
        try {
          elements = await parseFromUrlAI(pageUrl, viewport);
        } catch (aiError) {
          console.log("AI parser failed, falling back to regular parser:", aiError.message);
          elements = await parseFromUrl(pageUrl, viewport);
        }
      } else {
        elements = await parseFromUrl(pageUrl, viewport);
      }
    }
  } catch (error) {
    console.log("Parser failed for URL:", pageUrl, error);
    throw new Error("Failed to parse page: " + error.message);
  }

  try {
    await createWebElement_Env(pageId, elements, false);
    console.log(`Saved ${elements.length} elements for page ${pageId}`);
  } catch (dbError) {
    console.log("Failed to save elements to DB:", dbError);
    throw dbError;
  }
}

async function parseWebElementsFromFile(file, pageId) {
  let elements = [];
  try {
    if (!file.buffer) throw new Error('File buffer is missing');
    if (file.mimetype !== 'text/html') throw new Error('File is not HTML');
    elements = parseFromHtml(file.buffer.toString('utf-8'));
  } catch (error) {
    console.log("Parser failed for file:", error);
    throw new Error("Failed to parse file: " + error.message);
  }

  try {
    await createWebElement_Env(pageId, elements, false);
    console.log(`Saved ${elements.length} elements from file for page ${pageId}`);
  } catch (dbError) {
    console.log("Failed to save elements to DB:", dbError);
    throw dbError;
  }
}

module.exports = {
  parseWebElements,
  parseWebElementsFromFile,
  parseWebElementsAndDontSave,
};
