const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  use: {
    headless: true, // Запуск в headless-режиме
    viewport: { width: 1920, height: 1080 }, // Базовое разширение для всех тестов
    actionTimeout: 15000, // Таймаут только на действия
  },
  projects: [
    // Проект для Chrome (Chromium)
    {
      name: "Chrome",
      use: {
        browserName: "chromium",
      },
    },

    // Проект для Firefox
    {
      name: "Firefox",
      use: {
        browserName: "firefox",
      },
    },

    // Проект для Safari (WebKit)
    {
      name: "Safari",
      use: {
        browserName: "webkit",
      },
    },
  ],
  reporter: [
    ["json", { outputFolder: "test-results" }], // JSON-отчет
  ],
  testDir: "./tests", // Каталог с тестами
  outputDir: "./test-results", // Каталог для результатов тестов
  workers: "50%", // Используем 50% доступных CPU
  fullyParallel: true, // Включаем полностью параллельное выполнение
});
