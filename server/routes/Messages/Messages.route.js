const MessagesRouter = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const isAuthenticated = require("../../middlewares/isAuthenticated.middleware");
const User = require("../../models/User/User.model");
const Message = require("../../models/Messages/Messages.model");
const MessageDto = require("../../dtos/Message.dto");
const dtoValidator = require("../../middlewares/dtoValidator.middleware");
// get all messages route
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
    .sort({ time: -1 })
    .skip(skip)
    .limit(limit)
    .then((messages) => {
      logger.info("Got the messages of length: " + messages.length);
      const response = {};
      messages.map((message) => {
        if (message.from.username == req.user.username) {
          response[message.to.username] = response[message.to.username] || [];
          response[message.to.username].push(message);
          return;
        } else if (message.to.username == req.user.username) {
          response[message.from.username] =
            response[message.from.username] || [];
          response[message.from.username].push(message);
          return;
        }
      });
      res.send(JSON.stringify(response));
    });
});

// get messages with a particular user
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
