// Простой logger для внутреннего использования
const logger = {
  info: (message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message, error) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp} - ${message}`, error);
  },
  warn: (message, data) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.debug(`[DEBUG] ${timestamp} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
};

module.exports = logger;

