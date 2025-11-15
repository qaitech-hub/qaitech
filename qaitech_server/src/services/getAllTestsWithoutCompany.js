const prisma = require("../db/db");

function collectAllTests(data) {
  const result = [];

  function traverse(obj) {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        traverse(item);
      }
    } else if (obj && typeof obj === "object") {
      if (obj.Test && Array.isArray(obj.Test)) {
        result.push(...obj.Test.map((i) => i.id)); // Добавляем все элементы Test в результирующий массив
      }

      for (const key in obj) {
        traverse(obj[key]);
      }
    }
  }

  traverse(data);
  return result;
}

const getAllTestsWithoutCompany = async () => {
  // Получаем все проекты (воркспейсы)
  const projects = await prisma.project.findMany({
    include: {
      Page: {
        include: {
          Test: true,
        },
      },
    },
  });

  // Собираем все тесты из всех проектов
  const allTests = [];
  for (const project of projects) {
    const projectTests = collectAllTests(project);
    allTests.push(...projectTests);
  }

  return allTests;
};

module.exports = getAllTestsWithoutCompany; 