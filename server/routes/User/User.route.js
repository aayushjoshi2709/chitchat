const User = require("../../models/User/User.model");
const userRouter = require("express").Router();
const multerUpload = require("../../middlewares/multer.middleware");
const { StatusCodes } = require("http-status-codes");
const isAuthenticated = require("../../middlewares/isAuthenticated.middleware");

userRouter.get("/", async (req, res) => {
  const user = req.user;
  delete user.password;
  delete user.id;
  res.send(user);
});

userRouter.post(
  "/uploadImage",
  [isAuthenticated, multerUpload.single("image")],
  async (req, res) => {
    const logger = req.logger;
    const userId = req.user._id;
    logger.info("Going to upload image for user: " + userId);
    User.updateOne({ _id: userId }, { $set: { image: req.file.path } })
      .then(() => {
        res.send({ message: "Successfully updated the profile picture" });
      })
      .catch((error) => {
        logger.error("Error in uploading image: ", error);
        res
          .send({ message: "Error in uploading image" })
          .status(StatusCodes.INTERNAL_SERVER_ERROR);
      });
  }
);

module.exports = userRouter;
