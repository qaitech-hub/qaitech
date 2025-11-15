const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const temp = require('temp');
const axios = require('axios');

// Автоматически отслеживаем и очищаем временные файлы
temp.track();

// Функция для логирования
const logBot = (message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[TELEGRAM_BOT] ${timestamp} - ${message}`;
  console.log(logMessage);
  if (data) {
    console.log('[TELEGRAM_BOT] Data:', JSON.stringify(data, null, 2));
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

// --- Вспомогательная функция для замены ссылок на markdown-гиперссылки ---
function returnHyperlink(text = '', hyperlink = 'Гиперссылка') {
  const urlPattern = /https?:\/\/(?:www\.)?[^\s]+|www\.[^\s]+/g;
  return text.replace(urlPattern, (url) => {
    let urlWithProtocol = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlWithProtocol = 'https://' + url;
    }
    return `[🔗 ${hyperlink}](${urlWithProtocol})`;
  });
}

// --- Вспомогательная функция: заменить только URL на markdown-гиперссылку, не всю строку ---
function replaceUrlWithHyperlink(text, hyperlink = 'Гиперссылка') {
  const urlPattern = /https?:\/\/(?:www\.)?[^\s]+|www\.[^\s]+/g;
  return text.replace(urlPattern, (url) => {
    let urlWithProtocol = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlWithProtocol = 'https://' + url;
    }
    return `[🔗 ${hyperlink}](${urlWithProtocol})`;
  });
}

class TelegramBotService {
  constructor() {
    this.bot = null;
    this.isRunning = false;
  }

  async initialize() {
    // Проверяем, включен ли Telegram бот для данного тарифа
    if (!isPlanEnabled('telegram_bot')) {
      logBot('Telegram бот отключен для тарифа START. Только email уведомления.');
      return;
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      logBot('TELEGRAM_BOT_TOKEN не найден в переменных окружения. Бот не будет запущен.');
      return;
    }

    try {
      logBot('Инициализация Telegram бота...');
      this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
      this.setupHandlers();
      this.isRunning = true;
      logBot('Telegram бот успешно инициализирован');
    } catch (error) {
      logBot('Ошибка при инициализации Telegram бота:', error.message);
    }
  }

  setupHandlers() {
    logBot('Настройка обработчиков команд...');
    
    // Команда /start
    this.bot.onText(/\/start/, this.handleStart.bind(this));

    // Команда /runtests (только для standard и pro)
    if (isPlanEnabled('manual_run')) {
      this.bot.onText(/\/runtests/, this.handleRunTests.bind(this));
    }

    // Команда /analysis (только для standard и pro)
    if (isPlanEnabled('analytics_week')) {
      this.bot.onText(/\/analysis/, this.handleAnalysis.bind(this));
    }

    // Команда /subscription
    this.bot.onText(/\/subscription/, this.handleSubscription.bind(this));

    // Обработка текстовых сообщений
    this.bot.on('message', this.handleMessage.bind(this));

    // Установка команд меню
    this.setCommands();
    
    logBot('Обработчики команд настроены');
  }

  async setCommands() {
    try {
      const commands = [
        { command: 'start', description: 'Начать работу с ботом' },
        { command: 'subscription', description: 'Информация о подписке' }
      ];

      // Добавляем команды в зависимости от тарифа
      if (isPlanEnabled('manual_run')) {
        commands.push({ command: 'runtests', description: 'Запустить все тесты' });
      }
      
      if (isPlanEnabled('analytics_week')) {
        commands.push({ command: 'analysis', description: 'Показать аналитику' });
      }

      await this.bot.setMyCommands(commands);
      logBot('Команды меню установлены');
    } catch (error) {
      logBot('Ошибка при установке команд:', error.message);
    }
  }

  async showMainMenu(chatId) {
    const plan = getSubscriptionPlan();
    let keyboard = {
      reply_markup: {
        keyboard: [],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    };

    // Формируем клавиатуру в зависимости от тарифа
    const firstRow = [];
    if (isPlanEnabled('manual_run')) {
      firstRow.push('Запуск тестов');
    }
    
    if (isPlanEnabled('analytics_week')) {
      firstRow.push('Аналитика');
    }
    
    // Добавляем первую строку, если есть кнопки
    if (firstRow.length > 0) {
      keyboard.reply_markup.keyboard.push(firstRow);
    }
    
    // Вторая строка - план подписки
    keyboard.reply_markup.keyboard.push(['План подписки']);

    let menuText = `*QAI.Agent - Главное меню* 🚀\n\n`;
    menuText += `📋 *Ваш тариф:* ${plan.toUpperCase()}\n\n`;
    menuText += `Выберите действие:`;

    await this.bot.sendMessage(chatId, menuText, { 
      ...keyboard,
      parse_mode: 'Markdown'
    });
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    logBot(`Получена команда /start от пользователя ${msg.from?.id}`);
    
    await this.showMainMenu(chatId);
    logBot(`Отправлено приветственное сообщение пользователю ${msg.from?.id}`);
  }

  async handleRunTests(msg) {
    if (!isPlanEnabled('manual_run')) {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(chatId, '❌ *Функция недоступна*\n\nРучной запуск тестов доступен только в тарифах STANDARD и PRO', { 
        parse_mode: 'Markdown' 
      });
      return;
    }

    const chatId = msg.chat.id;
    logBot(`Получена команда /runtests от пользователя ${msg.from?.id}`);
    
    await this.startTests(chatId);
  }

  async handleAnalysis(msg) {
    if (!isPlanEnabled('analytics_week')) {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(chatId, '❌ *Функция недоступна*\n\nАналитика доступна только в тарифах STANDARD и PRO', { 
        parse_mode: 'Markdown' 
      });
      return;
    }

    const chatId = msg.chat.id;
    logBot(`Получена команда /analysis от пользователя ${msg.from?.id}`);
    
    await this.showAnalysis(chatId);
  }

  async handleSubscription(msg) {
    const chatId = msg.chat.id;
    logBot(`Получена команда /subscription от пользователя ${msg.from?.id}`);
    
    await this.showSubscription(chatId);
  }

  async handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    logBot(`Получено сообщение от пользователя ${msg.from?.id}: ${text}`);

    if (text === 'Запуск тестов') {
      if (!isPlanEnabled('manual_run')) {
        await this.bot.sendMessage(chatId, '❌ *Функция недоступна*\n\nРучной запуск тестов доступен только в тарифах STANDARD и PRO', { 
          parse_mode: 'Markdown' 
        });
        return;
      }
      await this.startTests(chatId);
    } else if (text === 'Аналитика') {
      if (!isPlanEnabled('analytics_week')) {
        await this.bot.sendMessage(chatId, '❌ *Функция недоступна*\n\nАналитика доступна только в тарифах STANDARD и PRO', { 
          parse_mode: 'Markdown' 
        });
        return;
      }
      await this.showAnalysis(chatId);
    } else if (text === 'План подписки') {
      await this.showSubscription(chatId);
    } else if (text === 'Назад') {
      await this.showMainMenu(chatId);
    } else if (text === 'Отчет за день' || text === 'Отчет за неделю' || 
               text === 'Отчет за месяц' || text === 'Отчет за пол года') {
      if (!isPlanEnabled('analytics_week')) {
        await this.bot.sendMessage(chatId, '❌ *Функция недоступна*\n\nАналитика доступна только в тарифах STANDARD и PRO', { 
          parse_mode: 'Markdown' 
        });
        return;
      }
      await this.bot.sendMessage(chatId, `📊 *Вы выбрали:* ${text}`, { 
        parse_mode: 'Markdown' 
      });
      await this.getAnalytics(chatId, text);
    } else if (text && !text.startsWith('/')) {
      await this.bot.sendMessage(chatId, '❌ *Неизвестная команда*', { 
        parse_mode: 'Markdown' 
      });
    }
  }

  async showAnalysis(chatId) {
    const keyboard = {
      reply_markup: {
        keyboard: [],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    };

    // Добавляем доступные периоды в зависимости от тарифа
    if (isPlanEnabled('analytics_week')) {
      keyboard.reply_markup.keyboard.push(['Отчет за день', 'Отчет за неделю']);
    }
    
    if (isPlanEnabled('analytics_6months')) {
      keyboard.reply_markup.keyboard.push(['Отчет за месяц', 'Отчет за пол года']);
    }
    
    keyboard.reply_markup.keyboard.push(['Назад']);

    let analysisText = '📈 *Выберите период аналитики:*\n\n';
    const plan = getSubscriptionPlan();
    analysisText += `📋 *Ваш тариф:* ${plan.toUpperCase()}\n`;
    
    if (plan === 'standard') {
      analysisText += '📊 *Доступно:* отчеты за день и неделю';
    } else if (plan === 'pro') {
      analysisText += '📊 *Доступно:* все периоды аналитики';
    }

    await this.bot.sendMessage(chatId, analysisText, { 
      ...keyboard,
      parse_mode: 'Markdown'
    });
  }

  async showSubscription(chatId) {
    const plan = getSubscriptionPlan();
    let subscriptionText = '💎 *Информация о подписке*\n\n';
    
    switch (plan) {
      case 'start':
        subscriptionText += '📋 *Тариф: START*\n\n';
        subscriptionText += '✅ Запуск по расписанию\n';
        subscriptionText += '✅ Email для оповещения\n';
        subscriptionText += '❌ Telegram бот\n';
        subscriptionText += '❌ Ручной запуск\n';
        subscriptionText += '❌ Аналитика\n\n';
        subscriptionText += 'Свяжитесь с [QAITECH](https://qaitech.ru) для перехода на более высокий тариф!';
        break;
      case 'standard':
        subscriptionText += '📋 *Тариф: STANDARD*\n\n';
        subscriptionText += '✅ Запуск по расписанию\n';
        subscriptionText += '✅ Email для оповещения\n';
        subscriptionText += '✅ Telegram бот\n';
        subscriptionText += '✅ Возможность ручного запуска\n';
        subscriptionText += '✅ Аналитика за неделю\n';
        subscriptionText += '❌ Аналитика за 6 месяцев\n';
        subscriptionText += '❌ CI/CD интеграция\n\n';
        subscriptionText += 'Свяжитесь с [QAITECH](https://qaitech.ru) для перехода на PRO тариф!';
        break;
      case 'pro':
        subscriptionText += '📋 *Тариф: PRO*\n\n';
        subscriptionText += '✅ Запуск по расписанию\n';
        subscriptionText += '✅ Email для оповещения\n';
        subscriptionText += '✅ Telegram бот\n';
        subscriptionText += '✅ Возможность ручного запуска\n';
        subscriptionText += '✅ Аналитика за неделю\n';
        subscriptionText += '✅ Аналитика за 6 месяцев\n';
        subscriptionText += '✅ CI/CD интеграция\n\n';
        subscriptionText += '🎉 *Максимальный функционал!*';
        break;
      default:
        subscriptionText += '❌ *Неизвестный тариф*\n\nСвяжитесь с [QAITECH](https://qaitech.ru) для настройки!';
    }
    
    await this.bot.sendMessage(chatId, subscriptionText, { 
      parse_mode: 'Markdown' 
    });
  }

  async startTests(chatId) {
    logBot(`Запуск тестов для чата ${chatId}`);
    
    let statusMessage = null;
    
    try {
      // Отправляем начальное сообщение о запуске тестов
      statusMessage = await this.bot.sendMessage(chatId, '🔄 *Тесты запущены, ожидайте...*', { 
        parse_mode: 'Markdown' 
      });
      
      // Сначала запускаем тесты
      logBot('Отправка запроса на запуск тестов...');
      const runResponse = await axios.get(`${process.env.THIS_ORIGIN || 'http://localhost:3000'}/api/bot/run_test/all`, {
        timeout: 30000 // 30 секунд таймаут
      });
      
      logBot('Ответ на запуск тестов:', runResponse.data);
      
      if (runResponse.data.status === 'error') {
        if (runResponse.data.data === 'Some tests is running') {
          await this.bot.editMessageText('⚠️ *Тесты уже запущены*\n\nОжидайте завершения текущего выполнения', {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: 'Markdown'
          });
          return;
        }
        
        // Обработка других типов ошибок
        let errorText = '❌ *При запуске тестов произошла ошибка*';
        if (runResponse.data.data === 'Тесты не найдены') {
          errorText = '❌ *Тесты не найдены*\n\nНет доступных тестов для запуска';
        } else if (runResponse.data.data && runResponse.data.data.includes('не найдены')) {
          errorText = '❌ *Тесты не найдены*\n\nНет доступных тестов для запуска';
        } else if (runResponse.data.data) {
          errorText = `❌ *Ошибка:* ${runResponse.data.data}`;
        }
        
        await this.bot.editMessageText(errorText, {
          chat_id: chatId,
          message_id: statusMessage.message_id,
          parse_mode: 'Markdown'
        });
        return;
      }

      if (runResponse.data.status === 'progress') {
        // Обновляем сообщение на "Ожидайте отчеты..."
        await this.bot.editMessageText('📊 *Ожидайте отчеты...*\n\nТесты выполняются, собираем результаты', {
          chat_id: chatId,
          message_id: statusMessage.message_id,
          parse_mode: 'Markdown'
        });
        
        // Ждем завершения тестов и получаем отчеты
        logBot('Ожидание завершения тестов...');
        await this.waitForReportsAndSend(chatId, statusMessage);
        return;
      }

      // Если сразу получили отчеты
      if (runResponse.data.status === 'success' && runResponse.data.data) {
        // Обновляем сообщение на "Отчеты получены"
        await this.bot.editMessageText('🟢 *Отчеты получены*\n\nОтправляем результаты...', {
          chat_id: chatId,
          message_id: statusMessage.message_id,
          parse_mode: 'Markdown'
        });
        
        await this.sendReports(chatId, runResponse.data.data);
        
        // Удаляем статусное сообщение после отправки отчетов
        await this.bot.deleteMessage(chatId, statusMessage.message_id);
      }

    } catch (error) {
      logBot('Ошибка при запуске тестов:', error.message);
      
      let errorMessage = '❌ *При запуске тестов произошла ошибка*';
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        errorMessage = '🔧 *Технические проблемы*\n\nСервер временно недоступен. Мы уже работаем над решением проблемы.\n\nПопробуйте позже.';
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('socket hang up')) {
        errorMessage = '🔧 *Технические проблемы*\n\nПревышено время ожидания ответа сервера. Мы уже работаем над решением проблемы.\n\nПопробуйте позже.';
      } else if (error.response && error.response.status >= 500) {
        errorMessage = '🔧 *Технические проблемы*\n\nСервер временно недоступен. Мы уже работаем над решением проблемы.\n\nПопробуйте позже.';
      }
      
      if (statusMessage) {
        await this.bot.editMessageText(errorMessage, {
          chat_id: chatId,
          message_id: statusMessage.message_id,
          parse_mode: 'Markdown'
        });
      } else {
        await this.bot.sendMessage(chatId, errorMessage, { 
          parse_mode: 'Markdown' 
        });
      }
    }
  }

  async waitForReportsAndSend(chatId, statusMessage) {
    logBot(`Ожидание отчетов для чата ${chatId}`);
    
    let attempts = 0;
    const maxAttempts = 30; // 30 попыток по 10 секунд = 5 минут
    
    while (attempts < maxAttempts) {
      try {
        logBot(`Попытка получения отчетов ${attempts + 1}/${maxAttempts} для чата ${chatId}`);
        
        const reportsResponse = await axios.get(`${process.env.THIS_ORIGIN || 'http://localhost:3000'}/api/bot/get_reports`, {
          timeout: 15000 // 15 секунд таймаут
        });
        
        if (reportsResponse.data.status === 'success' && reportsResponse.data.data && reportsResponse.data.data.length > 0) {
          logBot(`Получено отчетов: ${reportsResponse.data.data.length} для чата ${chatId}`);
          
          // Обновляем сообщение на "Отчеты получены"
          await this.bot.editMessageText('✅ *Отчеты получены*\n\nОтправляем результаты...', {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: 'Markdown'
          });
          
          await this.sendReports(chatId, reportsResponse.data.data);
          
          // Удаляем статусное сообщение после отправки отчетов
          await this.bot.deleteMessage(chatId, statusMessage.message_id);
          return;
        } else if (reportsResponse.data.status === 'error') {
          // Обработка ошибок от API
          let errorText = '❌ *Ошибка при получении отчетов*';
          if (reportsResponse.data.data === 'Отчеты еще не готовы') {
            errorText = '📊 *Отчеты еще не готовы*\n\nПродолжаем ожидание...';
          } else if (reportsResponse.data.data === 'Не все тесты завершены') {
            errorText = '📊 *Не все тесты завершены*\n\nПродолжаем ожидание...';
          } else if (reportsResponse.data.data === 'Тесты не найдены') {
            errorText = '❌ *Тесты не найдены*\n\nНет доступных тестов';
            await this.bot.editMessageText(errorText, {
              chat_id: chatId,
              message_id: statusMessage.message_id,
              parse_mode: 'Markdown'
            });
            return;
          } else if (reportsResponse.data.data) {
            errorText = `❌ *Ошибка:* ${reportsResponse.data.data}`;
          }
          
          logBot(`Ошибка от API: ${reportsResponse.data.data}`);
          await new Promise(resolve => setTimeout(resolve, 10000));
          attempts++;
          continue;
        } else {
          logBot(`Отчеты еще не готовы для чата ${chatId}, ожидание...`);
          
          // Обновляем сообщение с прогрессом
          const progressText = `📊 *Ожидайте отчеты...*\n\nПопытка ${attempts + 1}/${maxAttempts}\nТесты выполняются, собираем результаты`;
          await this.bot.editMessageText(progressText, {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: 'Markdown'
          });
          
          await new Promise(resolve => setTimeout(resolve, 10000)); // Ждем 10 секунд
          attempts++;
        }
      } catch (error) {
        logBot(`Ошибка при получении отчетов для чата ${chatId}:`, error.message);
        
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || 
            (error.response && error.response.status >= 500)) {
          await this.bot.editMessageText('🔧 *Технические проблемы*\n\nСервер временно недоступен. Мы уже работаем над решением проблемы.\n\nПопробуйте позже.', {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: 'Markdown'
          });
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;
      }
    }
    
    logBot(`Превышено время ожидания отчетов для чата ${chatId}`);
    await this.bot.editMessageText('⏰ *Не удалось получить отчеты в отведенное время*\n\nПопробуйте запустить тесты позже', {
      chat_id: chatId,
      message_id: statusMessage.message_id,
      parse_mode: 'Markdown'
    });
  }

  async sendReports(chatId, reports) {
    logBot(`Отправка ${reports.length} отчетов в чат ${chatId}`);
    
    let totalTests = reports.length;
    let passedTests = 0;
    let failedTests = 0;
    
    for (let i = 0; i < reports.length; i++) {
      const testData = reports[i];
      const reportText = this.formatReport(testData, i);
      
      // Подсчитываем статистику
      if (testData.Report && testData.Report.length > 0) {
        const report = testData.Report[0];
        if (report.status === true) {
          passedTests++;
        } else {
          failedTests++;
        }
      }
      
      try {
        await this.bot.sendMessage(chatId, reportText, { 
          disable_web_page_preview: true,
          parse_mode: 'Markdown'
        });
        logBot(`Отправлен текстовый отчет ${i + 1}/${reports.length} в чат ${chatId}`);

        // Ждем 1 секунду перед отправкой скриншотов
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Отправляем скриншоты пачками по 10 (альбомами)
        if (testData.Report && testData.Report[0] && testData.Report[0].ReportStep) {
          const screenshots = [];
          for (const step of testData.Report[0].ReportStep) {
            if (step.Screenshot && step.Screenshot.data) {
              const imageBuffer = Buffer.from(step.Screenshot.data, 'base64');
              const tempFile = temp.path({ suffix: '.png' });
              fs.writeFileSync(tempFile, imageBuffer);
              screenshots.push({
                type: 'photo',
                media: fs.createReadStream(tempFile)
              });
            }
          }
          // Отправляем скриншоты пачками по 10
          for (let j = 0; j < screenshots.length; j += 10) {
            const album = screenshots.slice(j, j + 10);
            try {
              await this.bot.sendMediaGroup(chatId, album);
              // Ждем 2 секунды между пачками скриншотов
              if (j + 10 < screenshots.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            } catch (error) {
              if (error.message.includes('429')) {
                logBot(`Rate limit при отправке скриншотов, ожидание 5 секунд...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                // Повторная попытка
                await this.bot.sendMediaGroup(chatId, album);
              } else {
                throw error;
              }
            }
          }
          logBot(`Отправлены все скриншоты для отчета ${i + 1} в чат ${chatId}`);
        }

        // Ждем 1 секунду между отчетами
        if (i < reports.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        logBot(`Ошибка при отправке отчета ${i + 1} в чат ${chatId}:`, error.message);
        
        // Обработка rate limiting
        if (error.message.includes('429')) {
          const retryAfter = error.message.match(/retry after (\d+)/);
          const waitTime = retryAfter ? parseInt(retryAfter[1]) * 1000 : 5000;
          logBot(`Rate limit достигнут, ожидание ${waitTime/1000} секунд...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Повторная попытка отправки
          try {
            await this.bot.sendMessage(chatId, reportText, { 
              disable_web_page_preview: true,
              parse_mode: 'Markdown'
            });
            logBot(`Повторная отправка отчета ${i + 1} успешна`);
          } catch (retryError) {
            logBot(`Повторная попытка отправки отчета ${i + 1} не удалась:`, retryError.message);
          }
        }
      }
    }
    
    // Отправляем итоговое резюме
    await this.sendTestSummary(chatId, totalTests, passedTests, failedTests);
    
    logBot(`Все отчеты отправлены в чат ${chatId}`);
  }

  async sendTestSummary(chatId, totalTests, passedTests, failedTests) {
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';
    const failureRate = totalTests > 0 ? ((failedTests / totalTests) * 100).toFixed(1) : '0.0';
    
    let summaryText = '📊 *ИТОГОВЫЙ ОТЧЕТ*\n\n';
    summaryText += `🔢 *Всего тестов:* ${totalTests}\n`;
    summaryText += `✅ *Пройдено:* ${passedTests} (${successRate}%)\n`;
    summaryText += `❌ *Провалено:* ${failedTests} (${failureRate}%)\n\n`;
    
    if (passedTests === totalTests) {
      summaryText += '🎉 *Отличный результат! Все тесты пройдены успешно!*';
    } else if (failedTests === totalTests) {
      summaryText += '⚠️ *Все тесты провалены. Требуется внимание!*';
    } else {
      summaryText += '⚠️ *Есть проблемы. Некоторые тесты провалены.*';
    }
    
    try {
      await this.bot.sendMessage(chatId, summaryText, { 
        parse_mode: 'Markdown' 
      });
      logBot(`Отправлено итоговое резюме в чат ${chatId}`);
    } catch (error) {
      logBot(`Ошибка при отправке итогового резюме в чат ${chatId}:`, error.message);
    }
    // Добавлено: отправка алерта при наличии упавших тестов
    await this.sendAlertIfFailedTests(failedTests, totalTests);
  }

  async getAnalytics(chatId, period) {
    logBot(`Получение аналитики за период "${period}" для чата ${chatId}`);
    
    try {
      const response = await axios.get(`${process.env.THIS_ORIGIN || 'http://localhost:3000'}/api/bot/get_analytics/${encodeURIComponent(period)}`, {
        timeout: 20000 // 20 секунд таймаут
      });
      
      if (response.data.status === 'error') {
        await this.bot.sendMessage(chatId, '❌ *При получении аналитики произошла ошибка*', { 
          parse_mode: 'Markdown' 
        });
        return;
      }

      const analyticsText = this.formatAnalytics(response.data.data);
      await this.bot.sendMessage(chatId, analyticsText, { 
        parse_mode: 'Markdown' 
      });
      logBot(`Аналитика отправлена в чат ${chatId}`);

    } catch (error) {
      logBot(`Ошибка при получении аналитики для чата ${chatId}:`, error.message);
      
      let errorMessage = '❌ *При получении аналитики произошла ошибка*';
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || 
          (error.response && error.response.status >= 500)) {
        errorMessage = '🔧 *Технические проблемы*\n\nСервер временно недоступен. Мы уже работаем над решением проблемы.\n\nПопробуйте позже.';
      }
      
      await this.bot.sendMessage(chatId, errorMessage, { 
        parse_mode: 'Markdown' 
      });
    }
  }

  formatReport(testData, index, opts = {}) {
    // opts.autoReport — если true, добавить заголовок автоотчета
    if (!testData.Report || testData.Report.length === 0) {
      return `${opts.autoReport ? '*АВТООТЧЕТ ПО РАСПИСАНИЮ*\n\n' : ''}*Тест «${testData.title || 'Не указано'}»:* Нет данных отчета`;
    }
    const report = testData.Report[0];
    let result = '';
    if (opts.autoReport) {
      result += '*АВТООТЧЕТ ПО РАСПИСАНИЮ*\n\n';
    }
    if (report.status === true) {
      result += `✅ *Тест «${testData.title || 'Не указано'}» пройден*\n`;
    } else {
      result += `❌ *Тест «${testData.title || 'Не указано'}» не пройден*\n`;
    }
    if (report.ReportStep && report.ReportStep.length > 0) {
      for (const step of report.ReportStep) {
        let stepText = step.value || step.description || 'Шаг без описания';
        // Только URL в шаге заменяем на гиперссылку
        stepText = replaceUrlWithHyperlink(stepText);
        if (step.status === true) {
          result += `✅ ${stepText}\n`;
        } else {
          result += `❌ ${stepText}\n`;
        }
      }
      result += '\n📸 *Скриншоты шагов:*\n';
    }
    return result;
  }

  formatAnalytics(data) {
    // Аналог returnAnalitycs.py
    if (!data || (Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
      return '*Нет данных для отображения*';
    }
    // Если data — массив (как в Python-боте)
    if (Array.isArray(data)) {
      const total = data.length;
      const successCount = data.filter(item => item.status === true).length;
      const failCount = total - successCount;
      const percentSuccess = total > 0 ? (successCount / total * 100).toFixed(1) : '0.0';
      const percentFail = total > 0 ? (failCount / total * 100).toFixed(1) : '0.0';
      let text = `📊 *Аналитика*\n\n`;
      text += `✅ *Всего запланированных проверок:* ${total}\n`;
      text += `🔄 *Частота:* раз в час\n`;
      text += `🟢 *Успешных проверок:* ${successCount} (${percentSuccess}%)\n`;
      text += `🔴 *Неуспешных / пропущенных:* ${failCount} (${percentFail}%)\n`;
      // Гиперссылки
      text = returnHyperlink(text);
      return text;
    }
    // Старый формат (объект)
    let result = '*📊 Аналитика*\n\n';
    if (data.totalTests !== undefined) {
      result += `*Всего тестов:* ${data.totalTests}\n`;
    }
    if (data.passedTests !== undefined) {
      result += `*Пройдено:* ${data.passedTests}\n`;
    }
    if (data.failedTests !== undefined) {
      result += `*Провалено:* ${data.failedTests}\n`;
    }
    if (data.successRate !== undefined) {
      result += `*Процент успеха:* ${data.successRate}%\n`;
    }
    if (data.averageExecutionTime !== undefined) {
      result += `*Среднее время выполнения:* ${data.averageExecutionTime}мс\n`;
    }
    // Гиперссылки
    result = returnHyperlink(result);
    return result;
  }

  async stop() {
    if (this.bot) {
      logBot('Остановка Telegram бота...');
      await this.bot.stopPolling();
      this.isRunning = false;
      logBot('Telegram бот остановлен');
    }
  }

  isBotRunning() {
    return this.isRunning;
  }

  async sendScheduledReports(chatId, reports) {
    logBot(`Отправка ${reports.length} отчетов по расписанию в чат ${chatId}`);
    
    let totalTests = reports.length;
    let passedTests = 0;
    let failedTests = 0;
    
    for (let i = 0; i < reports.length; i++) {
      const testData = reports[i];
      // Передаем opts.autoReport = true для автоотчета
      const reportText = this.formatReport(testData, i, { autoReport: true });
      
      // Подсчитываем статистику
      if (testData.Report && testData.Report.length > 0) {
        const report = testData.Report[0];
        if (report.status === true) {
          passedTests++;
        } else {
          failedTests++;
        }
      }
      
      try {
        await this.bot.sendMessage(chatId, reportText, {
          disable_web_page_preview: true,
          parse_mode: 'Markdown'
        });
        logBot(`Отправлен текстовый автоотчет ${i + 1}/${reports.length} в чат ${chatId}`);
        
        // Ждем 1 секунду перед отправкой скриншотов
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Собираем скриншоты
        if (testData.Report && testData.Report[0] && testData.Report[0].ReportStep) {
          const screenshots = [];
          for (const step of testData.Report[0].ReportStep) {
            if (step.Screenshot && step.Screenshot.data) {
              const imageBuffer = Buffer.from(step.Screenshot.data, 'base64');
              const tempFile = require('temp').path({ suffix: '.png' });
              require('fs').writeFileSync(tempFile, imageBuffer);
              screenshots.push({
                type: 'photo',
                media: require('fs').createReadStream(tempFile)
              });
            }
          }
          // Отправляем скриншоты пачками по 10
          for (let j = 0; j < screenshots.length; j += 10) {
            const album = screenshots.slice(j, j + 10);
            try {
              await this.bot.sendMediaGroup(chatId, album);
              // Ждем 2 секунды между пачками скриншотов
              if (j + 10 < screenshots.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            } catch (error) {
              if (error.message.includes('429')) {
                logBot(`Rate limit при отправке скриншотов автоотчета, ожидание 5 секунд...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                // Повторная попытка
                await this.bot.sendMediaGroup(chatId, album);
              } else {
                throw error;
              }
            }
          }
          logBot(`Отправлены все скриншоты для автоотчета ${i + 1} в чат ${chatId}`);
        }
        
        // Ждем 1 секунду между автоотчетами
        if (i < reports.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        logBot(`Ошибка при отправке автоотчета ${i + 1} в чат ${chatId}:`, error.message);
        
        // Обработка rate limiting для автоотчетов
        if (error.message.includes('429')) {
          const retryAfter = error.message.match(/retry after (\d+)/);
          const waitTime = retryAfter ? parseInt(retryAfter[1]) * 1000 : 5000;
          logBot(`Rate limit достигнут для автоотчета, ожидание ${waitTime/1000} секунд...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Повторная попытка отправки
          try {
            await this.bot.sendMessage(chatId, reportText, {
              disable_web_page_preview: true,
              parse_mode: 'Markdown'
            });
            logBot(`Повторная отправка автоотчета ${i + 1} успешна`);
          } catch (retryError) {
            logBot(`Повторная попытка отправки автоотчета ${i + 1} не удалась:`, retryError.message);
          }
        }
      }
    }
    
    // Отправляем итоговое резюме для автоотчетов
    await this.sendScheduledTestSummary(chatId, totalTests, passedTests, failedTests);
    
    logBot(`Все автоотчеты отправлены в чат ${chatId}`);
  }

  async sendScheduledTestSummary(chatId, totalTests, passedTests, failedTests) {
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';
    const failureRate = totalTests > 0 ? ((failedTests / totalTests) * 100).toFixed(1) : '0.0';
    
    let summaryText = '📊 *АВТООТЧЕТ ПО РАСПИСАНИЮ*\n\n';
    summaryText += `🔢 *Всего тестов:* ${totalTests}\n`;
    summaryText += `✅ *Пройдено:* ${passedTests} (${successRate}%)\n`;
    summaryText += `❌ *Провалено:* ${failedTests} (${failureRate}%)\n\n`;
    
    if (passedTests === totalTests) {
      summaryText += '🎉 *Отличный результат! Все тесты пройдены успешно!*';
    } else if (passedTests > failedTests) {
      summaryText += '👍 *Хороший результат! Большинство тестов пройдено.*';
    } else if (failedTests === totalTests) {
      summaryText += '⚠️ *Все тесты провалены. Требуется внимание!*';
    } else {
      summaryText += '⚠️ *Есть проблемы. Некоторые тесты провалены.*';
    }
    
    try {
      await this.bot.sendMessage(chatId, summaryText, { 
        parse_mode: 'Markdown' 
      });
      logBot(`Отправлено итоговое резюме автоотчета в чат ${chatId}`);
    } catch (error) {
      logBot(`Ошибка при отправке итогового резюме автоотчета в чат ${chatId}:`, error.message);
    }
    // Добавлено: отправка алерта при наличии упавших тестов
    await this.sendAlertIfFailedTests(failedTests, totalTests);
  }

  // Добавлено: функция для отправки алерта в отдельный чат при наличии упавших тестов
  async sendAlertIfFailedTests(failedTests, totalTests) {
    if (failedTests > 0 && process.env.TELEGRAM_ALERT_CHAT_ID) {
      const alertText = `🚨 *ВНИМАНИЕ!*\n\nОбнаружены упавшие тесты!\n\n❌ Провалено: ${failedTests} из ${totalTests}\n\nПроверьте отчёты и примите меры!`;
      try {
        await this.bot.sendMessage(process.env.TELEGRAM_ALERT_CHAT_ID, alertText, { parse_mode: 'Markdown' });
        logBot(`Отправлено алерт-сообщение о проваленных тестах в чат ${process.env.TELEGRAM_ALERT_CHAT_ID}`);
      } catch (error) {
        logBot(`Ошибка при отправке алерт-сообщения:`, error.message);
      }
    }
  }
}

module.exports = new TelegramBotService(); 