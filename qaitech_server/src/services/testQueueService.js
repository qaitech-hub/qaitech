const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const os = require('os');
const prisma = new PrismaClient();

class TestQueueService {
  constructor() {
    this.queuePath = path.join(__dirname, '../../data/test-queue');
    this.lockPath = path.join(__dirname, '../../data/test-queue.lock');
    this.statsPath = path.join(__dirname, '../../data/queue-stats.json');
    
    // Динамическое определение лимитов на основе ресурсов системы
    const totalMemoryGB = os.totalmem() / (1024 * 1024 * 1024);
    const cpuCount = os.cpus().length;
    
    // Оставляем 20% ресурсов для системы
    const availableMemoryGB = totalMemoryGB * 0.8;
    const availableCPUs = Math.max(1, cpuCount - 1);
    
    // Считаем максимальное количество тестов исходя из ресурсов
    // Предполагаем 300MB на тест
    const maxTestsByMemory = Math.floor((availableMemoryGB * 1024) / 300);
    const maxTestsByCPU = availableCPUs;
    
    // Берем минимальное из ограничений по памяти и CPU
    this.maxTotalConcurrentTests = Math.min(maxTestsByMemory, maxTestsByCPU);
    
    // Максимум тестов на пользователя - 25% от общего максимума, но не менее 3
    this.maxConcurrentTestsPerUser = Math.max(3, Math.floor(this.maxTotalConcurrentTests * 0.25));
    
    this.resourceMonitoringInterval = 30000; // 30 секунд
    this.initQueue();
    this.startResourceMonitoring();
  }

  async initQueue() {
    try {
      const dataDir = path.join(__dirname, '../../data');
      await fs.mkdir(dataDir, { recursive: true });
      await fs.mkdir(this.queuePath, { recursive: true });
      
      // Инициализация статистики
      const stats = {
        maxTotalConcurrentTests: this.maxTotalConcurrentTests,
        maxConcurrentTestsPerUser: this.maxConcurrentTestsPerUser,
        systemInfo: {
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          cpuCount: os.cpus().length,
          platform: os.platform(),
          arch: os.arch()
        },
        queueStats: {
          totalTests: 0,
          activeTests: 0,
          queuedTests: 0,
          completedTests: 0,
          failedTests: 0
        },
        lastUpdate: new Date().toISOString()
      };
      
      await fs.writeFile(this.statsPath, JSON.stringify(stats, null, 2));
      console.log('Test queue directory initialized successfully');
      console.log(`System configured for maximum ${this.maxTotalConcurrentTests} concurrent tests`);
      console.log(`Maximum ${this.maxConcurrentTestsPerUser} concurrent tests per user`);
    } catch (error) {
      console.error('Error initializing queue directory:', error);
    }
  }

  startResourceMonitoring() {
    setInterval(async () => {
      try {
        const currentStats = await this.getQueueStats();
        const systemLoad = os.loadavg()[0];
        const freeMemory = os.freemem();
        const totalMemory = os.totalmem();
        const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

        // Динамически корректируем лимиты based on system load
        if (systemLoad > 0.8 || memoryUsage > 80) {
          this.maxTotalConcurrentTests = Math.max(5, Math.floor(this.maxTotalConcurrentTests * 0.8));
          this.maxConcurrentTestsPerUser = Math.max(2, Math.floor(this.maxConcurrentTestsPerUser * 0.8));
        } else if (systemLoad < 0.5 && memoryUsage < 60) {
          const originalMax = Math.min(
            Math.floor((os.totalmem() * 0.8) / (300 * 1024 * 1024)),
            os.cpus().length - 1
          );
          this.maxTotalConcurrentTests = Math.min(
            this.maxTotalConcurrentTests + 2,
            originalMax
          );
          this.maxConcurrentTestsPerUser = Math.max(3, Math.floor(this.maxTotalConcurrentTests * 0.25));
        }

        // Обновляем статистику
        await this.updateQueueStats({
          ...currentStats,
          systemInfo: {
            totalMemory,
            freeMemory,
            cpuCount: os.cpus().length,
            systemLoad,
            memoryUsage: memoryUsage.toFixed(2) + '%'
          },
          lastUpdate: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error monitoring resources:', error);
      }
    }, this.resourceMonitoringInterval);
  }

  async getQueueStats() {
    try {
      const stats = await fs.readFile(this.statsPath, 'utf-8');
      return JSON.parse(stats);
    } catch (error) {
      return {
        queueStats: {
          totalTests: 0,
          activeTests: 0,
          queuedTests: 0,
          completedTests: 0,
          failedTests: 0
        }
      };
    }
  }

  async updateQueueStats(stats) {
    await fs.writeFile(this.statsPath, JSON.stringify(stats, null, 2));
  }

  async acquireLock() {
    try {
      await fs.writeFile(this.lockPath, 'locked', { flag: 'wx' });
      return true;
    } catch (error) {
      return false;
    }
  }

  async releaseLock() {
    try {
      await fs.unlink(this.lockPath);
    } catch (error) {
      console.error('Error releasing lock:', error);
    }
  }

  async addToQueue(testIds, browser, userId) {
    const stats = await this.getQueueStats();
    stats.queueStats.totalTests += testIds.length;
    stats.queueStats.queuedTests += testIds.length;
    await this.updateQueueStats(stats);

    // Разбиваем массив тестов на отдельные элементы очереди
    const queueItems = testIds.map(testId => ({
      id: `${Date.now()}_${testId}`,
      testIds: [testId],
      browser,
      userId,
      status: 'queued', // Новый статус для тестов в очереди
      createdAt: new Date().toISOString(),
      sessionId: `session_${userId}_${Date.now()}`
    }));

    while (!(await this.acquireLock())) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      await Promise.all(queueItems.map(item =>
        fs.writeFile(
          path.join(this.queuePath, `${item.id}.json`),
          JSON.stringify(item)
        )
      ));
    } finally {
      await this.releaseLock();
    }

    // Пытаемся запустить тесты, если есть свободные слоты
    await this.processQueue();

    return queueItems.map(item => item.id);
  }

  async processQueue() {
    const userSlots = new Map(); // Хранит количество активных тестов для каждого пользователя
    const totalActive = await this.getTotalActiveTests();
    
    // Подсчитываем текущие активные тесты по пользователям
    for (const test of totalActive) {
      const count = userSlots.get(test.userId) || 0;
      userSlots.set(test.userId, count + 1);
    }

    // Получаем все тесты в статусе 'queued'
    const queuedTests = await this.getQueuedTests();
    
    // Сортируем по времени создания
    queuedTests.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    for (const test of queuedTests) {
      const userActiveTests = userSlots.get(test.userId) || 0;
      
      // Проверяем, можно ли запустить тест
      if (userActiveTests < this.maxConcurrentTestsPerUser && 
          totalActive.length < this.maxTotalConcurrentTests) {
        
        // Обновляем статус теста на 'pending'
        await this.updateTestStatus(test.id, 'pending');
        
        // Обновляем счетчики
        userSlots.set(test.userId, userActiveTests + 1);
        totalActive.push(test);
      }
    }
  }

  async getQueuedTests() {
    const files = await fs.readdir(this.queuePath);
    const queuedTests = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const content = await fs.readFile(path.join(this.queuePath, file), 'utf-8');
      const test = JSON.parse(content);
      
      if (test.status === 'queued') {
        queuedTests.push(test);
      }
    }

    return queuedTests;
  }

