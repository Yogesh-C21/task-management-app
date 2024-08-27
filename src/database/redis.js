const Redis = require("ioredis");
const config = require("../config/config");

class RedisClient {
  constructor() {
    this.redis = config.redisEnabled
      ? new Redis({
          host: config.getRedisHost(),
          port: config.getRedisPort(),
        })
      : null;
  }
  async set(key, value) {
    try {
      return this.redis.set(key, value, "EX", 3 * 24 * 60 * 60); // 3 days ttl
    } catch (error) {
      throw new Error('Redis GET error: ' + error.message);
    }
  }
  async get(key) {
    try {
      return this.redis.get(key);
    } catch (error) {
      throw new Error('Redis GET error: ' + error.message);
    }
  }
  async clearRedis() {
    try {
      return this.redis.flushdb();
    } catch (error) {
      throw new Error('Redis GET error: ' + error.message);
    }
  }
}

module.exports = new RedisClient();
