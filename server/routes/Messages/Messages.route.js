const MessagesRouter = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const User = require("../../models/User/User.model");
const Message = require("../../models/Messages/Messages.model");
const MessageDto = require("../../dtos/Message.dto");
const dtoValidator = require("../../middlewares/dtoValidator.middleware");
const { userCache, socketCache } = require("../../redis/redis");
const { socketInstance } = require("../../sockets/socket");
// get all messages route

MessagesRouter.post("/", dtoValidator(MessageDto, "body"), async (req, res) => {
  const logger = req.logger;
  logger.info("Received new message: ", req.body);
  let friend = JSON.parse(await userCache.get(req.body.to));
  if (friend) {
    logger.info("Friend found in cache: " + JSON.stringify(friend));
  } else {
    try {
      friend = await User.findOne({ username: req.body.to });
    } catch (error) {
      logger.error("Error in finding friend: " + error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Error finding friend" });
    }
    if (!friend) {
      logger.error("Error in finding friend: " + error);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Error finding friend" });
    }
    await userCache.set(friend.username, JSON.stringify(friend));
  }
  if (!req.user.friends.includes(friend._id.toString())) {
    logger.error("User is not friend with the receiver");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: "User is not friend with the receiver" });
  }
  const newMessage = new Message({
    from: {
      username: req.user.username,
    },
    to: {
      username: req.body.to,
    },
    message: req.body.message,
    status: "sent",
    time: Date.now(),
  });
  logger.info("New message: " + newMessage);
  newMessage
    .save()
    .then(async (message) => {
      logger.info("Message saved successfully: " + message);
      socketCache.get(friend.username).then((friendSocketId) => {
        if (friendSocketId) {
          logger.info(
            "Going to emit message to the friend on socket id: " +
              friendSocketId
          );
          socketInstance.emitEvent(friendSocketId, "new_message", {
            from: req.user.username,
            message: message,
          });
        }
      });
      return res.status(StatusCodes.CREATED).send({
        data: message,
        message: "Message sent successfully",
      });
    })
    .catch((error) => {
      logger.error("Error in saving message: " + error);
    });
});

MessagesRouter.get("/", async (req, res) => {
  const logger = req.logger;
  logger.info("Getting all messages for user: " + req.user.username);
  limit = req.query.limit || 1000;
  skip = req.query.skip || 0;
  Message.find({
    $or: [
      { "from.username": req.user.username },
      { "to.username": req.user.username },
    ],
  })
    .select("from to message time status")
    .sort({ time: 1 })
    .skip(skip)
    .limit(limit)
    .then((messages) => {
      logger.info("Got the messages of length: " + messages.length);
      const response = {};
      const putMessageIntoRespose = (message, recipient) => {
        const username = message[recipient].username;
        response[username] = {
          ...response[username],
        };
        response[username]["messages"] = {
          ...response[username]["messages"],
          [message._id]: message,
        };
        response[username]["lastMessage"] = {
          message: message.message,
          time: message.time,
        };
      };
      messages.map((message) => {
        if (message.from.username == req.user.username) {
          putMessageIntoRespose(message, "to");
        } else if (message.to.username == req.user.username) {
          putMessageIntoRespose(message, "from");
        }
      });
      res.send(JSON.stringify(response));
    });
});

// get messages with a ddparticular user
MessagesRouter.get("/:username", async (req, res) => {
  logger = req.logger;
  limit = req.query.limit || 100;
  skip = req.query.skip || 0;
  logger.info("Getting messages with user: " + req.params.username);
  User.findOne({ username: req.params.username }).then((user) => {
    if (!user) {
      logger.error("Error in finding friend: " + error);
      res
        .send(JSON.stringify({ message: "Error finding friend" }))
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    } else {
      Message.find({
        $or: [
          { "from.username": req.user.username, "to.username": user.username },
          { "from.username": user.username, "to.username": req.user.username },
        ],
      })
        .skip(skip)
        .limit(limit)
        .select("from to message time status")
        .sort({ time: 1 })
        .then((messages) => {
          logger.info("Got the user messages: " + messages);
          const response = {};
          response[user.username] = messages;
          res.send(JSON.stringify(response));
        });
    }
  });
});

module.exports = MessagesRouter;
