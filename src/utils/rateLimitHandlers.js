const rateLimit = require('express-rate-limit');

class RateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs || 15 * 60 * 1000;
    this.maxRequests = maxRequests || 100;
    // in above we can make 100 req/15 min
  }

  createLimiter() {
    return rateLimit({
      windowMs: this.windowMs,
      max: this.maxRequests,
      message: {
        status: 429,
        error: 'Too many requests, please try again later.',
      },
    });
  }
}

module.exports = RateLimiter;
