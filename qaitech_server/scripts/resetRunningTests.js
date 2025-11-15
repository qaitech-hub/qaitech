const prisma = require("../src/db/db");

/**
 * Скрипт для сброса статуса "зависших" тестов
 * Используется когда тесты застряли в состоянии isRunning = true
 * @param {boolean} disconnectAfter - отключать ли соединение с БД после выполнения (по умолчанию false для API вызовов)
 */
async function resetRunningTests(disconnectAfter = false) {
  try {
    console.log("Поиск тестов со статусом isRunning = true...");
    
    // Найти все тесты со статусом isRunning = true
    const runningTests = await prisma.test.findMany({
      where: { isRunning: true },
      select: { id: true, title: true }
    });

    if (runningTests.length === 0) {
      console.log("✅ Нет тестов со статусом 'выполняется'");
      return { resetCount: 0, resetTests: [] };
    }

    console.log(`🔄 Найдено ${runningTests.length} тестов со статусом 'выполняется':`);
    runningTests.forEach(test => {
      console.log(`  - ${test.title} (ID: ${test.id})`);
    });

    // Сбросить статус для всех найденных тестов
    const result = await prisma.test.updateMany({
      where: { isRunning: true },
      data: { isRunning: false }
    });

    console.log(`✅ Статус сброшен для ${result.count} тестов`);
    
    return { 
      resetCount: result.count, 
      resetTests: runningTests.map(test => ({ id: test.id, title: test.title }))
    };
    
  } catch (error) {
    console.error("❌ Ошибка при сбросе статуса тестов:", error);
    throw error;
  } finally {
    // Отключаем соединение только если это прямой вызов скрипта, а не API вызов
    if (disconnectAfter) {
      await prisma.$disconnect();
    }
  }
}

// Запуск скрипта если вызван напрямую
if (require.main === module) {
  resetRunningTests(true); // отключаем соединение при прямом вызове
}

module.exports = { resetRunningTests }; 