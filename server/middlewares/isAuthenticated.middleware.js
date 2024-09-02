const User = require("../models/User/User.model");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
// check if the user is logged in or not
const isAuthenticated = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const logger = req.logger;
  if (!token) {
    const err = new Error("Invalid token");
    err.status = 401;
    next(err);
  }
  await jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
    if (error) {
      logger.error("Error while verifying token");
      logger.error(error);
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: "Invalid token" });
    }
    await User.findById(decoded.id)
      .then((user) => {
        if (!user) {
          logger.error("User not found for the token:" + decoded.id);
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .send({ message: "Invalid token" });
        }
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
  });
};
module.exports = isAuthenticated;
