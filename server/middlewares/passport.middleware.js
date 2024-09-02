const jwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const User = require("../models/User/User.model");
require("dotenv").config();
module.exports = new jwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (req, jwt_payload, next) => {
    logger = req.logger;
    loggger.info("Going get the user form the database using the jwt_payload");
    logger.silly("jwt_payload: " + jwt_payload);
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        logger.info("User found in the database");
        logger.silly("User" + user);
        next(null, user);
      } else {
        logger.info("User not found in the database");
        next(null, false);
      }
    } catch (error) {
      logger.error("Error getting the user from the database");
      logger.error("Database error details :" + error);
      next(error, false);
    }
  }
);
