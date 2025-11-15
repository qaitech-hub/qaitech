const { chromium } = require("playwright");
const { createScreenshot } = require("../services/screenShotsService"); // Импорт функции для создания скриншота
const { createReportStep } = require("./createReportStep");

class PlaywrightService {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Инициализация браузера и контекста
   */
  async init() {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  /**
   * Открытие страницы по URL
   * @param {string} url - URL страницы
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async openPage(url, reportId) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.goto(url);
      const { id } = await createReportStep(
        `Открыта страница по адресу: ${url}`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Opened page with URL: ${url}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка при открытии страницы по адресу "${url}"\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(`Error opening page with URL "${url}":`, error);
      throw error;
    }
  }

  /**
   * Кастомный метод для клика по элементу
   * @param {string} selector - Селектор элемента
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async click(selector, reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.waitForSelector(selector, { state: "visible" });
      await this.page.click(selector);
      const { id } = await createReportStep(
        `Клик по веб-элементу «${title}»`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Clicked on element with selector: ${selector}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка при клике на элемент «${title}»"\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(`Error clicking on selector "${selector}":`, error);
      throw error;
    }
  }

  /**
   * Кастомный метод для заполнения поля
   * @param {string} selector - Селектор элемента
   * @param {string} value - Значение для заполнения
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async fill(selector, value, reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.waitForSelector(selector, { state: "visible" });
      await this.page.fill(selector, value);
      const { id } = await createReportStep(
        `Поле ввода «${title}» заполнено значением: «${value}»`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Filled element with selector: ${selector}, value: ${value}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка при заполнении поля ввода «${title}» значнем «${value}»\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(`Error filling selector "${selector}":`, error);
      throw error;
    }
  }

  /**
   * Проверка видимости элемента
   * @param {string} selector - Селектор элемента
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async checkVisibility(selector, reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      const isVisible = await this.page.isVisible(selector);
      if (!isVisible) {
        throw new Error(`Element with selector "${selector}" is not visible`);
      }
      const { id } = await createReportStep(
        `Проверена видимость веб-элемента «${title}»`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Checked visibility of element with selector: ${selector}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка при проверке видимости веб-элемента «${title}»\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(
        `Error checking visibility for selector "${selector}":`,
        error
      );
      throw error;
    }
  }

  /**
   * Нажатие клавиши
   * @param {string} selector - Селектор элемента
   * @param {string} key - Клавиша (например, Enter, Tab и т.д.)
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async pressKey(selector, key, reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.press(selector, key);
      const { id } = await createReportStep(
        `Нажата клавиша «${key}» на веб-элементе «${title}»`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Pressed key "${key}" on element with selector: ${selector}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка при нажатии на клавишу «${key}» на веб-элементе «${title}»\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(
        `Error pressing key "${key}" on selector "${selector}":`,
        error
      );
      throw error;
    }
  }

  /**
   * Очистка поля ввода
   * @param {string} selector - Селектор элемента
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async clearInput(selector, reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.fill(selector, "");
      const { id } = await createReportStep(
        `Очищенное поле ввода «${title}»`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Cleared input field with selector: ${selector}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка при очистке поля ввода «${title}»\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(
        `Error clearing input field with selector "${selector}":`,
        error
      );
      throw error;
    }
  }

  /**
   * Двойной клик
   * @param {string} selector - Селектор элемента
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async doubleClick(selector, reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.dblclick(selector);
      const { id } = await createReportStep(
        `Двойной щелчок по веб-элементу «${title}»`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Double-clicked on element with selector: ${selector}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка при двойном щелчке по веб-элементу «${title}»\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(`Error double-clicking on selector "${selector}":`, error);
      throw error;
    }
  }

  /**
   * Правый клик
   * @param {string} selector - Селектор элемента
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async rightClick(selector, reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.click(selector, { button: "right" });
      const { id } = await createReportStep(
        `Щелчок правой кнопкой мыши по веб-элементу «${title}»`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Right-clicked on element with selector: ${selector}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка при щелчке правой кнопкой мыши по веб-элементу «${title}»\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(`Error right-clicking on selector "${selector}":`, error);
      throw error;
    }
  }

  /**
   * Установка фокуса на элемент
   * @param {string} selector - Селектор элемента
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async focus(selector, reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.focus(selector);
      const { id } = await createReportStep(
        `Фокус на веб-элемент «${title}»`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Focused on element with selector: ${selector}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка фокуса на веб-элемент «${title}»\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(`Error focusing on selector "${selector}":`, error);
      throw error;
    }
  }

  /**
   * Снятие фокуса с элемента
   * @param {string} selector - Селектор элемента
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async blur(selector, reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.evaluate((selector) => {
        document.querySelector(selector).blur();
      }, selector);
      const { id } = await createReportStep(
        `Действие blur на веб-элемент «${title}»`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Blurred element with selector: ${selector}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка действия blur на веб-элемент «${title}»\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(`Error blurring selector "${selector}":`, error);
      throw error;
    }
  }

  /**
   * Создание скриншота и сохранение в базу данных
   * @param {string} reportStepId - ID шага
   */
  async takeScreenshot(reportStepId) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      const screenshotBuffer = await this.page.screenshot();
      console.log(screenshotBuffer, "\n\n\n");
      await createScreenshot(screenshotBuffer.toString("base64"), reportStepId);
    } catch (error) {
      console.error("Error taking or saving screenshot:", error);
    }
  }

  /**
   * Наведение курсора на элемент
   * @param {string} selector - Селектор элемента
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async hover(selector, reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.hover(selector);
      const { id } = await createReportStep(
        `Действие hover на веб-элемент «${title}»`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Hovered over element with selector: ${selector}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка действия hover на веб-элемент «${title}»\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(`Error hovering over selector "${selector}":`, error);
      throw error;
    }
  }

  /**
   * Проверка текста элемента
   * @param {string} selector - Селектор элемента
   * @param {string} expectedText - Ожидаемый текст
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async checkText(selector, expectedText, reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      const actualText = await this.page.textContent(selector);
      if (actualText.trim() !== expectedText.trim()) {
        throw new Error(
          `Text mismatch for selector "${selector}". Expected: "${expectedText}", Actual: "${actualText}"`
        );
      }
      const { id } = await createReportStep(
        `Проверен текст веб-элемента «${title}»`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Checked text for element with selector: ${selector}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка проверки текста веб-элемента «${title}»\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(`Error checking text for selector "${selector}":`, error);
      throw error;
    }
  }

  /**
   * Ожидание появления элемента
   * @param {string} selector - Селектор элемента
   * @param {number} timeout - Время ожидания в миллисекундах
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async waitForElement(selector, timeout, reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.waitForSelector(selector, { timeout });
      const { id } = await createReportStep(
        `Ожидание веб-элемента «${title}»`,
        reportId,
        true
      );
      await this.takeScreenshot(id);
      console.log(`Waited for element with selector: ${selector}`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка ожидания веб-элемента «${title}»\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(`Error waiting for selector "${selector}":`, error);
      throw error;
    }
  }

  /**
   * Навигация назад
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async goBack(reportId, title) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.goBack();
      const { id } = await createReportStep(`Навигация назад`, reportId, true);
      await this.takeScreenshot(id);
      console.log(`Navigated back`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка при навигации назад\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(`Error navigating back:`, error);
      throw error;
    }
  }

  /**
   * Навигация вперед
   * @param {string} reportId - ID репорта (для создания скриншота)
   */
  async goForward(reportId) {
    if (!this.page) {
      throw new Error("Page is not initialized. Call init() first.");
    }
    try {
      await this.page.goForward();
      const { id } = await createReportStep(`Навигация вперед`, reportId, true);
      await this.takeScreenshot(id);
      console.log(`Navigated forward`);
    } catch (error) {
      const { id } = await createReportStep(
        `Ошибка при навигации вперед\nТекст ошибки: ${error}`,
        reportId,
        false
      );
      await this.takeScreenshot(id);
      console.error(`Error navigating forward:`, error);
      throw error;
    }
  }

  /**
   * Закрытие браузера
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = PlaywrightService;
