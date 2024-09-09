const User = require("../models/User/User.model");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { userRedis } = require("../redis/redis");
// check if the user is logged in or not
const isAuthenticated = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const logger = req.logger;
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: "Invalid token" });
  }
  await jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
    if (error) {
      logger.error("Error while verifying token");
      logger.error(error);
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: "Invalid token" });
    }

    if (decoded.username) {
      logger.info("Going to find user in cache: " + decoded.username);
      const user = await userRedis.get(decoded.username);
      if (user) {
        logger.info("User found in cache: " + user);
        req.user = JSON.parse(user);
        next();
      } else {
        logger.info(
          "User not found in cache going to hit the db:" + decoded.username
        );
        User.findOne({ username: decoded.username })
          .then((user) => {
            if (!user) {
              logger.error("User not found for the token:" + token);
              return res
                .status(StatusCodes.UNAUTHORIZED)
                .send({ message: "Invalid token" });
            }
            userRedis.set(decoded.username, JSON.stringify(user));
            req.user = user.toObject();
            next();
          })
          .catch((error) => {
            logger.error("Error while finding user for the token:" + token);
            logger.error(error);
            return res
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .send({ message: "Something went wrong" });
          });
      }
    } else {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: "Invalid token" });
    }
  });
};
module.exports = isAuthenticated;
