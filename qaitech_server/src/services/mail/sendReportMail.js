const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const sendReportMail = async (mail, htmlReportForMail, images = []) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const date = new Date();

  // Получаем часы и минуты
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Получаем день, месяц и год
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
  const year = date.getFullYear();

  // Формируем строку
  const formattedDate = `${hours}:${minutes} ${day}.${month}.${year}`;

  const templatePath = path.join(
    process.cwd(),
    "src/services/mail",
    "mailReport.html"
  );
  const htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  const htmlContent = htmlTemplate.replace(/{htmlString}/g, htmlReportForMail);

  // Подготавливаем attachments
  const attachments = [];

  // Добавляем base64 картинки
  images.forEach((imageBase64, index) => {
    attachments.push({
      filename: `screenshot-${index + 1}.png`,
      content: imageBase64.replace(/^data:image\/png;base64,/, ""), // Убираем префикс, если есть
      encoding: "base64",
      contentType: "image/png",
    });
  });

  // Пример PDF (можно оставить закомментированным или удалить)
  // attachments.push({
  //   filename: "Презентация.pdf",
  //   path: path.join(process.cwd(), "QAITECH.pdf"),
  //   contentType: "application/pdf",
  // });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: mail,
    subject: `Отчет QAITECH.Agent за ${formattedDate}`,
    html: htmlContent,
    attachments,
  };

  await transporter.on("nodemailer log", console.log);
  await transporter.sendMail(mailOptions);
};

module.exports = sendReportMail;
