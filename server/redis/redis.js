const redis = require("redis");
const logger = require("../logger/logger");
require("dotenv").config();

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient
  .connect()
  .then(() => {
    logger.info("Connected to Redis");
  })
  .catch((err) => {
    logger.info("Redis client failed to connect:", err);
  });

redisClient.on("connect", (err) => {
  logger.info(
    "Redis client connected successfully on port: " + process.env.REDIS_PORT
  );
});

redisClient.on("error", (err) => {
  logger.info("Redis connection error: " + err);
});

redisClient
  .ping()
  .then((reply) => {
    logger.info("Redis PING response:", reply);
  })
  .catch((err) => {
    logger.error("Error on ping command:", err);
  });

module.exports = redisClient;
