const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');
const testQueueService = require('./testQueueService');
const testFileManager = require('./testFileManager');
const generateTest = require('../utils/generateTest');

class TestWorkerService {
  constructor() {
    this.maxWorkers = Math.max(1, os.cpus().length - 1); // Оставляем один поток для системы
    this.activeWorkers = new Map();
    this.isProcessing = false;
    this.workerPool = [];
  }

  async startProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // Очищаем старые тестовые файлы при запуске
    await testFileManager.cleanupOldTests();

    // Инициализируем пул воркеров
    for (let i = 0; i < this.maxWorkers; i++) {
      this.workerPool.push({
        id: i,
        isBusy: false
      });
    }

    while (this.isProcessing) {
      // Находим свободных воркеров
      const availableWorkers = this.workerPool.filter(w => !w.isBusy);
      
      if (availableWorkers.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      // Получаем тесты для всех свободных воркеров
      const tests = await testQueueService.getNextBatchOfTests(availableWorkers.length);
      
      if (tests.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      try {
        // Сначала генерируем все файлы тестов
        await Promise.all(tests.map(async (test) => {
          const testId = test.testIds[0];
          testFileManager.registerTest(testId);
          await generateTest(testId, test.id);
        }));

        // После генерации всех файлов запускаем тесты параллельно
        for (let i = 0; i < tests.length; i++) {
          const worker = availableWorkers[i];
          const test = tests[i];
          
          if (worker && test) {
            worker.isBusy = true;
            this.runTest(test, worker.id, this.maxWorkers);
          }
        }
      } catch (error) {
        console.error('Error generating test files:', error);
        // В случае ошибки генерации помечаем тесты как проваленные
        for (const test of tests) {
          await testQueueService.updateTestStatus(test.id, 'failed');
          await testFileManager.markTestCompleted(test.testIds[0]);
        }
      }
    }
  }

  stopProcessing() {
    this.isProcessing = false;
  }

  runTest(testData, workerId, totalWorkers) {
    const worker = new Worker(path.join(__dirname, 'testWorker.js'));
    this.activeWorkers.set(testData.id, worker);

    // Добавляем информацию о шардировании
    const testDataWithSharding = {
      ...testData,
      workerId,
      totalWorkers
    };

    worker.on('message', async (message) => {
      if (message.type === 'complete') {
        await testQueueService.updateTestStatus(testData.id, 'completed');
        // Помечаем тест как завершенный и удаляем его файл
        await testFileManager.markTestCompleted(testData.testIds[0]);
        this.activeWorkers.delete(testData.id);
        this.workerPool.find(w => w.id === workerId).isBusy = false;
      } else if (message.type === 'error') {
        await testQueueService.updateTestStatus(testData.id, 'failed');
        // Помечаем тест как завершенный и удаляем его файл даже в случае ошибки
        await testFileManager.markTestCompleted(testData.testIds[0]);
        this.activeWorkers.delete(testData.id);
        this.workerPool.find(w => w.id === workerId).isBusy = false;
      }
    });

    worker.on('error', async (error) => {
      console.error(`Worker error for test ${testData.id}:`, error);
      await testQueueService.updateTestStatus(testData.id, 'failed');
      // Помечаем тест как завершенный и удаляем его файл в случае ошибки
      await testFileManager.markTestCompleted(testData.testIds[0]);
      this.activeWorkers.delete(testData.id);
      this.workerPool.find(w => w.id === workerId).isBusy = false;
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
      this.activeWorkers.delete(testData.id);
      this.workerPool.find(w => w.id === workerId).isBusy = false;
    });

    worker.postMessage(testDataWithSharding);
  }

  getActiveWorkersCount() {
    return this.activeWorkers.size;
  }
}

module.exports = new TestWorkerService(); 