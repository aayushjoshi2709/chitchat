const MessagesRouter = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const User = require("../../models/User/User.model");
const Message = require("../../models/Messages/Messages.model");
const MessageDto = require("../../dtos/Message.dto");
const dtoValidator = require("../../middlewares/dtoValidator.middleware");
const { userCache, socketCache } = require("../../redis/redis");
const { socketInstance } = require("../../sockets/socket");

// post messages route
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


//get top 100 messages for all friends of a user
MessagesRouter.get("/", async (req, res) => {
  const logger = req.logger;
  logger.info("Getting all messages for user: " + req.user.username);
  limit = req.query.limit || 1000;
  skip = req.query.skip || 0;
  User.aggregate([
    {
        $match: {
            username: req.user.username
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "friends",
            foreignField: "_id",
            as: "friends",
            pipeline: [
                { $project: { _id: 0, username: 1 } } 
            ]
        }
    },
    {
        $lookup: {
            from: "messages",
            let: { friendUsernames: { $map: { input: "$friends", as: "friend", in: "$$friend.username" } }, username: "$username" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $or: [
                                {
                                    $and: [
                                        { $in: ["$to.username", "$$friendUsernames"] },
                                        { $eq: ["$from.username", "$$username"] }
                                    ]
                                },
                                {
                                    $and: [
                                        { $in: ["$from.username", "$$friendUsernames"] },
                                        { $eq: ["$to.username", "$$username"] }
                                    ]
                                }
                            ]
                        }
                    }
                },
                { $sort: { time: 1 } }, 
                { $limit: 10},
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $in: ["$to.username", "$$friendUsernames"] },
                                "$to.username",
                                "$from.username"
                            ]
                        },
                        messages: {
                            $push: "$$ROOT"
                        },
                        lastMessage: {
                            $last: "$$ROOT"
                        }
                    }
                }
            ],
            as: "chats"
        }
    },
    {
        $project: {
            chats: {
              $arrayToObject: { 
                $map: {
                    input: "$chats",
                    as: "chat",
                    in: ["$$chat._id",{
                      messages:{
                        $arrayToObject:{
                          $map:{
                            input:"$$chat.messages",
                            as: "message",
                            in:[{$toString: "$$message._id"}, "$$message"]
                          }
                        }
                      },
                      lastMessage: {
                        message:"$$chat.lastMessage.message",
                        time: "$$chat.lastMessage.time",
                      }
                    }]
                }
              }
            },
            _id: 0
        }
    }
]).exec()
    .then((results) => {
        const response = results[0].chats;
        logger.info("Fetched all the results: ", response);
        res.send(JSON.stringify(response));
    })
    .catch(err => {
      console.error(err);
    });
});

// get messages with a particular user
MessagesRouter.get("/:username", async (req, res) => {
  logger = req.logger;
  limit = req.query.limit || 100;
  skip = req.query.skip || 0;
  logger.info(`Getting messages with user: ${req.params.username} with limit: ${limit} and count: ${count}`);
  User.findOne({ username: req.params.username }).then(async (user) => {
    if (!user) {
      logger.error("Error in finding friend: " + error);
      res
        .send(JSON.stringify({ message: "Error finding friend" }))
        .status(StatusCodes.INTERNAL_SERVER_ERROR);
    } else {
      const count = await Message.count({
        $or: [
          { "from.username": req.user.username, "to.username": user.username },
          { "from.username": user.username, "to.username": req.user.username },
        ],
      });

      const response = {
        count: count,
        limit: limit,
        skip: skip,
        data: {}
      }

      if(count >= limit + skip){
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
            response.date = {
              [user.username]:messages
            };
            res.send(JSON.stringify(response));
          });
      }else{
        res.send(JSON.stringify(response));
      }
    }
  });
});

module.exports = MessagesRouter;
