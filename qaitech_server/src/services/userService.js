const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Создает нового пользователя.
 * @param {string} email - Email пользователя.
 * @param {string} username - Имя пользователя.
 * @param {string} password - Пароль пользователя.
 * @returns {Promise<Object>} - Созданный пользователь.
 */
const createUser = async (email, username, password) => {
  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password,
      },
    });
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Получает пользователя по ID.
 * @param {string} userId - ID пользователя.
 * @returns {Promise<Object>} - Найденный пользователь.
 */
const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Обновляет данные пользователя.
 * @param {string} userId - ID пользователя.
 * @param {Object} data - Данные для обновления (email, username, password).
 * @returns {Promise<Object>} - Обновленный пользователь.
 */
const updateUser = async (userId, data) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data,
    });
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
};