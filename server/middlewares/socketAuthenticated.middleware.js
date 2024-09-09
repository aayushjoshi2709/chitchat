const jwt = require("jsonwebtoken");
const { userCache, socketCache } = require("../redis/redis");
const { User } = require("../models/User/User.model");
const logger = require("../logger/logger");

const socketAuthenticated = async (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    await jwt.verify(
      socket.handshake.query.token,
      process.env.JWT_SECRET,
      async (err, decoded) => {
        if (err) {
          return next(new Error("Authentication error"));
        }
        user = await userCache.get(decoded.username);
        if (user) {
          console.log(user);
          user = JSON.parse(user);
          logger.info("User found in cache: " + JSON.stringify(user));
          socket.user = user;
          socketCache.set(user.username, socket.id);
          next();
        } else {
          logger.info(
            "User not found in cache going to hit the db:" + decoded.username
          );
          User.findOne({ username: decoded.username })
            .select("-password")
            .exec()
            .then(async (user) => {
              if (!user) {
                logger.error(
                  "User not found for the token:" + decoded.username
                );
                next(new Error("User not found"));
              }
              delete user.password;
              await userCache.set(decoded.username, JSON.stringify(user));
              socket.user = user;
              socketCache.set(user.username, socket.id);
              next();
            })
            .catch((error) => {
              logger.error(
                "Error while finding user for the token:" + decoded.username
              );
              logger.error(error);
              next(new Error("Something went wrong"));
            });
        }
      }
    );
  } else {
    new Error("JWT token not supplied");
  }
};

module.exports = socketAuthenticated;
