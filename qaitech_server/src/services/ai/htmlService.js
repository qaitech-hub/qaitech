const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer');
const axios = require('axios');

// Константы для размеров экрана
const DEVICE_SIZES = {
  TABLET: { width: 1920, height: 1080 },
  DESKTOP: { width: 2560, height: 1440 },
  MOBILE: { width: 320, height: 480 },
};

/**
 * Получить размеры viewport из параметра
 */
const getViewportSize = (deviceTypeOrViewport) => {
  if (typeof deviceTypeOrViewport === 'object' && deviceTypeOrViewport !== null) {
    if (deviceTypeOrViewport.width && deviceTypeOrViewport.height) {
      return {
        width: parseInt(deviceTypeOrViewport.width),
        height: parseInt(deviceTypeOrViewport.height)
      };
    }
    if (deviceTypeOrViewport.title && DEVICE_SIZES[deviceTypeOrViewport.title]) {
      return DEVICE_SIZES[deviceTypeOrViewport.title];
    }
  }
  
  if (typeof deviceTypeOrViewport === 'string') {
    if (DEVICE_SIZES[deviceTypeOrViewport]) {
      return DEVICE_SIZES[deviceTypeOrViewport];
    }
    throw new Error(`Unsupported device type: ${deviceTypeOrViewport}`);
  }
  
  return DEVICE_SIZES.DESKTOP;
};

// Функция для очистки HTML
const cleanHtml = (htmlString) => {
  htmlString = htmlString.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "");
  htmlString = htmlString.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  htmlString = htmlString.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

  const bodyMatch = htmlString.match(/<body\b[^>]*>[\s\S]*?<\/body>/i);
  if (bodyMatch) {
    htmlString = bodyMatch[0];
  } else {
    return "";
  }

  const allowedAttributes = [
    "id", "class", "name", "value", "placeholder", "title", "alt", "href", "src",
    "data-testid", "data-test", "data-qa", "data-cy", "data-id", 
    "role", "aria-label", "aria-describedby", "aria-labelledby",
    "type", "for", "label", "colspan", "rowspan"
  ];

  htmlString = htmlString.replace(/<([a-z][a-z0-9]*)([^>]*)>/gi, (match, tag, attrs) => {
    const cleanedAttrs = attrs.replace(
      /([a-z-]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^'"\s>]+))?/gi,
      (attrMatch, attrName) => {
        const lowerAttr = attrName.toLowerCase();
        return allowedAttributes.includes(lowerAttr) ? attrMatch : "";
      }
    ).trim();
    return `<${tag}${cleanedAttrs ? " " + cleanedAttrs : ""}>`;
  });

  return htmlString;
};

/**
 * Агрессивная оптимизация HTML для экономии токенов
 */
const optimizeHtmlForAI = (htmlString) => {
  try {
    let htmlToProcess = htmlString;
    if (!htmlString.includes('<html') && !htmlString.includes('<!DOCTYPE')) {
      htmlToProcess = `<html><body>${htmlString}</body></html>`;
    }
    
    const dom = new JSDOM(htmlToProcess);
    const document = dom.window.document;

    if (!document.body) {
      console.warn('No body element found in HTML');
      return htmlString;
    }

    // Удаляем комментарии
    const walker = document.createTreeWalker(
      document.body,
      dom.window.NodeFilter.SHOW_COMMENT,
      null
    );
    const comments = [];
    let node;
    while (node = walker.nextNode()) {
      comments.push(node);
    }
    comments.forEach(comment => comment.remove());

    const interactiveTags = new Set([
      'a', 'button', 'input', 'textarea', 'select', 'form',
      'label', 'fieldset', 'legend', 'option', 'optgroup'
    ]);

    const isInteractiveElement = (element) => {
      const tagName = element.tagName.toLowerCase();
      if (interactiveTags.has(tagName)) {
        return true;
      }
      const role = element.getAttribute('role');
      if (role && ['button', 'link', 'checkbox', 'radio', 'textbox', 'combobox', 'listbox'].includes(role)) {
        return true;
      }
      if (element.hasAttribute('onclick') || element.hasAttribute('data-onclick')) {
        return true;
      }
      return false;
    };

    const containerTags = new Set([
      'div', 'span', 'section', 'article', 'nav', 'main', 'header', 'footer',
      'aside', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table', 'tr', 'td', 'th',
      'tbody', 'thead', 'tfoot', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ]);

    const hasInteractiveContent = (element) => {
      if (isInteractiveElement(element)) {
        return true;
      }
      for (const child of element.children) {
        if (hasInteractiveContent(child)) {
          return true;
        }
      }
      return false;
    };

    // Удаляем неинтерактивные контейнеры
    const elementsToRemove = [];
    const allElements = document.body.querySelectorAll('*');
    
    allElements.forEach(element => {
      if (isInteractiveElement(element)) {
        return;
      }
      
      const tagName = element.tagName.toLowerCase();
      if (containerTags.has(tagName)) {
        if (!hasInteractiveContent(element)) {
          elementsToRemove.push(element);
        }
      }
    });

    elementsToRemove.forEach(el => el.remove());

    // Ограничиваем длину текста
    const maxTextLength = 100;
    const interactiveElements = [];
    const allElementsForText = document.body.querySelectorAll('*');
    allElementsForText.forEach(element => {
      if (isInteractiveElement(element)) {
        interactiveElements.push(element);
      }
    });

    interactiveElements.forEach(element => {
      if (element.textContent && element.textContent.length > maxTextLength) {
        const text = element.textContent.trim();
        element.textContent = text.substring(0, maxTextLength) + '...';
      }
      if (element.placeholder && element.placeholder.length > maxTextLength) {
        element.setAttribute('placeholder', element.placeholder.substring(0, maxTextLength) + '...');
      }
      if (element.value && element.value.length > maxTextLength) {
        element.setAttribute('value', element.value.substring(0, maxTextLength) + '...');
      }
    });

    // Минификация
    let optimizedHtml = document.body.innerHTML;
    optimizedHtml = optimizedHtml
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s+>/g, '>')
      .replace(/<\s+/g, '<')
      .trim();

    return optimizedHtml;
  } catch (error) {
    console.warn('HTML optimization failed, using original:', error.message);
    return htmlString;
  }
};

// Fallback на axios если Puppeteer не работает
const fetchHtmlWithAxios = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      maxRedirects: 5,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Axios fallback failed: ${error.message}`);
  }
};

const fetchHtml = async (url, deviceTypeOrViewport = 'DESKTOP') => {
  const { width, height } = getViewportSize(deviceTypeOrViewport);
  let browser;

  try {
    // Запускаем Puppeteer с минимальными настройками для скорости
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Используем domcontentloaded для быстрой загрузки
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 20000 
    });
    
    // Небольшая задержка для рендеринга
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const html = await page.content();
    await browser.close();
    
    return cleanHtml(html);
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Игнорируем ошибки закрытия
      }
    }
    
    // Если Puppeteer не сработал, пробуем axios
    console.log(`[fetchHtml AI] Puppeteer failed for ${url}, trying axios: ${error.message}`);
    try {
      const html = await fetchHtmlWithAxios(url);
      return cleanHtml(html);
    } catch (axiosError) {
      throw new Error(`Не удалось получить HTML. Puppeteer: ${error.message}, Axios: ${axiosError.message}`);
    }
  }
};

module.exports = { fetchHtml, cleanHtml, optimizeHtmlForAI, getViewportSize };
