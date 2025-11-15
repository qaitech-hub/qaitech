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

const getAllTest = async (id) => {
  const tests = await prisma.project.findUnique({
    where: { id },
    include: {
      Page: {
        include: {
          Test: true,
        },
      },
    },
  });

  return collectAllTests(tests);
};

module.exports = getAllTest;
