const User = require("../../models/User/User.model");
const userRouter = require("express").Router();
const multerUpload = require("../../middlewares/multer.middleware");
const { StatusCodes } = require("http-status-codes");
const isAuthenticated = require("../../middlewares/isAuthenticated.middleware");

userRouter.get("/", isAuthenticated, async (req, res) => {
  logger = req.logger;
  logger.info("Getting user details");
  let user = req.user.toObject();
  delete user.password;
  delete user._id;
  logger.info("User details: " + user);
  res.send(user);
});

userRouter.get("/about", isAuthenticated, async (req, res) => {
  const logger = req.logger;
  User.findById(req.user._id)
    .populate({
      path: "friends",
      select: "firstName lastName email username image -_id",
    })
    .exec()
    .then((user) => {
      delete user.password;
      delete user._id;
      logger.info("Got the user: " + user);
      return res.send(JSON.stringify(user));
    })
    .catch((error) => {
      logger.error("Error in getting user details: " + error);
      return res
        .send({ message: "Error in getting user details" })
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

userRouter.post(
  "/image",
  [isAuthenticated, multerUpload.single("image")],
  async (req, res) => {
    const logger = req.logger;
    const userId = req.user._id;
    logger.info("Going to upload image for user: " + userId);
    User.updateOne({ _id: userId }, { $set: { image: req.file.path } })
      .then((user) => {
        logger.info("Successfully updated the profile picture");
        res.send({ message: "Successfully updated the profile picture" });
      })
      .catch((error) => {
        logger.error("Error in uploading profile picture: " + error);
        res
          .send({ message: "Error in uploading profile picture" })
          .status(StatusCodes.INTERNAL_SERVER_ERROR);
      });
  }
);

module.exports = userRouter;
