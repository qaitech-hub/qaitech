const prisma = require("../db/db");

const getStats = async (period = "Отчет за день") => {
  let startDate;

  const now = new Date();

  switch (period) {
    case "Отчет за день":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1); // 24 часа назад
      break;
    case "Отчет за неделю":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7); // 7 дней назад
      break;
    case "Отчет за месяц":
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1); // 30 дней назад
      break;
    case "Отчет за пол года":
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 6); // 6 месяцев назад
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1); // 24 часа назад
  }

  try {
    const reports = await prisma.report.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
    });

    return reports;
  } catch (error) {
    console.error("Ошибка при получении отчетов:", error);
    throw error;
  }
};

module.exports = { getStats };
