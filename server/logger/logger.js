const winston = require("winston");
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/info.log", level: "info" }),
    new winston.transports.File({ filename: "logs/warn.log", level: "warn" }),
    new winston.transports.File({ filename: "logs/debug.log", level: "debug" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

module.exports = logger;