  async getUserActiveTests(userId) {
    const files = await fs.readdir(this.queuePath);
    const activeTests = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const content = await fs.readFile(path.join(this.queuePath, file), 'utf-8');
      const test = JSON.parse(content);
      
      if (test.userId === userId && (test.status === 'pending' || test.status === 'processing')) {
        activeTests.push(test);
      }
    }

    return activeTests;
  }

  async getTotalActiveTests() {
    const files = await fs.readdir(this.queuePath);
    const activeTests = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const content = await fs.readFile(path.join(this.queuePath, file), 'utf-8');
      const test = JSON.parse(content);
      
      if (test.status === 'pending' || test.status === 'processing') {
        activeTests.push(test);
      }
    }

    return activeTests;
  }

  async getNextBatchOfTests(batchSize) {
    while (!(await this.acquireLock())) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      const files = await fs.readdir(this.queuePath);
      const pendingTests = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const content = await fs.readFile(path.join(this.queuePath, file), 'utf-8');
        const test = JSON.parse(content);
        
        if (test.status === 'pending') {
          pendingTests.push({ ...test, filename: file });
        }
      }

      if (pendingTests.length === 0) return [];

      // Сортируем по времени создания
      pendingTests.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Берем нужное количество тестов
      const testsToProcess = pendingTests.slice(0, batchSize);

      // Обновляем статус выбранных тестов
      await Promise.all(testsToProcess.map(test => {
        test.status = 'processing';
        return fs.writeFile(
          path.join(this.queuePath, test.filename),
          JSON.stringify(test)
        );
      }));

      return testsToProcess;
    } finally {
      await this.releaseLock();
    }
  }

  async updateTestStatus(testId, status) {
    const stats = await this.getQueueStats();
    
    // Обновляем статистику
    if (status === 'completed') {
      stats.queueStats.completedTests++;
      stats.queueStats.activeTests--;
    } else if (status === 'failed') {
      stats.queueStats.failedTests++;
      stats.queueStats.activeTests--;
    } else if (status === 'processing') {
      stats.queueStats.activeTests++;
      stats.queueStats.queuedTests--;
    }
    
    await this.updateQueueStats(stats);

    while (!(await this.acquireLock())) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      const filePath = path.join(this.queuePath, `${testId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const test = JSON.parse(content);
      
      test.status = status;
      if (status === 'completed' || status === 'failed') {
        test.completedAt = new Date().toISOString();
        // После завершения теста проверяем очередь
        await this.processQueue();
      }

      await fs.writeFile(filePath, JSON.stringify(test));
    } finally {
      await this.releaseLock();
    }
  }

  async getQueueStatus(userId) {
    const files = await fs.readdir(this.queuePath);
    const userTests = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const content = await fs.readFile(path.join(this.queuePath, file), 'utf-8');
      const test = JSON.parse(content);
      
      if (test.userId === userId) {
        userTests.push(test);
      }
    }

    // Сортируем тесты по времени создания
    userTests.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    return userTests;
  }

  getEstimatedWaitTime(position) {
    // Предполагаем среднее время выполнения теста 2 минуты
    const averageTestTime = 2 * 60 * 1000; 
    const availableSlots = this.maxTotalConcurrentTests;
    
    // Расчет примерного времени ожидания
    const estimatedWaitTime = Math.ceil((position / availableSlots) * averageTestTime);
    return estimatedWaitTime;
  }
}

module.exports = new TestQueueService(); 