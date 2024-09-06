const socket = require("socket.io");
const User = require("../models/User/User.model");
const Message = require("../models/Messages/Messages.model");
const { userRedis, socketRedis } = require("../redis/redis");
const { json } = require("body-parser");
require("dotenv").config();
// store socket id for a user on connection
function EstablishSocket(http) {
  return socket(http, {
    cors: {
      origin: "http://" + process.env.IP + ":" + process.env.PORT,
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
      jwt.verify(
        socket.handshake.query.token,
        process.env.JWT_SECRET,
        async (err, decoded) => {
          if (err) {
            return next(new Error("Authentication error"));
          }
          user = await userRedis.get(decoded.username);
          if (user) {
            logger.info("User found in cache: " + json.stringify(user));
            socket.user = user;
            next();
          } else {
            logger.info(
              "User not found in cache going to hit the db:" + user.username
            );
            User.findOne({ username: decoded.username })
              .then(async (user) => {
                if (!user) {
                  logger.error("User not found for the token:" + token);
                  next(new Error("User not found"));
                }
                await userRedis.set(decoded.username, user);
                socket.user = user;
                next();
              })
              .catch((error) => {
                logger.error("Error while finding user for the token:" + token);
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
    socket.on("user", function (data) {
      logger.info(
        `Going to connect user: ${data.username} to socket: ${socket.id}`
      );
      socketRedis
        .set(socket.user.username, socket.id)
        .then(() => {
          logger.info("Socket id saved for user: " + socket.user.username);
        })
        .catch((error) => {
          logger.error(
            "Error in saving socket id for user: " + socket.user.username
          );
          logger.error(error);
        });
    });
    socket.on("new_message", function (message) {
      const message = {
        from: {
          username: socket.user.username,
        },
        status: "sent",
        time: Date.now(),
      };
      const friend = userRedis.get(message.to);
      if (friend) {
        message.to = {
          username: friend.username,
        };
        const newMessage = new Message(message);
        newMessage
          .save()
          .then((message) => {
            friendSocketId = socketRedis.get(friend.username);
            if (friendSocketId) {
              socketObj.to(friendSocketId).emit("new_message", message);
            }
          })
          .catch((error) => {
            logger.error("Error in saving message: " + error);
          });
      } else {
        User.findOne({ username: message.to }).then((friend) => {
          if (!friend) {
            logger.error("Error in finding friend: " + error);
          } else {
            message.to = {
              username: friend.username,
            };
            const newMessage = new Message(message);
            newMessage
              .save()
              .then((message) => {
                const friendSocketId = socketRedis.get(friend.username);
                if (friendSocketId) {
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
    socket.on("update_message_status_received", async (id) => {
      Message.findByIdAndUpdate(id, { status: "received" }).then((message) => {
        logger.info("Message status updated to received: " + message._id);
        friendSocketId = socketRedis.get(message.from.username);
        if (friendSocketId) {
          socketObj
            .to(friendSocketId)
            .emit("update_message_status_received", id);
        }
      });
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
    socket.on("update_message_status_seen", async (id) => {
      Message.findByIdAndUpdate(id, { status: "seen" }).then((message) => {
        logger.info("Message status updated to seen: " + message._id);
        friendSocketId = socketRedis.get(message.from.username);
        if (friendSocketId) {
          socketObj.to(friendSocketId).emit("update_message_status_seen", id);
        }
      });
    });
    socket.on("disconnect", function (username) {
      logger.info("User disconnected: " + username);
      socketRedis.del(socket.user.username);
    });
  });
}

module.exports = { EstablishSocket, afterConnect };
