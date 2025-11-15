const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname), // Корневая директория проекта
  testsDir: path.join(__dirname, 'tests'), // Директория для тестов
  libDir: path.join(__dirname, 'lib'), // Директория для библиотек
  reportsDir: path.join(__dirname, 'reports'), // Директория для отчетов
  webElementsPath: path.join(__dirname, 'webElements.json'), // Путь к файлу веб-элементов
  playwrightConfigPath: path.join(__dirname, 'playwright.config.js'), // Путь к конфигурации Playwright
};