const { parentPort } = require('worker_threads');
const { exec } = require('child_process');
const path = require('path');

parentPort.on('message', async (testData) => {
  try {
    const testId = testData.testIds[0];
    const browser = testData.browser;
    const workerId = testData.workerId || 0;
    const totalWorkers = testData.totalWorkers || 1;

    // Формируем команду для запуска теста
    const command = `npx playwright test tests/generated/test_${testId}.spec.js --project=${browser}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        parentPort.postMessage({
          type: 'error',
          error: stderr || error.message
        });
        return;
      }

      parentPort.postMessage({
        type: 'complete',
        result: stdout
      });
    });
  } catch (error) {
    parentPort.postMessage({
      type: 'error',
      error: error.message
    });
  }
}); 