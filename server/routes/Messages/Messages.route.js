const MessagesRouter = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const isAuthenticated = require("../../middlewares/isAuthenticated.middleware");
const User = require("../../models/User/User.model");
const Message = require("../../models/Messages/Messages.model");
const MessageDto = require("../../dtos/Message.dto");
const dtoValidator = require("../../middlewares/dtoValidator.middleware");

// group messages by sender id and remove extra info
function groupByKey(array, given_id) {
  const logger = req.logger;
  logger.info("Grouping messages by sender id: ", given_id);
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
  logger.info("Getting all messages for user: ", req.user._id);
  User.findById(req.user._id)
    .populate({ path: "messages", populate: { path: "from to" } })
    .exec()
    .then(function (error, user) {
      if (error) {
        logger.error("Error in finding user: ", error);
        res
          .send(
            JSON.stringify({ status: "error", error: "Error finding user" })
          )
          .status(StatusCodes.INTERNAL_SERVER_ERROR);
      } else {
        // group all elemenRouterts by person
        var result = groupByKey(user.messages, req.user._id);
        // sort all element by last time recieved
        res.send(JSON.stringify(sortMessages(result)));
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
    logger.debug("Message: ", message);
    User.findById({ username: req.body.to })
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
          res.send(JSON.stringify({ status: "success", id: message._id }));
        });
      })
      .catch((error) => {
        logger.error("Error in finding destination user: ", error);
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
