const express = require("express");
const axios = require("axios");

const licenseRoute = express.Router();

/**
 * Проверка валидности лицензии.
 * @route POST /api/license/check
 * @urlparam {string} key - ключ лицензии.
 * @returns {Object} - Созданный проект.
 */

licenseRoute.post("/check", async (req, res) => {
  try {
    const { key } = req.body;

    const data = await axios.post(
      `${process.env.LICENSE_APP_SERVER_URL}/api/license/key/validate`,
      key
    );
    console.log(data?.data);
    if (data.data?.success === false)
      return res.status(500).json({ error: data.data?.status });

    res.status(200).json({ success: "ass" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Что-то пошло не так" });
  }
});

module.exports = licenseRoute;
