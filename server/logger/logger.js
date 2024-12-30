const winston = require("winston");
const MongoDB = require("winston-mongodb").MongoDB
require("dotenv").config();
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(winston.format.simple()),
  transports: [
    new winston.transports.Console(),
    new(winston.transports.MongoDB)({
      db : process.env.DATABASE_URI,
      collection: 'logs'
    }),
  ],
});

const asyncLog = {};
asyncLog.info = (message) => {
  return new Promise((resolve, reject) => {
    logger.info(message, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(true);
    });
  });
};

asyncLog.error = (message) => {
  return new Promise((resolve, reject) => {
    logger.error(message, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(true);
    });
  });
};

asyncLog.warn = (message) => {
  return new Promise((resolve, reject) => {
    logger.warn(message, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(true);
    });
  });
};

asyncLog.debug = (message) => {
  return new Promise((resolve, reject) => {
    logger.debug(message, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(true);
    });
  });
};

asyncLog.silly = (message) => {
  return new Promise((resolve, reject) => {
    logger.silly(message, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(true);
    });
  });
};

module.exports = asyncLog;
