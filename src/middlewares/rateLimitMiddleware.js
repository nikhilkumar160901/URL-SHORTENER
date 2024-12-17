const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10, 
  message: "Too many requests, please try again later."
});

module.exports = {
  rateLimitMiddleware: limiter
};
