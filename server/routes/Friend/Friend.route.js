const friendRouter = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const logger = require("../../logger/logger");
const User = require("../../models/User/User.model");

// create new friend route
friendRouter.post("/", async (req, res) => {
  const logger = req.logger;
  logger.info("Going to create a new friend");
  logger.debug("Request body: ", req.body);
  const user = req.user;
  const friendUsername = req.body.username;
  logger.info("Going to find the friend: ", friendUsername);
  User.findOne({ username: friendUsername })
    .then((friend) => {
      if (!friend) {
        logger.error("Friend not found");
        res
          .send(JSON.stringify({ message: "Friend not found" }))
          .status(StatusCodes.NOT_FOUND);
      }
      logger.info("Found the friend: ", friend);
      logger.silly("Friend: ", friend);

      logger.info("Adding friend to user's friend list");
      user.friends.push(friend._id);
      user.save();
      logger.info("Adding user to friend's friend list");
      friend.friends.push(user._id);
      friend.save();
    })
    .catch((error) => {
      logger.error("Error in finding friend: ", error);
      res
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
    .populate("friends")
    .exec()
    .then((user) => {
      logger.info("Got the user: ", user);
      var friends = user.friends;
      res.send(JSON.stringify(friends));
    })
    .catch((error) => {
      logger.error("Error in getting friends: " + error);
      res
        .send(JSON.stringify({ message: "Error getting friends" }))
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

// delete friend
friendRouter.delete("/", async (req, res) => {
  logger.info("Going to delete a friend: " + req.body.username);
  const user = req.user;
  User.findById({ username: req.body.username })
    .then((friend) => {
      user.friends.remove(friend._id);
      user.save();
      friend.friends.remove(req.user._id);
      friend.save();
      res
        .send(JSON.stringify({ message: "Friend removed successfully" }))
        .status(StatusCodes.ACCEPTED);
    })
    .catch((error) => {
      logger.error("Error getting friend details: " + error);
      res
        .send(JSON.stringify({ message: "Error getting friend" }))
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

// search friends by name
friendRouter.get("/:query", async (req, res) => {
  let query = req.params.query;
  logger = req.logger;
  logger.info("Going to search for friends: " + query);
  User.find({ username: query })
    .then((users) => {
      if (!users) {
        logger.error("No friends found");
        res
          .send(JSON.stringify({ message: "No friends found" }))
          .status(StatusCodes.NOT_FOUND);
      }
      logger.info("Found friends: ", users);
      res.send(JSON.stringify(users));
    })
    .catch((error) => {
      logger.error("Error in finding friends: ", error);
      res
        .send(JSON.stringify({ message: "Error finding friends" }))
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

module.exports = friendRouter;
friendRouter.post("/", async (req, res) => {
  const logger = req.logger;
  logger.info("Going to create a new friend");
  logger.debug("Request body: ", req.body);
  const user = req.user;
  const friendUsername = req.body.username;
  logger.info("Going to find the friend: ", friendUsername);
  User.findOne({ username: friendUsername })
    .then((friend) => {
      if (!friend) {
        logger.error("Friend not found");
        res
          .send(JSON.stringify({ message: "Friend not found" }))
          .status(StatusCodes.NOT_FOUND);
      }
      logger.info("Found the friend: ", friend);
      logger.silly("Friend: ", friend);

      logger.info("Adding friend to user's friend list");
      user.friends.push(friend._id);
      user.save();
      logger.info("Adding user to friend's friend list");
      friend.friends.push(user._id);
      friend.save();
    })
    .catch((error) => {
      logger.error("Error in finding friend: ", error);
      res
        .send(JSON.stringify({ message: "Error adding friend" }))
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});
