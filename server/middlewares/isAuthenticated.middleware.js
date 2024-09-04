const User = require("../models/User/User.model");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const redisClient = require("../redis/redis");
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
    const user = await redisClient.get(decoded.id);
    if (user) {
      req.user = user;
      next();
    } else {
      await User.findById(decoded.id)
        .then((user) => {
          if (!user) {
            logger.error("User not found for the token:" + decoded.id);
            return res
              .status(StatusCodes.UNAUTHORIZED)
              .send({ message: "Invalid token" });
          }
          //redisClient.set(decoded.id, user);
          req.user = user;
          next();
        })
        .catch((error) => {
          logger.error("Error while finding user for the token:" + decoded.id);
          logger.error(error);
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send({ message: "Something went wrong" });
        });
    }
  });
};
module.exports = isAuthenticated;
