const User = require("../../models/User/User");
const Message = require("../../models/Messages/Messages");
const mongoose = require("mongoose");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const userRouter = require("express").Router();
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
userRouter.get("/:id/message", isAuthenticated, function (req, res) {
  User.findById(req.params.id)
    .populate({ path: "messages", populate: { path: "from to" } })
    .exec(function (error, user) {
      if (error) console.log(error);
      else {
        // group all elements by person
        var result = groupByKey(user.messages, req.params.id);
        // sort all element by last time recieved
        res.send(JSON.stringify(sortMessages(result)));
      }
    });
});
// create new friend route
userRouter.post("/:id/friend", isAuthenticated, function (req, res) {
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
userRouter.get("/:id/friend", isAuthenticated, function (req, res) {
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
userRouter.get(
  "/:id/friend/search/:query",
  isAuthenticated,
  function (req, res) {
    let query = req.params.query;
    User.find({ username: query }, function (error, user) {
      if (error) console.log(error);
      else {
        res.send(JSON.stringify(user));
      }
    });
  }
);
// delete friend
userRouter.delete("/:id/friend/", isAuthenticated, function (req, res) {
  logger.info("Going to delete a friend: " + req.params.id);
  User.findById(req.params.id, function (error, user) {
    if (error) {
      logger.error("Error in finding user: ", JSON.stringify(error));
      res.send(JSON.stringify({ status: "error", error: error })).status(500);
    }
    logger.debug("Found the friend: ", JSON.stringify(user));
    user.friends.remove(req.body.id);
    user.save();
    
    User.findById(req.body.id, function (error, xfriend) {
      if (error) console.log(error);
      xfriend.friends.remove(req.params.id);
      xfriend.save();
    });
    res.send(JSON.stringify({ status: "success" }));
  });
});

// create message route
userRouter.post("/:id/message", isAuthenticated, function (req, res) {
  const logger = req.logger;
  logger.info("Going to create a new message");
  var message = {
    from: mongoose.Types.ObjectId(req.params.id),
    to: mongoose.Types.ObjectId(req.body.to),
    time: req.body.time || Date.now(),
    status: "sent",
    message: req.body.message,
  };
  logger.debug("Message: ", JSON.stringify(message));
  User.findById(message.to, function (error, toUser) {
    if (error) {
      logger.error(
        "Error in finding destination user: ",
        JSON.stringify(error)
      );
      res.send(JSON.stringify({ status: "error", error: error })).status(500);
    }
    Message.create(message, function (error, message) {
      if (error) {
        logger.error("Error in creating message: ", JSON.stringify(error));
        res.send(JSON.stringify({ status: "error", error: error })).status(500);
      } else {
        User.findById(message.from, function (error, fromUser) {
          if (error) {
            logger.error(
              "Error in finding source user: ",
              JSON.stringify(error)
            );
            res
              .send(JSON.stringify({ status: "error", error: error }))
              .status(500);
          }
          if ("messages" in toUser) toUser.messages.push(message._id);
          else {
            toUser.messages = [];
            toUser.messages.push(message._id);
          }
          toUser.save();
          if ("messages" in fromUser) {
            fromUser.messages.push(message._id);
          } else {
            fromUser.messages = [];
            fromUser.messages.push(message._id);
          }
          fromUser.save();
          res.send(JSON.stringify({ status: "success", id: message._id }));
        });
      }
    });
  });
});

module.exports = userRouter;
