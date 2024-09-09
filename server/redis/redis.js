const redis = require("ioredis");
const logger = require("../logger/logger");
require("dotenv").config();

const userCache = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: 0,
});

const socketCache = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: 1,
});

function checkConnection(redisClient) {
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
}

checkConnection(userCache);
checkConnection(socketCache);
module.exports = { userCache, socketCache };
