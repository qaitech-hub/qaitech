const express = require('express');
const multer = require('multer');
const upload = multer();
const { parseUrl, parseFile } = require('../../controllers/parserController');

const router = express.Router();

router.post('/parser/url', upload.none(), parseUrl);
router.post('/parser/file', upload.none(), parseFile);

module.exports = router; 