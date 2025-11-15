const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createReportStep = async (value, reportId, status) => {
  const report = await prisma.reportStep.create({
    data: {
      value,
      reportId,
      status,
    },
  });

  return report;
};

module.exports = { createReportStep };
