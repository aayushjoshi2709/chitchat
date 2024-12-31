const User = require("../../models/User/User.model");
const AuthRouter = require("express").Router();
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const UserDto = require("../../dtos/User.dto");
const LoginDto = require("../../dtos/Login.dto");
const jwt = require("jsonwebtoken");
const dtoValidator = require("../../middlewares/dtoValidator.middleware");
const { userCache } = require("../../redis/redis");

async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}
function generateToken(user) {
  return jwt.sign({ username: user.username }, process.env.JWT_SECRET);
}

// create user route
AuthRouter.post(
  "/register",
  dtoValidator(UserDto, "body"),
  async (req, res) => {
    //adding the user to database
    const logger = req.logger;
    logger.info("Going to register a user");
    let userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      password: await hashPassword(req.body.password),
    };
    logger.debug("User: " + userData);
    User.findOne({
      $or: [{ username: userData.username }, { email: userData.email }],
    }).then((user) => {
      if (user) {
        logger.error("User already exists");
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "A user with same username/email already exists",
        });
      } else {
        User.create(userData)
          .then((user) => {
            logger.info("User registered successfully" + user);
            token = generateToken(user);
            delete user.password;
            userCache.set(user.username, JSON.stringify(user));
            return res
              .status(StatusCodes.CREATED)
              .send({ message: "User registered successfully.", token: token });
          })
          .catch((error) => {
            logger.error("Error in registering user: " + error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
              message: "Error registering user",
            });
          });
      }
    });
  }
);

AuthRouter.post("/login", dtoValidator(LoginDto, "body"), async (req, res) => {
  const logger = req.logger;
  const { username, password } = req.body;
  logger.info("Logging in user:" + username);
  User.findOne({ username: username })
    .select("-messages")
    .then(async (user) => {
      logger.info(`User found for username: ${username}` + user)
      if (!user) {
        logger.error("User not found for username: " + username);
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send({ message: "User not found" });
      }
      if (await comparePassword(password, user.password)) {
        const token = generateToken(user);
        logger.info("Login successful for username: " + username);
        delete user.password;
        userCache.set(user.username, JSON.stringify(user));
        return res
          .status(StatusCodes.OK)
          .send({ message: "Login successful", token: token });
      } else {
        logger.error("Invalid password for user for username: " + username);
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send({ message: "Invalid password" });
      }
    })
    .catch((error) => {
      logger.error("Error finding user: " + error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "Error finding user",
      });
    });
});

module.exports = AuthRouter;
