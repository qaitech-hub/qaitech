const { fetchHtml } = require('./htmlService');
const { JSDOM } = require('jsdom');

function escapeCssSelector(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '\\$&');
}

function getCompactCSSSelector(element, document) {
  if (!element || element.nodeType !== 1) return "";
  const uniqueAttrs = [
    'data-testid', 'data-qa', 'data-cy',
    'id',
    'name', 'aria-label', 'role',
    'href', 'alt', 'title', 'placeholder'
  ];
  for (const attr of uniqueAttrs) {
    const value = element.getAttribute(attr);
    if (value?.trim()) {
      const selector = `[${attr}="${escapeCssSelector(value.trim())}"]`;
      if (isSelectorUnique(selector, document)) {
        return selector;
      }
    }
  }
  if (element.classList.length > 0) {
    const classes = Array.from(element.classList)
      .filter(c => !/^(js|is-)/.test(c))
      .map(escapeCssSelector);
    if (classes.length > 0) {
      const classSelector = `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      if (isSelectorUnique(classSelector, document)) {
        return classSelector;
      }
    }
  }
  const path = [];
  let current = element;
  let depth = 0;
  while (current && depth < 5) {
    const tag = current.tagName.toLowerCase();
    let part = tag;
    if (current.id) {
      part += `#${escapeCssSelector(current.id)}`;
      path.unshift(part);
      break;
    }
    const siblings = Array.from(current.parentElement?.children || [])
      .filter(el => el.tagName === current.tagName);
    if (siblings.length > 1) {
      const index = siblings.indexOf(current) + 1;
      part += `:nth-child(${index})`;
    }
    path.unshift(part);
    current = current.parentElement;
    depth++;
  }
  const hierarchySelector = path.join(' > ');
  return isSelectorUnique(hierarchySelector, document) ? hierarchySelector : "";
}

function isSelectorUnique(selector, document) {
  try {
    return document.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

function parseInteractiveElements(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  ['style', 'script', 'link', 'meta', 'svg'].forEach(tag => {
    document.querySelectorAll(tag).forEach(el => el.remove());
  });
  const interactiveSelectors = [
    'a[href]',
    'button',
    'input:not([type="hidden"])',
    'textarea',
    'select',
    '[role="button"]',
    '[role="link"]'
  ];
  const elements = document.querySelectorAll(interactiveSelectors.join(','));
  const result = [];
  const uniquePairs = new Map();
  elements.forEach((el) => {
    try {
      const selector = getCompactCSSSelector(el, document);
      if (!selector) return;
      let title = '';
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        title = el.value || el.placeholder || el.title || '';
      } else {
        title = el.textContent.trim() || el.title || el.getAttribute('aria-label') || '';
      }
      title = title.replace(/\s+/g, ' ').substring(0, 100).trim();
      if (!title || title.length < 2) return;
      const existingSelector = uniquePairs.get(title);
      if (existingSelector) {
        if (selector.length < existingSelector.length) {
          uniquePairs.set(title, selector);
          const index = result.findIndex(item => item.title === title);
          if (index !== -1) result[index].selector = selector;
        }
        return;
      }
      uniquePairs.set(title, selector);
      result.push({ title, selector });
    } catch (error) {
      // Можно добавить логирование
    }
  });
  return result;
}

module.exports = {
  parseFromHtml: (html) => {
    if (!html || typeof html !== 'string') {
      throw new Error('Invalid HTML content');
    }
    return parseInteractiveElements(html);
  },
  parseFromUrl: async (url, deviceType) => {
    const html = await fetchHtml(url, deviceType);
    return parseInteractiveElements(html);
  }
}; 