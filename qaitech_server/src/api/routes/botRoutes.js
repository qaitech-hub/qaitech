const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const getAllTest = require("../../services/getAllTest");
const getAllTestsWithoutCompany = require("../../services/getAllTestsWithoutCompany");
const getTestsLastReport = require("../../services/getTestsLastReport");
const { getStats } = require("../../services/getStats");
const reportToHtml = require("../../utils/reportToHtml");
const sendReportMail = require("../../services/mail/sendReportMail");
const telegramBotService = require("../../services/telegramBotService");

// Функция для логирования
const logBot = (message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[BOT] ${timestamp} - ${message}`;
  console.log(logMessage);
  if (data) {
    console.log('[BOT] Data:', JSON.stringify(data, null, 2));
  }
};

// Проверка тарифного плана
const getSubscriptionPlan = () => {
  return process.env.SUBSCRIPTION_PLAN || 'start';
};

const isPlanEnabled = (feature) => {
  const plan = getSubscriptionPlan();
  
  switch (feature) {
    case 'telegram_bot':
      return plan === 'standard' || plan === 'pro';
    case 'manual_run':
      return plan === 'standard' || plan === 'pro';
    case 'scheduled_run':
      return plan === 'start' || plan === 'standard' || plan === 'pro';
    case 'email_notifications':
      return plan === 'start' || plan === 'standard' || plan === 'pro';
    case 'analytics_week':
      return plan === 'standard' || plan === 'pro';
    case 'analytics_6months':
      return plan === 'pro';
    case 'ci_cd':
      return plan === 'pro';
    default:
      return false;
  }
};

// Middleware для проверки доступа к CI/CD функциям
const checkCiCdAccess = (req, res, next) => {
  if (!isPlanEnabled('ci_cd')) {
    return res.status(403).json({
      status: "error",
      data: "CI/CD интеграция доступна только в тарифе PRO"
    });
  }
  next();
};

// Middleware для проверки доступа к ручному запуску
const checkManualRunAccess = (req, res, next) => {
  if (!isPlanEnabled('manual_run')) {
    return res.status(403).json({
      status: "error",
      data: "Ручной запуск тестов доступен только в тарифах STANDARD и PRO"
    });
  }
  next();
};

// Middleware для проверки доступа к аналитике
const checkAnalyticsAccess = (req, res, next) => {
  if (!isPlanEnabled('analytics_week')) {
    return res.status(403).json({
      status: "error",
      data: "Аналитика доступна только в тарифах STANDARD и PRO"
    });
  }
  next();
};

// API спецификация для CI/CD (только для PRO тарифа)
router.get("/api-spec", checkCiCdAccess, (req, res) => {
  const apiSpec = {
    name: "QAI.Agent API",
    version: "1.0.0",
    description: "API для интеграции с CI/CD системами",
    subscription_plan: getSubscriptionPlan(),
    endpoints: {
      "POST /api/bot/run_test/all": {
        description: "Запуск всех тестов",
        method: "POST",
        url: "/api/bot/run_test/all",
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          browser: "Chrome|Firefox|Safari (optional, default: Chrome)"
        },
        response: {
          success: {
            status: "success|progress|error",
            data: "reports array or status message"
          }
        }
      },
      "GET /api/bot/get_reports": {
        description: "Получение отчетов по тестам",
        method: "GET",
        url: "/api/bot/get_reports",
        response: {
          success: {
            status: "success|error",
            data: "reports array or error message"
          }
        }
      },
      "GET /api/bot/get_analytics/:period": {
        description: "Получение аналитики за период",
        method: "GET",
        url: "/api/bot/get_analytics/{period}",
        parameters: {
          period: "day|week|month|6months"
        },
        response: {
          success: {
            status: "success|error",
            data: "analytics data or error message"
          }
        }
      },
      "GET /api/bot/status": {
        description: "Получение статуса системы",
        method: "GET",
        url: "/api/bot/status",
        response: {
          success: {
            status: "success",
            data: {
              subscription_plan: "start|standard|pro",
              features: {
                telegram_bot: "boolean",
                manual_run: "boolean",
                scheduled_run: "boolean",
                email_notifications: "boolean",
                analytics_week: "boolean",
                analytics_6months: "boolean",
                ci_cd: "boolean"
              },
              running_tests: "array",
              total_tests: "number"
            }
          }
        }
      }
    },
    authentication: {
      type: "API Key",
      header: "X-API-Key",
      description: "API ключ для аутентификации (если настроен)"
    },
    rate_limits: {
      requests_per_minute: 60,
      requests_per_hour: 1000
    }
  };

  res.status(200).json(apiSpec);
});

// Роут для получения статуса системы
router.get("/status", (req, res) => {
  try {
    const status = {
      subscription_plan: getSubscriptionPlan(),
      features: {
        telegram_bot: isPlanEnabled('telegram_bot'),
        manual_run: isPlanEnabled('manual_run'),
        scheduled_run: isPlanEnabled('scheduled_run'),
        email_notifications: isPlanEnabled('email_notifications'),
        analytics_week: isPlanEnabled('analytics_week'),
        analytics_6months: isPlanEnabled('analytics_6months'),
        ci_cd: isPlanEnabled('ci_cd')
      },
      server_time: new Date().toISOString(),
      version: "1.0.0"
    };

    res.status(200).json({
      status: "success",
      data: status
    });
  } catch (err) {
    logBot("Ошибка при получении статуса системы", err.message);
    res.status(500).json({
      status: "error",
      data: "Ошибка при получении статуса системы"
    });
  }
});

// Роуты для совместимости с API бота
router.get("/run_test/all", checkManualRunAccess, async (req, res) => {
  logBot("Получен запрос на запуск всех тестов");
  
  try {
    // Получаем все тесты из всех проектов
    logBot("Получение всех тестов из всех проектов...");
    const allTests = await getAllTestsWithoutCompany();
    logBot(`Найдено тестов: ${allTests.length}`, allTests);

    if (allTests.length === 0) {
      logBot("Тесты не найдены");
      return res.status(200).json({ 
        status: "error", 
        data: "Тесты не найдены" 
      });
    }

    // Проверяем, есть ли уже запущенные тесты
    logBot("Проверка статуса запущенных тестов...");
    try {
      const statusResponse = await axios.get(`${process.env.THIS_ORIGIN || 'http://localhost:3000'}/api/tests/status`, {
        timeout: 10000 // 10 секунд таймаут
      });
      
      // Проверяем различные форматы ответа
      const statusData = statusResponse.data;
      const runningTests = statusData?.running || statusData?.tests?.running || statusData?.data?.running || [];
      
      if (runningTests && runningTests.length > 0) {
        logBot(`Обнаружены уже запущенные тесты: ${runningTests.length}`, runningTests);
        return res.status(200).json({ 
          status: "error", 
          data: "Some tests is running" 
        });
      }
      
      logBot("Запущенных тестов не обнаружено");
    } catch (error) {
      logBot("Не удалось проверить статус тестов, продолжаем запуск", error.message);
      // Не прерываем выполнение, если не удалось проверить статус
    }

    // Запускаем тесты
    logBot("Запуск тестов через API...");
    try {
      const runResponse = await axios.post(`${process.env.THIS_ORIGIN || 'http://localhost:3000'}/api/tests/run-tests`, {
        testIds: allTests,
        browser: "Chrome",
      }, {
        timeout: 120000 // Увеличиваем таймаут до 120 секунд
      });
      logBot("Тесты запущены успешно", runResponse.data);
    } catch (error) {
      logBot("Ошибка при запуске тестов", error.response?.data || error.message);
      
      // Проверяем различные варианты ошибок "already running"
      const errorMessage = error.response?.data?.error || error.message || '';
      if (errorMessage.includes('already running') || 
          errorMessage.includes('Some tests is running') ||
          errorMessage.includes('tests are running')) {
        logBot("Обнаружены уже запущенные тесты");
        return res.status(200).json({ 
          status: "error", 
          data: "Some tests is running" 
        });
      }
      
      // Проверяем на таймаут или сетевые ошибки
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('socket hang up')) {
        logBot("Таймаут при запуске тестов, но тесты могут быть запущены");
        
        // Проверяем, действительно ли тесты запустились, несмотря на таймаут
        try {
          logBot("Проверка статуса тестов после таймаута...");
          const statusResponse = await axios.get(`${process.env.THIS_ORIGIN || 'http://localhost:3000'}/api/tests/status`, {
            timeout: 10000
          });
          
          const statusData = statusResponse.data;
          const runningTests = statusData?.running || statusData?.tests?.running || statusData?.data?.running || [];
          
          if (runningTests && runningTests.length > 0) {
            logBot(`Тесты действительно запущены: ${runningTests.length}`, runningTests);
            return res.status(200).json({ 
              status: "progress", 
              data: `Запущено ${allTests.length} тестов, ожидайте отчеты...` 
            });
          } else {
            logBot("Тесты не запущены после таймаута");
            return res.status(200).json({ 
              status: "error", 
              data: "Не удалось запустить тесты из-за таймаута" 
            });
          }
        } catch (statusError) {
          logBot("Не удалось проверить статус тестов после таймаута", statusError.message);
          // Возвращаем прогресс, предполагая что тесты запущены
          return res.status(200).json({ 
            status: "progress", 
            data: `Запущено ${allTests.length} тестов, ожидайте отчеты...` 
          });
        }
      }
      
      return res.status(200).json({ 
        status: "error", 
        data: "Ошибка при запуске тестов" 
      });
    }

    // Проверяем, есть ли уже готовые отчеты (быстрое выполнение)
    logBot("Проверка готовых отчетов...");
    try {
      const reports = await getTestsLastReport(allTests);
      if (reports && reports.length > 0) {
        logBot(`Найдено готовых отчетов: ${reports.length}`, reports.map(r => ({ id: r.id, status: r.status })));
        
        // Отправляем отчеты по email, если настроено
        if (
          process.env.SEND_EMAIL_REPORTS == "true" &&
          !!process.env.EMAIL_FOR_REPORTS &&
          JSON.parse(process.env.EMAIL_FOR_REPORTS).length > 0
        ) {
          logBot("Отправка отчетов по email...");
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
        
        return res.status(200).json({ 
          status: "success", 
          data: reports 
        });
      }
    } catch (error) {
      logBot("Ошибка при проверке готовых отчетов", error.message);
    }

    // Если отчеты не готовы, возвращаем статус прогресса
    logBot("Отчеты не готовы, возвращаем статус прогресса");
    return res.status(200).json({ 
      status: "progress", 
      data: `Запущено ${allTests.length} тестов, ожидайте отчеты...` 
    });
  } catch (err) {
    logBot("Критическая ошибка в роуте run_test/all", err.message);
    return res.status(200).json({ 
      status: "error", 
      data: "Что-то пошло не так" 
    });
  }
});

// Роут для получения аналитики (совместимость с API бота)
router.get("/get_analytics/:period", checkAnalyticsAccess, async (req, res) => {
  const period = req.params.period;
  logBot(`Получен запрос аналитики за период: ${period}`);
  
  // Проверяем доступность периода для тарифа
  if (period === 'month' || period === '6months') {
    if (!isPlanEnabled('analytics_6months')) {
      return res.status(403).json({
        status: "error",
        data: "Аналитика за месяц и 6 месяцев доступна только в тарифе PRO"
      });
    }
  }
  
  try {
    const stats = await getStats(period);
    logBot("Аналитика получена успешно", stats);

    return res.status(200).json({
      data: stats,
      status: "success",
    });
  } catch (err) {
    logBot("Ошибка при получении аналитики", err.message);
    return res.status(200).json({ 
      status: "error", 
      data: "Что-то пошло не так" 
    });
  }
});

// Роут для получения отчетов по тестам (новый)
router.get("/get_reports", async (req, res) => {
  logBot("Получен запрос на получение отчетов");
  
  try {
    const allTests = await getAllTestsWithoutCompany();
    logBot(`Получение отчетов для ${allTests.length} тестов`);
    
    if (allTests.length === 0) {
      logBot("Тесты не найдены");
      return res.status(200).json({ 
        status: "error", 
        data: "Тесты не найдены" 
      });
    }

    const reports = await getTestsLastReport(allTests);
    logBot(`Получено отчетов: ${reports.length}`, reports.map(r => ({ id: r.id, status: r.status })));

    // Проверяем, есть ли отчеты и все ли тесты завершены
    if (!reports || reports.length === 0) {
      logBot("Отчеты еще не готовы");
      return res.status(200).json({ 
        status: "error", 
        data: "Отчеты еще не готовы" 
      });
    }

    // Проверяем, что количество отчетов соответствует количеству тестов
    if (reports.length < allTests.length) {
      logBot(`Не все тесты завершены. Ожидается: ${allTests.length}, получено: ${reports.length}`);
      return res.status(200).json({ 
        status: "error", 
        data: "Не все тесты завершены" 
      });
    }

    return res.status(200).json({ 
      data: reports, 
      status: "success" 
    });
  } catch (err) {
    logBot("Ошибка при получении отчетов", err.message);
    return res.status(200).json({ 
      status: "error", 
      data: "Ошибка при получении отчетов" 
    });
  }
});

// Новый роут для ручной отправки последних отчетов в Telegram-чат
router.get("/send_scheduled_reports", async (req, res) => {
  if (!isPlanEnabled('telegram_bot')) {
    return res.status(403).json({ 
      status: "error", 
      data: "Telegram бот недоступен в тарифе START" 
    });
  }
  
  if (!process.env.TELEGRAM_REPORT_CHAT_ID) {
    return res.status(400).json({ status: "error", data: "TELEGRAM_REPORT_CHAT_ID не задан" });
  }
  try {
    const allTests = await getAllTestsWithoutCompany();
    const reports = await getTestsLastReport(allTests);
    await telegramBotService.sendScheduledReports(process.env.TELEGRAM_REPORT_CHAT_ID, reports);
    return res.status(200).json({ status: "success", data: `Отчеты отправлены в чат ${process.env.TELEGRAM_REPORT_CHAT_ID}` });
  } catch (err) {
    return res.status(500).json({ status: "error", data: err.message });
  }
});

// Существующие роуты для обратной совместимости
router.get("/run_all/:company_id", async (req, res) => {
  const companyId = req.params.company_id;
  logBot(`Получен запрос на запуск тестов для компании: ${companyId}`);
  
  try {
    const allTests = await getAllTest(companyId);
    logBot(`Найдено тестов для компании ${companyId}: ${allTests.length}`);

    await axios
      .post(`${process.env.THIS_ORIGIN}/api/tests/run-tests`, {
        testIds: allTests,
        browser: "Chrome",
      })
      .then(async (response) => {
        logBot("Тесты запущены успешно");
      });

    const reports = await getTestsLastReport(allTests);
    logBot(`Получено отчетов: ${reports.length}`);

    if (
      process.env.SEND_EMAIL_REPORTS == "true" &&
      !!process.env.EMAIL_FOR_REPORTS &&
      JSON.parse(process.env.EMAIL_FOR_REPORTS).length > 0
    ) {
      logBot("Отправка отчетов по email...");
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

    return res.status(200).json({ data: reports, status: "success" });
  } catch (err) {
    logBot("Ошибка в роуте run_all", err.message);
    return res
      .status(500)
      .json({ data: err.response?.data?.error, status: "error" });
  }
});

module.exports = router;
