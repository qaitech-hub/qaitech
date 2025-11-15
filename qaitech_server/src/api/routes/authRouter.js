const express = require("express");
const { createId } = require("@paralleldrive/cuid2");
const bcrypt = require("bcryptjs");
const {
  LoginSchema,
  RegisterSchema,
  CodeSchema,
  PasswordSchema,
  EmailSchema,
} = require("../../utils/validation");
const { getUserByEmail, getUserById } = require("../../db/user/getUser");
const prisma = require("../../db/db");
const {
  generateVerificationToken,
} = require("../../db/token/generateVerificationToken");
const {
  generatePasswordRestorationToken,
} = require("../../db/token/generatePasswordRestorationToken");
const sendVerificationMail = require("../../services/mail/sendVerificationMail");
const {
  getVerificationTokenByEmail,
  deleteVerificationToken,
} = require("../../db/token/verificationToken");
const { createProject } = require("../../services/projectService");
const sendPasswordRestorationMail = require("../../services/mail/sendPasswordRestorationMail");
const {
  getPasswordRestorationTokenByEmail,
  deletePasswordRestorationToken,
} = require("../../db/token/passwordRestorationToken");
const router = express.Router();

router
  .route("/login")
  .get(async (req, res) => {
    try {
      if (req?.session?.user && req.session?.user?.id)
        return res.status(200).json({
          loggedIn: true,
          id: req.session.user.id,
        });

      return res.status(200).json({ loggedIn: false });
    } catch (err) {
      return res.status(500).json({ loggedIn: false });
    }
  })
  .post(async (req, res) => {
    try {
      // валидация полей
      const validatedFields = LoginSchema.safeParse(req.body);
      if (!validatedFields.success)
        return res.status(500).json({ error: "Check the login details" });

      const { email, password } = validatedFields.data;
      // валидация полей

      // проверка, есть ли юзер с таким емалом
      const existingUser = await getUserByEmail(email.toLowerCase());
      if (
        !existingUser ||
        !existingUser?.password ||
        !existingUser.emailVerified
      )
        return res
          .status(500)
          .json({ error: "There is no user with this email address." });
      // проверка, есть ли юзер с таким емалом

      // если у юзера не подтверждена пошта
      // if (!existingUser.emailVerified) {
      //   return res
      //     .status(500)
      //     .json({ error: "Пользователя с такой почтой не существует" });
      // const verificationToken = await generateVerificationToken(
      //   existingUser.email
      // );

      // await sendVerificationMail(
      //   verificationToken.email.toLowerCase(),
      //   verificationToken.token
      // );

      // return res.status(200).json({
      //   message: `Письмо отправлено на почту ${email.toLowerCase()}`,
      // });
      // }
      // если у юзера не подтверждена пошта

      // проверяем сходство паролей
      const isSamePass = await bcrypt.compare(password, existingUser?.password);

      if (!isSamePass)
        return res.json({
          loggedIn: false,
          error: "Invalid email or password",
        });
      // проверяем сходство паролей

      // токен
      const verificationToken = await generateVerificationToken(
        email.toLowerCase()
      );

      await sendVerificationMail(
        verificationToken.email.toLowerCase(),
        verificationToken.token
      );
      // токен

      return res.status(200).json({
        message: `The letter has been sent to the email ${email.toLowerCase()}`,
      });
    } catch (err) {
      return res.status(500).json({ error: "Something went wrong..." });
    }
  });

