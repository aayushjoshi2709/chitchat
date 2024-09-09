const socket = require("socket.io");
const User = require("../models/User/User.model");
const Message = require("../models/Messages/Messages.model");
const { userRedis, socketRedis } = require("../redis/redis");
const jwt = require("jsonwebtoken");
const logger = require("../logger/logger");
require("dotenv").config();
// store socket id for a user on connection
function EstablishSocket(http) {
  return socket(http, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      transports: ["websocket"],
      credentials: true,
    },
    allowEIO3: true,
  });
}

function afterConnect(socketObj) {
  socketObj.use(async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      await jwt.verify(
        socket.handshake.query.token,
        process.env.JWT_SECRET,
        async (err, decoded) => {
          if (err) {
            return next(new Error("Authentication error"));
          }
          user = await userRedis.get(decoded.username);
          if (user) {
            console.log(user);
            user = JSON.parse(user);
            logger.info("User found in cache: " + JSON.stringify(user));
            socket.user = user;
            socketRedis.set(user.username, socket.id);
            next();
          } else {
            logger.info(
              "User not found in cache going to hit the db:" + decoded.username
            );
            User.findOne({ username: decoded.username })
              .select("-password")
              .exec()
              .then(async (user) => {
                if (!user) {
                  logger.error(
                    "User not found for the token:" + decoded.username
                  );
                  next(new Error("User not found"));
                }
                delete user.password;
                await userRedis.set(decoded.username, JSON.stringify(user));
                socket.user = user;
                socketRedis.set(user.username, socket.id);
                next();
              })
              .catch((error) => {
                logger.error(
                  "Error while finding user for the token:" + decoded.username
                );
                logger.error(error);
                next(new Error("Something went wrong"));
              });
          }
        }
      );
    } else {
      new Error("JWT token not supplied");
    }
  });
  socketObj.on("connection", (socket) => {
    socket.on("new_message", async (message) => {
      logger.info("Received new message: ", message);
      const messageOutline = {
        from: {
          username: socket.user.username,
        },
        message: message.message,
        status: "sent",
        time: Date.now(),
      };
      const friend = JSON.parse(await userRedis.get(message.to));
      if (friend) {
        if (!socket.user.friends.includes(friend._id)) {
          logger.error("User is not friend with the receiver");
          return;
        }
        logger.info("Friend found in cache: " + friend);
        messageOutline.to = {
          username: friend.username,
        };
        const newMessage = new Message(messageOutline);
        logger.info("New message: " + newMessage);
        newMessage
          .save()
          .then((message) => {
            logger.info("Message saved successfully: " + message);
            friendSocketId = socketRedis.get(friend.username);
            if (friendSocketId) {
              logger.info(
                "Going to emit message to the friend on socket id: " +
                  friendSocketId
              );
              socketObj.to(friendSocketId).emit("new_message", message);
            }
          })
          .catch((error) => {
            logger.error("Error in saving message: " + error);
          });
      } else {
        logger.info(
          "Friend not found in cache going to find it in DB: " + message.to
        );
        User.findOne({ username: message.to }).then((friend) => {
          if (!friend) {
            logger.error("Error in finding friend: " + error);
          } else {
            if (!socket.user.friends.includes(friend._id)) {
              logger.error("User is not friend with the receiver");
              return;
            }
            logger.info("Friend found in db: " + friend);
            userRedis.set(friend.username, friend);
            messageOutline.to = {
              username: friend.username,
            };
            const newMessage = new Message(messageOutline);
            logger.info("New message: " + newMessage);
            newMessage
              .save()
              .then((message) => {
                logger.info("Message saved successfully: " + message);
                const friendSocketId = socketRedis.get(friend.username);
                if (friendSocketId) {
                  logger.info(
                    "Going to emit message to the friend on socket id: " +
                      friendSocketId
                  );
                  socketObj.to(friendSocketId).emit("new_message", message);
                }
              })
              .catch((error) => {
                logger.error("Error in saving message: " + error);
              });
          }
        });
      }
    });
    socket.on("update_message_status_received", async (ids) => {
      Message.updateMany({ id: { $in: ids } }, { status: "received" }).then(
        (messages) => {
          logger.info("Messagages status updated to received for ids: " + ids);
          friendSocketId = socketRedis.get(messages[0].from.username);
          if (friendSocketId) {
            logger.info(
              "Going to emit message to the friend on socket id: " +
                friendSocketId
            );
            socketObj
              .to(friendSocketId)
              .emit("update_message_status_received", {
                friend: socket.user.username,
                messageIds: ids,
              });
          }
        }
      );
    });
    socket.on("add_friend", function (id) {
      const friendSocketId = socketRedis.get(id);
      if (friendSocketId) {
        const user = socket.user.copy();
        delete user._id;
        delete user.password;
        socketObj.to(friendSocketId).emit("add_friend", socket.user);
      }
    });
    socket.on("update_message_status_seen", async (ids) => {
      Message.updateMany({ id: { $in: ids } }, { status: "seen" }).then(
        (messages) => {
          logger.info("Message status updated to seen: " + ids);
          friendSocketId = socketRedis.get(messages[0].from.username);
          if (friendSocketId) {
            logger.info(
              "Going to emit message to the friend on socket id: " +
                friendSocketId
            );
            socketObj.to(friendSocketId).emit("update_message_status_seen", {
              friend: socket.user.username,
              messageIds: ids,
            });
          }
        }
      );
    });
    socket.on("disconnect", function (username) {
      logger.info("User disconnected: " + username);
      socketRedis.del(socket.user.username);
    });
  });
}

module.exports = { EstablishSocket, afterConnect };
