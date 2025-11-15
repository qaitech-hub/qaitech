const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const router = require("./api/index");
const {
  initializeWebElementActions,
} = require("./services/webElementActionsService");
const { initializeViewPorts } = require("./services/viewPortService");
const prisma = require("./db/db");

const app = express();

app.use(express.json()); // из за этой строки я убил все нервные клетки
app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
  })
);
app.use(bodyParser.json());

// храним экспресс сессию в SQLite
const store = new SQLiteStore({ db: "sessions.sqlite", dir: "./data" });
app.use(
  session({
    store: store,
    secret: "myscecret",
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: false,
      httpOnly: false,
      sameSite: false,
      maxAge: 1000 * 60 * 60 * 24 * 7 * 30,
    },
  })
);
// храним экспресс сессию в SQLite

app.use((req, res, next) => {
  if (process.env.DISABLE_AUTH === "true") {
    // Находим первого пользователя (или создаём его)
    (async () => {
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: "admin@local",
            username: "admin",
            emailVerified: new Date(),
            password: "",
          },
        });
      }
      req.session = req.session || {};
      req.session.user = { id: user.id, loggedIn: true };
      next();
    })();
  } else {
    next();
  }
});

app.get("/api/logout", async (req, res) => {
  req.session.destroy();
  res.send("logout");
});

// Роуты
app.use("/api", router);

module.exports = () => {
  return app; // Возвращаем экземпляр приложения
};
