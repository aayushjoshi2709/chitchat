const MessagesRouter = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const isAuthenticated = require("../../middlewares/isAuthenticated.middleware");
const User = require("../../models/User/User.model");
const Message = require("../../models/Messages/Messages.model");
const MessageDto = require("../../dtos/Message.dto");
const dtoValidator = require("../../middlewares/dtoValidator.middleware");
// group messages by sender id and remove extra info
function groupByKey(array, given_id) {
  var res = {};
  array.forEach((ele) => {
    var msg = {
      id: ele._id,
      message: ele.message,
      time: ele.time,
      from: ele.from._id,
      to: ele.to._id,
      status: ele.status,
    };
    if (ele.to._id == given_id) {
      var id = ele.from._id;
      if (res[id]) {
        res[id].messages.push(msg);
      } else {
        res[id] = { messages: [msg] };
        res[id].name = ele.from.firstName + " " + ele.from.lastName;
        res[id].username = ele.from.username;
      }
      res[id].lasttime = msg.time;
    } else if (ele.from._id == given_id) {
      var id = ele.to._id;
      if (res[id]) res[id].messages.push(msg);
      else {
        res[id] = { messages: [msg] };
        res[id].name = ele.to.firstName + " " + ele.to.lastName;
        res[id].username = ele.to.username;
      }
      res[id].lasttime = msg.time;
    }
  });
  return res;
}

// sort grouped messages by last recieved custom comparator
function comparator(a, b) {
  if (a[1].lasttime > b[1].lasttime) return -1;
  else if (a[1].lasttime < b[1].lasttime) return 1;
  else return 0;
}
// sort messages by last time
function sortMessages(result) {
  var arr = [];
  var res = {};
  for (var key in result) {
    arr.push([key, result[key]]);
  }
  arr.sort(comparator);
  arr.forEach((element) => {
    res[element[0]] = element[1];
  });
  return res;
}

// get all messages route
MessagesRouter.get("/", async (req, res) => {
  const logger = req.logger;
  logger.info("Getting all messages for user: " + req.user._id);
  User.findById(req.user._id)
    .populate({ path: "messages", populate: { path: "from to" } })
    .exec()
    .then(function (user) {
      if (!user) {
        logger.error("Error in finding user: " + error);
        res
          .send(JSON.stringify({ message: "Error finding user" }))
          .status(StatusCodes.INTERNAL_SERVER_ERROR);
      } else {
        logger.info("Got the user messages: " + user.messages);
        // group all elemenRouterts by person
        const result = groupByKey(user.messages, req.user._id);
        // sort all element by last time recieved
        res.send(JSON.stringify(sortMessages(result)));
      }
    })
    .catch((error) => {
      logger.error("Error in finding user: " + error);
      res
        .send(JSON.stringify({ message: "Error finding user" }))
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

// get messages with a particular user
MessagesRouter.get("/:username", async (req, res) => {
  logger = req.logger;
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
        .select({
          message: 1,
          time: 1,
          from: 1,
          to: 1,
          _id: 0,
        })
        .sort({ time: 1 })
        .then((messages) => {
          logger.info("Got the user messages: " + messages);
          res.send(JSON.stringify(messages));
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
