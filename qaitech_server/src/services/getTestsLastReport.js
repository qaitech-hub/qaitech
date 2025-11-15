const prisma = require("../db/db");

const getTestsLastReport = async (tests = []) => {
  let arr = [];

  console.log(tests, "ass");

  for (let i = 0; i < tests.length; i++) {
    const res = await prisma.test.findUnique({
      where: { id: tests[i] },
      include: {
        Report: {
          include: {
            ReportStep: {
              include: { Screenshot: true },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });
    arr.push(res);
  }

  return arr;
};

module.exports = getTestsLastReport;
