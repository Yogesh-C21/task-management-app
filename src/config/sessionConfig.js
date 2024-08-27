// config/sessionConfig.js
const session = require("express-session");
const config = require("./config");

module.exports = session({
  secret: config.getSessionSecret(), // Use a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true, // Helps prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day)
  },
});
