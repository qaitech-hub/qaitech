function reportToHtml(data) {
  let resultHTML = "";

  // Берём последний отчет из массива Report
  const latestReport = data.Report?.[data.Report.length - 1];

  // Проверяем, есть ли отчёт
  if (!latestReport) return "";

  // Заголовок теста
  resultHTML += `<p class="heading">Тест «${data.title}» ${
    latestReport.status ? "пройден" : "не пройден"
  }</p>\n\n`;

  // Проходим по шагам отчета
  latestReport.ReportStep.forEach((step) => {
    const stepText = step.value;

    const statusEmoji = step.status ? "✅" : "❌";

    // Ищем URL в тексте шага
    const urlMatch = stepText.match(/https?:\/\/[^\s"]+/);

    let formattedStep = stepText;

    // Если найдена ссылка — заменяем её на <a> тег
    if (urlMatch) {
      const url = urlMatch[0];
      formattedStep = stepText.replace(
        url,
        `<a target="_blank" href="${url}" style="color: #68ebb0">🔗Ссылка</a>`
      );
    }

    // Добавляем к результату
    resultHTML += `      <p class="text">${statusEmoji} ${formattedStep}</p>\n`;
  });

  return resultHTML.trim();
}

module.exports = reportToHtml;
