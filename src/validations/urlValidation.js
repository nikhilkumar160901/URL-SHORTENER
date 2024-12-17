const { body, validationResult } = require("express-validator");

const validateShortUrlRequest = [
  body("longUrl").isURL().withMessage("Invalid URL format"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateShortUrlRequest };
