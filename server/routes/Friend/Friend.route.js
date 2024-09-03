const friendRouter = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const logger = require("../../logger/logger");
const User = require("../../models/User/User.model");

// create new friend route
friendRouter.put("/:username", async (req, res) => {
  const logger = req.logger;
  logger.info("Going to create a new friend");
  logger.debug("Request Params: " + req.params);
  const user = req.user;
  const friendUsername = req.params.username;
  logger.info("Going to find the friend: " + friendUsername);
  User.findOne({ username: friendUsername })
    .then((friend) => {
      if (!friend) {
        logger.error("Friend not found");
        return res
          .send(JSON.stringify({ message: "Friend not found" }))
          .status(StatusCodes.NOT_FOUND);
      }
      logger.info("Found the friend: " + friend);
      logger.silly("Friend: " + friend);

      logger.info("Adding friend to user's friend list");
      user.friends.push(friend._id);
      user.save();
      logger.info("Adding user to friend's friend list");
      friend.friends.push(user._id);
      friend.save();
      return res
        .send(JSON.stringify({ message: "Friend added successfully" }))
        .status(StatusCodes.ACCEPTED);
    })
    .catch((error) => {
      logger.error("Error in finding friend: " + error);
      return res
        .send(JSON.stringify({ message: "Error adding friend" }))
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

// get all friends route
friendRouter.get("/", async (req, res) => {
  const logger = req.logger;
  const user = req.user;
  logger.info("Going to get all friends of user: " + user._id);
  User.findById(user._id)
    .select("friends")
    .populate({
      path: "friends",
      select: "firstName lastName email username image -_id",
    })
    .exec()
    .then((user) => {
      logger.info("Got the user friends: " + user.friends);
      var friends = user.friends;
      return res.send(JSON.stringify(friends));
    })
    .catch((error) => {
      logger.error("Error in getting friends: " + error);
      return res
        .send(JSON.stringify({ message: "Error getting friends" }))
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

// delete friend
friendRouter.delete("/:username", async (req, res) => {
  logger.info("Going to delete a friend: " + req.params.username);
  const user = req.user;
  User.findOne({ username: req.params.username })
    .then((friend) => {
      user.friends.remove(friend._id);
      user.save();
      friend.friends.remove(req.user._id);
      friend.save();
      return res
        .send(JSON.stringify({ message: "Friend removed successfully" }))
        .status(StatusCodes.ACCEPTED);
    })
    .catch((error) => {
      logger.error("Error getting friend details: " + error);
      return res
        .send(JSON.stringify({ message: "Error getting friend" }))
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

// search friends by name
friendRouter.get("/:username", async (req, res) => {
  let username = req.params.username;
  const logger = req.logger;
  logger.info("Going to search for friends: " + username);
  User.find({ username: { $regex: username, $options: "i" } })
    .select("firstName lastName email username image -_id")
    .exec()
    .then((users) => {
      if (!users) {
        logger.error("No friends found");
        return res
          .send(JSON.stringify({ message: "No friends found" }))
          .status(StatusCodes.NOT_FOUND);
      }
      logger.info("Found friends: " + users);
      return res.send(JSON.stringify(users));
    })
    .catch((error) => {
      logger.error("Error in finding friends: " + error);
      return res
        .send(JSON.stringify({ message: "Error finding friends" }))
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

module.exports = friendRouter;
