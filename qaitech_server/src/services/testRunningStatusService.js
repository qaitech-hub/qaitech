const prisma = require("../db/db");

const setTrueTestsStatus = async (idsArr = []) => {
  try {
    // Фильтруем только валидные строковые ID
    const validIds = idsArr.filter(id => id && typeof id === 'string' && id.trim() !== '');
    
    for (const testId of validIds) {
      await prisma.test.update({
        where: { id: testId },
        data: {
          isRunning: true,
        },
      });
    }
  } catch (err) {
    throw err;
  }
};

const setFalseTestsStatus = async (idsArr = []) => {
  try {
    // Фильтруем только валидные строковые ID
    const validIds = idsArr.filter(id => id && typeof id === 'string' && id.trim() !== '');
    
    for (const testId of validIds) {
      await prisma.test.update({
        where: { id: testId },
        data: {
          isRunning: false,
        },
      });
    }
  } catch (err) {
    throw err;
  }
};

const isTrueTestsStatus = async () => {
  try {
    const tests = await prisma.test.findMany({
      where: { isRunning: true },
    });
    console.log(tests);

    return tests;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  setTrueTestsStatus,
  setFalseTestsStatus,
  isTrueTestsStatus,
};