router.post("/register", async (req, res) => {
  try {
    // валидация полей
    const validatedFields = RegisterSchema.safeParse(req.body);

    if (!validatedFields.success)
      return res.status(500).json({ error: "Check the registration details" });

    const { email, username } = validatedFields.data;
    // валидация полей

    // проверка, есть ли юзер с таким емалом
    const existingUser = await getUserByEmail(email.toLowerCase());
    if (existingUser && !!existingUser?.emailVerified)
      return res.status(500).json({ error: "E-mail is busy" });
    else if (!existingUser)
      await prisma.user.create({
        data: {
          email: email.toLowerCase(),
        },
      });
    // проверка, есть ли юзер с таким емалом

    // костыль или защита от даолбаеба (не спрашивайте)
    await prisma.user.update({
      where: { email: email?.toLowerCase() },
      data: {
        username: username?.toLowerCase(),
      },
    });
    // костыль или защита от даолбаеба (не спрашивайте)

    // токен
    const verificationToken = await generateVerificationToken(
      email.toLowerCase()
    );

    await sendVerificationMail(
      verificationToken.email.toLowerCase(),
      verificationToken.token
    );
    // токен

    return res.status(200).json({
      message: `The letter has been sent to the email ${email.toLowerCase()}`,
    });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/check_code", async (req, res) => {
  try {
    // валидация полей
    const validatedFields = CodeSchema.safeParse({ code: req.body?.code });

    if (!validatedFields.success)
      return res.status(500).json({ error: "Check the code" });

    const { code } = validatedFields.data;
    // валидация полей

    // проверяем, существует ли токен или не истек ли он
    const existingToken = await getVerificationTokenByEmail(
      req.body?.email?.toLowerCase()
    );
    if (!existingToken || existingToken.token !== code)
      return res.status(500).json({ error: "Invalid code" });

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired)
      return res.status(500).json({ error: "The code's is expired" });
    // проверяем, существует ли токен или не истек ли он

    // если проверки пройдены, верифицируем эмаил юзера и создаем сессию
    await deleteVerificationToken(existingToken.id);

    const user = await prisma.user.update({
      where: { email: req.body?.email?.toLowerCase() },
      data: {
        id: createId() + " noPassword",
        emailVerified: new Date(),
      },
    });

    req.session.user = {
      id: user?.id,
    };

    return res.status(200).json({
      message: `Email has been successfully confirmed`,
    });
    // если проверки пройдены, верифицируем эмаил юзера и создаем сессию
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    // валидация полей
    const validatedFields = CodeSchema.safeParse({ code: req.body?.code });

    if (!validatedFields.success)
      return res.status(500).json({ error: "Check the data" });

    const { code } = validatedFields.data;
    // валидация полей

    // проверяем, существует ли токен или не истек ли он
    const existingToken = await getVerificationTokenByEmail(
      req.body?.email?.toLowerCase()
    );
    if (!existingToken || existingToken.token !== code)
      return res.status(500).json({ error: "Invalid code" });

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired)
      return res.status(500).json({ error: "The code's is expired" });
    // проверяем, существует ли токен или не истек ли он

    // если проверки пройдены, верифицируем эмаил юзера и создаем сессию
    await deleteVerificationToken(existingToken.id);

    const user = await getUserByEmail(req.body?.email?.toLowerCase());

    req.session.user = {
      id: user?.id,
      loggedIn: true,
    };

    return res.status(200).json({
      loggedIn: true,
      userId: req.session.user.id,
      message: "Successful authorization",
    });
    // если проверки пройдены, верифицируем эмаил юзера и создаем сессию
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/confirm_restore", async (req, res) => {
  try {
    // валидация полей
    const validatedFields = CodeSchema.safeParse({ code: req.body?.code });

    if (!validatedFields.success)
      return res.status(500).json({ error: "Check code" });

    const { code } = validatedFields.data;
    // валидация полей

    // проверяем, существует ли токен или не истек ли он
    const existingToken = await getPasswordRestorationTokenByEmail(
      req.body?.email?.toLowerCase()
    );
    if (!existingToken || existingToken.token !== code)
      return res.status(500).json({ error: "Invalid code" });

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired)
      return res.status(500).json({ error: "The code's is expired" });
    // проверяем, существует ли токен или не истек ли он

    // если проверки пройдены, то пусть уже меняет пароль, так уж и быть
    await deletePasswordRestorationToken(existingToken.id);

    return res.status(200).json({ message: "Enter new password" });
    // если проверки пройдены, то пусть уже меняет пароль, так уж и быть
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/create_password", async (req, res) => {
  try {
    // валидация полей
    const validatedFields = PasswordSchema.safeParse({
      password: req.body?.password,
      passwordSecond: req.body?.passwordSecond,
    });

    if (!validatedFields.success)
      return res.status(500).json({ error: "Check data" });

    const { password, passwordSecond } = validatedFields.data;

    if (password !== passwordSecond)
      return res.status(500).json({ error: "Passwords don't match" });
    // валидация полей

    // проверяем, существует ли юзер с таки айди
    const existingUser = await getUserById(req.session?.user?.id);
    if (!existingUser || !existingUser?.emailVerified)
      return res.status(500).json({ error: "Something went wrong" });
    // проверяем, существует ли юзер с таки айди

    // если проверки пройдены, верифицируем юзера
    const hashedPass = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: req.session?.user?.id },
      data: {
        id: createId(),
        password: hashedPass,
      },
    });

    req.session.user = {
      id: user?.id,
      loggedIn: true,
    };
    // если проверки пройдены, верифицируем юзера

    // создание проекта
    const project = await createProject("My Project", user?.id);
    // создание проекта

    return res.status(200).json({
      message: `The password was created successfully`,
      projectId: project?.id,
    });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/forgot_password/email", async (req, res) => {
  try {
    // валидация полей
    const validatedFields = EmailSchema.safeParse(req.body);
    if (!validatedFields.success)
      return res.status(500).json({ error: "Check the email" });

    const { email } = validatedFields.data;
    // валидация полей

    // проверка, есть ли юзер с таким емалом
    const existingUser = await getUserByEmail(email.toLowerCase());
    if (!existingUser || !existingUser.password)
      return res
        .status(500)
        .json({ error: "There is no user with this email" });
    // проверка, есть ли юзер с таким емалом

    // токен
    const passwordRestorationToken = await generatePasswordRestorationToken(
      email.toLowerCase()
    );

    await sendPasswordRestorationMail(
      passwordRestorationToken.email.toLowerCase(),
      passwordRestorationToken.token
    );
    // токен

    return res.status(200).json({
      message: `The letter has been sent to the email ${email.toLowerCase()}`,
    });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/forgot_password/change_password", async (req, res) => {
  try {
    // валидация полей
    const validatedFields = PasswordSchema.safeParse({
      password: req.body?.password,
      passwordSecond: req.body?.passwordSecond,
    });

    if (!validatedFields.success)
      return res.status(500).json({ error: "Check data" });

    const { password, passwordSecond } = validatedFields.data;

    if (password !== passwordSecond)
      return res.status(500).json({ error: "Passwords don't match" });
    // валидация полей

    // если проверки пройдены, верифицируем юзера
    const hashedPass = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { email: req.body?.email?.toLowerCase() },
      data: {
        password: hashedPass,
      },
    });
    // если проверки пройдены, верифицируем юзера

    return res.status(200).json({
      message: `Password has been successfully updated`,
    });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
