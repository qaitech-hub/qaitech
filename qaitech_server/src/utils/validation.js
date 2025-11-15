const { z } = require("zod");

const LoginSchema = z.object({
  email: z.string().email({ message: "Неверный формат почты" }),
  password: z.string().min(1, { message: "Введите пароль" }),
});

const RegisterSchema = z.object({
  email: z.string().email({ message: "Неверный формат почты" }),
  username: z.string().min(4, { message: "Минимум 4 символа" }),
});

const CodeSchema = z.object({
  code: z.string().min(6, { message: "Минимум 6 символов" }),
});

const PasswordSchema = z.object({
  password: z.string().min(8, { message: "Минимум 8 символов" }),
  passwordSecond: z.string().min(8, { message: "Минимум 8 символов" }),
});

const EmailSchema = z.object({
  email: z.string().email({ message: "Неверный формат почты" }),
});

const WorkSpaceSchema = z.object({
  title: z.string().min(6, { message: "Минмум 6 символов" }),
});

const validateUrl = (url) => {
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }
};

const validateFile = (file) => {
  if (!file || file.mimetype !== 'text/html') {
    throw new Error('Invalid HTML file');
  }
};

module.exports = {
  LoginSchema,
  RegisterSchema,
  CodeSchema,
  PasswordSchema,
  EmailSchema,
  WorkSpaceSchema,
  validateUrl,
  validateFile,
};
