const startApp = require("./src/app");
const { initializeViewPorts } = require("./src/services/viewPortService");
const {
  initializeWebElementActions,
} = require("./src/services/webElementActionsService");
const telegramBotService = require("./src/services/telegramBotService");
const {
  initializeConfig: initializeLlmConfig,
} = require("./src/services/ai/llmConfigService");
const PORT = process.env.PORT || 3000;
require("dotenv").config();
const cron = require("node-cron");
const axios = require("axios");
const getAllTestsWithoutCompany = require("./src/services/getAllTestsWithoutCompany");
const getTestsLastReport = require("./src/services/getTestsLastReport");
const reportToHtml = require("./src/utils/reportToHtml");
const sendReportMail = require("./src/services/mail/sendReportMail");
const prisma = require("./src/db/db");

// Инициализация данных при старте приложения
async function initializeApp() {
  try {
    console.log("Инициализация предопределенных веб-элементов...");
    await initializeWebElementActions(); // Вызов метода инициализации
    await initializeViewPorts();
    console.log("Веб-элементы успешно инициализированы.");

    // Инициализация конфигурации LLM
    console.log("Инициализация конфигурации LLM...");
    await initializeLlmConfig();
    console.log("Конфигурация LLM успешно инициализирована.");
  } catch (error) {
    console.error("Ошибка при инициализации данных:", error.message);
    process.exit(1); // Остановка приложения при ошибке
  }
}

// Инициализация телеграм бота
async function initializeTelegramBot() {
  try {
    console.log("Инициализация Telegram бота...");
    await telegramBotService.initialize();
    console.log("Telegram бот успешно инициализирован.");
  } catch (error) {
    console.error("Ошибка при инициализации Telegram бота:", error.message);
    // Не останавливаем приложение, если бот не удалось инициализировать
  }
}

async function ensureSingleWorkspace() {
  if (process.env.DISABLE_AUTH === "true") {
    console.log("auth init");
    // Проверяем, есть ли уже workspace с названием "Main Workspace"
    let mainWorkspace = await prisma.project.findFirst({
      where: { title: "Main Workspace" },
    });
    if (!mainWorkspace) {
      // Создаем workspace и пользователя-заглушку
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: "admin@local",
            username: "admin",
            emailVerified: new Date(),
            password: "", // без пароля
          },
        });
      }
      mainWorkspace = await prisma.project.create({
        data: {
          title: "Main Workspace",
          description: "",
          UserProject: {
            create: {
              userId: user.id,
            },
          },
        },
      });
    }
  }
}

// Обработка завершения приложения
process.on("SIGINT", async () => {
  console.log("Получен сигнал SIGINT, завершение работы...");
  if (telegramBotService.isBotRunning()) {
    await telegramBotService.stop();
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Получен сигнал SIGTERM, завершение работы...");
  if (telegramBotService.isBotRunning()) {
    await telegramBotService.stop();
  }
  process.exit(0);
});

function logBot(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[BOT-SCHEDULE] ${timestamp} - ${message}`;
  console.log(logMessage);
  if (data) {
    console.log("[BOT-SCHEDULE] Data:", JSON.stringify(data, null, 2));
  }
}

if (process.env.SCHEDULED_TESTS_ENABLED === "true") {
  cron.schedule(process.env.SCHEDULE_CRON || "0 * * * *", async () => {
    logBot("Scheduled test run started");
    try {
      const allTests = await getAllTestsWithoutCompany();
      logBot(`Found ${allTests.length} tests`, allTests);
      if (allTests.length === 0) {
        logBot("No tests found");
        return;
      }
      // Запуск тестов
      try {
        const runResponse = await axios.post(
          `${
            process.env.THIS_ORIGIN || "http://localhost:3000"
          }/api/tests/run-tests`,
          {
            testIds: allTests,
            browser: process.env.TEST_RUN_BROWSER || "Chrome",
          }
        );
        logBot("Tests started successfully", runResponse.data);
      } catch (error) {
        logBot("Error starting tests", error.response?.data || error.message);
        return;
      }
      // Ожидание и получение отчетов
      let attempts = 0;
      const maxAttempts = 30;
      let reports = null;
      while (attempts < maxAttempts) {
        try {
          logBot(`Attempt to get reports ${attempts + 1}/${maxAttempts}`);
          reports = await getTestsLastReport(allTests);
          if (reports && reports.length > 0) {
            logBot(
              `Got ${reports.length} reports`,
              reports.map((r) => ({ id: r.id, status: r.status }))
            );
            // Отправка email, если нужно
            if (
              process.env.SEND_EMAIL_REPORTS == "true" &&
              !!process.env.EMAIL_FOR_REPORTS &&
              JSON.parse(process.env.EMAIL_FOR_REPORTS).length > 0
            ) {
              logBot("Sending reports by email...");
              for (let rep of reports) {
                const htmlReportForMail = reportToHtml(rep);
                for (let mail of JSON.parse(process.env.EMAIL_FOR_REPORTS))
                  await sendReportMail(
                    mail,
                    htmlReportForMail,
                    rep.Report.flatMap((report) =>
                      report.ReportStep.map((step) => step.Screenshot?.data)
                    )
                  );
              }
            }
            // Отправка отчетов в Telegram, если задан chatId
            if (process.env.TELEGRAM_REPORT_CHAT_ID) {
              try {
                await telegramBotService.sendScheduledReports(
                  process.env.TELEGRAM_REPORT_CHAT_ID,
                  reports
                );
                logBot(
                  "Reports sent to Telegram chat",
                  process.env.TELEGRAM_REPORT_CHAT_ID
                );
              } catch (err) {
                logBot("Error sending reports to Telegram", err.message);
              }
            }
            break;
          } else {
            logBot("Reports not ready yet, waiting...");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            attempts++;
          }
        } catch (error) {
          logBot("Error getting reports", error.message);
          await new Promise((resolve) => setTimeout(resolve, 10000));
          attempts++;
        }
      }
      if (attempts === maxAttempts) {
        logBot("Timeout waiting for reports");
      }
    } catch (err) {
      logBot("Critical error in scheduled test run", err.message);
    }
  });
}

(async () => {
  try {
    const app = await startApp(); // Запускаем инициализацию приложения
    await ensureSingleWorkspace();
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
    await initializeApp();
    await initializeTelegramBot(); // Инициализируем телеграм бота после запуска сервера
  } catch (error) {
    console.error("Ошибка при запуске сервера:", error.message);
    process.exit(1); // Остановка приложения при ошибке
  }
})();
