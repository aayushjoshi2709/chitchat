const User = require("../../models/User/User.model");
const Message = require("../../models/Messages/Messages.model");
const mongoose = require("mongoose");
const userRouter = require("express").Router();
const multerUpload = require("../../middlewares/multer.middleware");
const { StatusCodes } = require("http-status-codes");
const logger = require("../../logger/logger");
const dtoValidator = require("../../middlewares/dtoValidator.middleware");
const UserDto = require("../../dtos/User.dto");
const isAuthenticated = require("../../middlewares/isAuthenticated.middleware");
const MulterUpload = require("../../middlewares/multer.middleware");

// create new friend route
userRouter.post("/:id/friend", async (req, res) => {
  User.findById(req.params.id, function (error, user) {
    if (error) console.log(error);
    else {
      user.friends.push(mongoose.Types.ObjectId(req.body.friend_id));
      user.save();
      User.findById(req.body.friend_id, function (error, friend) {
        if (error) console.log(error);
        else {
          friend.friends.push(mongoose.Types.ObjectId(req.params.id));
          friend.save();
        }
      });
      res.send("{status:success}");
    }
  });
});
// get all friends route
userRouter.get("/:id/friend", async (req, res) => {
  User.findById(req.params.id)
    .populate("friends")
    .exec(function (error, user) {
      if (error) console.log(error);
      else {
        var friends = user.friends;
        res.send(JSON.stringify(friends));
      }
    });
});
// search friends by name
userRouter.get("/:id/friend/search/:query", async (req, res) => {
  let query = req.params.query;
  logger = req.logger;
  User.find({ username: query }, function (error, user) {
    if (error) {
      logger.error("Error in finding user: ", error);
      res.send(JSON.stringify({ status: "error", error: error })).status(500);
    } else {
      logger.debug("Found the user: ", user);
      res.send(JSON.stringify(user));
    }
  });
});
// delete friend
userRouter.delete("/:id/friend/", async (req, res) => {
  logger.info("Going to delete a friend: " + req.body.id);
  const user = req.user;
  user.friends.remove(req.body.id);
  user.save();
  User.findById(req.body.id, function (error, friend) {
    if (error) {
      logger.error("Error getting friend details: " + error);
      res
        .send(
          JSON.stringify({ status: "error", error: "Error getting friend" })
        )
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
    friend.friends.remove(req.params.id);
    friend.save();
  });
  res
    .send(JSON.stringify({ message: "Friend removed successfully" }))
    .status(StatusCodes.ACCEPTED);
});

userRouter.post(
  "/uploadImage",
  [isAuthenticated, multerUpload.single("image")],
  async (req, res) => {
    const logger = req.logger;
    const userId = req.user._id;
    logger.info("Going to upload image for user: " + userId);
    await User.updateOne(
      { _id: userId },
      { $set: { image: req.file.path } },
      function (error, user) {
        if (error) {
          logger.error("Error in uploading image: ", error);
          res
            .send({ message: "Error in uploading image" })
            .status(StatusCodes.INTERNAL_SERVER_ERROR);
        } else {
          res.send({ message: "success" });
        }
      }
    );
  }
);

module.exports = userRouter;
