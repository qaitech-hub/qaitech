const { PrismaClient } = require("@prisma/client");
const generateTest = require("../utils/generateTest");
const path = require("path");
const fs = require("fs").promises;
const { runTest, runTestsInSeparateProcess } = require("./testService");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

process.on("message", async ({ testIds, browser }) => {
  let report = {
    overallStatus: true,
    steps: [],
    executionTime: 0,
  };

  const startTime = Date.now();
  
  try {
    // Параллельная генерация и запуск тестов
    const testResults = await Promise.all(
      testIds.map(async (testId) => {
        const reportIdManual = randomUUID();
        let testFilePath;

        try {
          testFilePath = await generateTest(testId, reportIdManual);
          const { status, output } = await runTest(testFilePath, browser);

          return {
            testId,
            reportIdManual,
            status,
            error: null
          };
        } catch (error) {
          return {
            testId,
            reportIdManual,
            status: false,
            error: error.message
          };
        } finally {
          if (testFilePath) {
            try {
              await fs.unlink(testFilePath);
            } catch (err) {
              console.error("Cleanup error:", err);
            }
          }
        }
      })
    );

    // Обработка результатов
    for (const result of testResults) {
      report.steps.push({
        value: `Test ${result.testId}: ${result.error ? 'Failed with error' : (result.status ? "Passed" : "Failed")}`,
        status: result.status
      });

      if (!result.status) report.overallStatus = false;
    }

    report.executionTime = Date.now() - startTime;
    process.send({ 
      status: "success", 
      data: { 
        ...report, 
        reportIdManual: testResults[0]?.reportIdManual 
      } 
    });
  } catch (error) {
    process.send({ status: "error", error: error.message });
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
