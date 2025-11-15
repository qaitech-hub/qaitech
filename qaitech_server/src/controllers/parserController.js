const { parseFromHtml, parseFromUrl } = require('../services/parserService');
const { cleanHtml } = require('../services/htmlService');
const { validateUrl, validateFile } = require('../utils/validation');

exports.parseUrl = async (req, res, next) => {
  try {
    const { url, deviceType = 'DESKTOP' } = req.body;
    validateUrl(url);
    const result = await parseFromUrl(url, deviceType);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.parseFile = async (req, res, next) => {
  try {
    const { htmlFile: file } = req.body;
    const html = file.toString('utf-8');
    const lightHTML = cleanHtml(html);
    const result = parseFromHtml(lightHTML);
    if (!result || result.length === 0) {
      return res.status(400).json({
        error: 'No interactive elements found',
        details: "The HTML document doesn't contain any detectable interactive elements",
      });
    }
    res.json(result);
  } catch (error) {
    next(new Error('Failed to parse HTML file. Please check the file format.'));
  }
}; 