const prisma = require("../db");

const getUserByEmail = async (email) => {
  const data = await prisma.user.findUnique({ where: { email } });

  return data;
};

const getUserByUsername = async (username) => {
  const data = await prisma.user.findUnique({ where: { username } });

  return data;
};

const getUserById = async (id) => {
  const data = await prisma.user.findUnique({ where: { id } });

  return data;
};

module.exports = { getUserByEmail, getUserByUsername, getUserById };
