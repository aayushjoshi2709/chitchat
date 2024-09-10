const friendRouter = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const logger = require("../../logger/logger");
const User = require("../../models/User/User.model");
const { userCache, socketCache } = require("../../redis/redis");
const { socketInstance } = require("../../sockets/socket");
// create new friend route
friendRouter.put("/", async (req, res) => {
  const logger = req.logger;
  logger.info("Going to create a new friend");
  logger.debug("Request Params: " + req.params);
  const user = req.user;
  const friendUsername = req.body.username;

  if (user.username === friendUsername) {
    logger.error("User cannot add himself as a friend");
    return res
      .send(JSON.stringify({ message: "User cannot add himself as a friend" }))
      .status(StatusCodes.BAD_REQUEST);
  }

  logger.info("Going to find the friend: " + friendUsername);
  User.findOne({ username: friendUsername })
    .then(async (friend) => {
      if (!friend) {
        logger.error("Friend not found");
        return res
          .send(JSON.stringify({ message: "Friend not found" }))
          .status(StatusCodes.NOT_FOUND);
      }
      logger.info("Found the friend: " + friend);
      logger.silly("Friend: " + friend);

      if (user.friends.includes(friend._id.toString())) {
        logger.error("Friend already exists in user's friend list");
        return res
          .send(JSON.stringify({ message: "Friend already exists" }))
          .status(StatusCodes.BAD_REQUEST);
      }

      logger.info("Adding friend to user's friend list");
      User.findByIdAndUpdate(user._id, {
        friends: [...user.friends, friend._id],
      })
        .exec()
        .then(async (user) => {
          console.log("updateResponse", user);
          userCache.del(user.username);
          logger.info("User updated successfully");
          logger.info("Adding user to friend's friend list");
          friend.friends.push(user._id);
          friend.save();
          userCache.del(friend.username);
          friendSocketId = await socketCache.get(friend.username);
          if (friendSocketId) {
            logger.info(
              "Emitting new friend event to friend: " +
                friend.username +
                " with socket id: " +
                friendSocketId
            );
            socketInstance.emitEvent(friendSocketId, "add_friend", {
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              image: user.image,
            });
          }
          return res
            .send(JSON.stringify({ message: "Friend added successfully" }))
            .status(StatusCodes.ACCEPTED);
        })
        .catch((error) => {
          logger.error("Error updating user: " + error);
          return res
            .send(JSON.stringify({ message: "Error adding friend" }))
            .status(StatusCodes.INTERNAL_SERVER_ERROR);
        });
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
    .then(async (friend) => {
      if (!friend) {
        logger.error("Friend not found");
        return res
          .send(JSON.stringify({ message: "Friend not found" }))
          .status(StatusCodes.NOT_FOUND);
      }
      if (friend.friends && friend.friends.length > 0) {
        friend.friends = friend.friends.filter(
          (friendsFriendIds) => !friendsFriendIds.equals(user._id)
        );
        friend.save().then((friend) => {
          userCache.set(friend.username, friend);
        });
      } else {
        logger.info("There are no friends associated with: " + friend.username);
        logger.debug("User:", JSON.stringify(friend));
      }
      if (user.friends && user.friends.length > 0) {
        const newFriendsArray = user.friends.filter((userFriendId) => {
          const friendId = friend._id.toString();
          return userFriendId !== friendId;
        });
        logger.info("Updated friends array", newFriendsArray);
        User.updateOne(
          { _id: user._id },
          { $set: { friends: newFriendsArray } },
          { new: true }
        )
          .then((user) => {
            userCache.del(user.username, user);
            logger.info("Removed friend from user: " + user.username);
          })
          .catch((error) => {
            logger.error("Error updating user: " + error);
            return res
              .send(JSON.stringify({ message: "Error removing friend" }))
              .status(StatusCodes.INTERNAL_SERVER_ERROR);
          });
      } else {
        logger.info("There are no friends associated with: " + user.username);
        logger.info("User:" + JSON.stringify(user));
      }
      friendSocketId = await socketCache.get(friend.username);
      if (friendSocketId) {
        logger.info(
          "Emitting delete friend event to friend: " +
            friend.username +
            " with socket id: " +
            friendSocketId
        );
        socketInstance.emitEvent(
          friendSocketId,
          "remove_friend",
          req.user.username
        );
      }
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
friendRouter.get("/search/:username", async (req, res) => {
  let username = req.params.username;
  const logger = req.logger;
  logger.info("Going to search for friends: " + username);
  User.find({ username: { $regex: username, $options: "i" } })
    .limit(5)
    .select("-password -friends -_id")
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
