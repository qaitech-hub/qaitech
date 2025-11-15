const fs = require('fs').promises;
const path = require('path');

class TestFileManager {
  constructor() {
    this.generatedTestsDir = path.join(__dirname, '../../tests/generated');
    this.activeTests = new Set();
  }

  // Регистрируем тест как активный
  registerTest(testId) {
    this.activeTests.add(testId);
  }

  // Помечаем тест как завершенный и удаляем его файл
  async markTestCompleted(testId) {
    if (!this.activeTests.has(testId)) {
      return;
    }

    const testFilePath = path.join(this.generatedTestsDir, `test_${testId}.spec.js`);
    try {
      await fs.access(testFilePath);
      await fs.unlink(testFilePath);
      this.activeTests.delete(testId);
    } catch (error) {
      console.error(`Error deleting test file for ${testId}:`, error);
    }
  }

  // Очистка старых тестовых файлов при запуске
  async cleanupOldTests() {
    try {
      const files = await fs.readdir(this.generatedTestsDir);
      for (const file of files) {
        if (file.endsWith('.spec.js')) {
          const filePath = path.join(this.generatedTestsDir, file);
          try {
            await fs.unlink(filePath);
          } catch (error) {
            console.error(`Error deleting old test file ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old test files:', error);
    }
  }

  // Получить список активных тестов
  getActiveTests() {
    return Array.from(this.activeTests);
  }
}

module.exports = new TestFileManager(); 