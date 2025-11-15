const express = require('express');
const router = express.Router();
const { createUser, getUserById, updateUser } = require('../../services/userService');

// /**
//  * Регистрация нового пользователя.
//  * @route POST /api/users
//  * @param {string} email - Email пользователя.
//  * @param {string} username - Имя пользователя.
//  * @param {string} password - Пароль пользователя.
//  * @returns {Object} - Созданный пользователь.
//  */
// router.post('/', async (req, res) => {
//   const { email, username, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: 'Email and password are required' });
//   }

//   try {
//     const user = await createUser(email, username, password);
//     res.status(201).json(user);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create user' });
//   }
// });

// /**
//  * Получение информации о пользователе по ID.
//  * @route GET /api/users/:userId
//  * @param {string} userId - ID пользователя.
//  * @returns {Object} - Найденный пользователь.
//  */
// router.get('/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const user = await getUserById(userId);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch user' });
//   }
// });

/**
 * Обновление данных пользователя.
 * @route PUT /api/users/:userId
 * @param {string} userId - ID пользователя.
 * @param {Object} data - Данные для обновления (email, username, password).
 * @returns {Object} - Обновленный пользователь.
 */
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { email, username, password } = req.body;

  if (!email && !username && !password) {
    return res.status(400).json({ error: 'At least one field is required' });
  }

  try {
    const user = await updateUser(userId, { email, username, password });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;