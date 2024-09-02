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
  logger.info("Getting all messages for user: " + req.user._id);
  const selectOptions = "username -_id";
  limit = req.query.limit || 500;
  skip = req.query.skip || 0;
  Message.find({
    $or: [{ from: req.user._id }, { to: req.user._id }],
  })
    .select("from to message time status -_id")
    .populate({
      path: "from",
      select: selectOptions,
    })
    .populate({
      path: "to",
      select: selectOptions,
    })
    .skip(skip)
    .limit(limit)
    .sort({ time: 1 })
    .then((messages) => {
      logger.info("Got the messages: " + messages);
      const response = {};
      messages.map((message) => {
        if (message.from._id != req.user._id) {
          response[message.to.username] = response[message.to.username] || [];
          response[message.to.username].push(message);
          return;
        } else {
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
  limit = req.query.limit || 50;
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
          { from: req.user._id, to: user._id },
          { from: user._id, to: req.user._id },
        ],
      })
        .skip(skip)
        .limit(limit)
        .populate("from", "username -_id")
        .populate("to", "username -_id")
        .select("from to message time status -_id")
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

// create message route
MessagesRouter.post(
  "/",
  [isAuthenticated, dtoValidator(MessageDto, "body")],
  async (req, res) => {
    const logger = req.logger;
    logger.info("Going to create a new message");
    var message = {
      from: req.user._id,
      time: req.body.time || Date.now(),
      status: "sent",
      message: req.body.message,
    };
    logger.debug("Message: " + message);
    User.findOne({ username: req.body.to })
      .then((user) => {
        if (!user) {
          return res
            .send(
              JSON.stringify({
                error: "Destination user not found",
              })
            )
            .status(StatusCodes.BAD_REQUEST);
        }
        message.to = user._id;
        Message.create(message).then((message) => {
          const fromUser = req.user;
          user.messages = [...user.messages, message._id];
          user.save();
          fromUser.messages = [...fromUser.messages, message._id];
          fromUser.save();
          res.send(JSON.stringify({ message: "Message sent" }));
        });
      })
      .catch((error) => {
        logger.error("Error in finding destination user: " + error);
        res
          .send(
            JSON.stringify({
              error: "Error finding destination user",
            })
          )
          .status(StatusCodes.INTERNAL_SERVER_ERROR);
      });
  }
);

module.exports = MessagesRouter;
