const puppeteer = require('puppeteer');
const axios = require('axios');

const DEVICE_SIZES = {
  TABLET: { width: 1920, height: 1080 },
  DESKTOP: { width: 2560, height: 1440 },
  MOBILE: { width: 320, height: 480 },
};

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

const fetchHtml = async (url, deviceType = 'DESKTOP') => {
  if (!DEVICE_SIZES[deviceType]) {
    throw new Error(`Unsupported device type: ${deviceType}`);
  }

  const { width, height } = DEVICE_SIZES[deviceType];
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
    
    // Устанавливаем заголовки
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
    console.log(`[fetchHtml] Puppeteer failed for ${url}, trying axios: ${error.message}`);
    try {
      const html = await fetchHtmlWithAxios(url);
      return cleanHtml(html);
    } catch (axiosError) {
      throw new Error(`Не удалось получить HTML. Puppeteer: ${error.message}, Axios: ${axiosError.message}`);
    }
  }
};

module.exports = { fetchHtml, cleanHtml };
