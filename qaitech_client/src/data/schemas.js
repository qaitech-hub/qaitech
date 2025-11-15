import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Неверный формат почты" }),
  password: z.string().min(1, { message: "Введите пароль" }),
});

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Неверный формат почты" }),
  username: z.string().min(4, { message: "Минимум 4 символа" }),
});

export const CodeSchema = z.object({
  code: z.string().min(6, { message: "Минимум 6 символов" }),
});

export const PasswordSchema = z.object({
  password: z.string().min(8, { message: "Минимум 8 символов" }),
  passwordSecond: z.string().min(8, { message: "Минимум 8 символов" }),
});

export const EmailSchema = z.object({
  email: z.string().email({ message: "Неверный формат почты" }),
});

export const WorkSpaceSchema = z.object({
  title: z.string().min(6, { message: "Минмум 6 символов" }),
});

export const CreatePageSchema = z.object({
  title: z.string().min(1, { message: "Введите название" }),
  url: z.string().url({ message: "Неверный формат ссылки" }).or(z.literal("")),
});

export const UrlPageSchema = z.object({
  url: z.string().url({ message: "Неверный формат ссылки" }).or(z.literal("")),
});

export const AiModelSchema = z.object({
  modelName: z.string().min(1, { message: "Введите название модели" }),
  modelUrl: z.string().url({ message: "Неверный формат ссылки" }),
  token: z.string().min(1, { message: "Введите токен" }),
});

export const PromtSchema = z.object({
  promt: z.string().min(1, { message: "Введите промт" }),
});
