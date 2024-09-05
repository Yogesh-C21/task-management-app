require('dotenv').config();

class Config {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'jwt-secret';
    this.databaseUri = process.env.MONGO_URI;
    this.port = process.env.PORT || 3000;
    this.sessionSecret = process.env.SESSION_SECRET || 'session-secret';
    this.redisHost = process.env.REDIS_HOST || 'localhost'
    this.redisPort = process.env.REDIS_PORT || 6379
    this.redisEnabled = process.env.REDIS_ENABLED || false
    this.mailId = process.env.APP_MAIL_ID
    this.mailPassword = process.env.APP_MAIL_PASSWORD
    this.emailEnabled = process.env.EMAIL_ENABLED || false
  }

  getJwtSecret() {
    return this.jwtSecret;
  }

  getEmailEnabled() {
    return this.emailEnabled;
  }

  getMailId() {
    return this.mailId;
  }

  getMailPassword() {
    return this.mailPassword;
  }

  getDatabaseUri() {
    return this.databaseUri;
  }

  getPort() {
    return this.port;
  }

  getSessionSecret() {
    return this.sessionSecret;
  }

  getRedisEnabled() {
    return this.redisEnabled;
  }

  getRedisHost() {
    return this.redisHost;
  }

  getRedisPort() {
    return this.redisPort;
  }
}

const config = new Config();
module.exports = config;

