const socket = require("socket.io");
const User = require("../models/User/User.model");
const Message = require("../models/Messages/Messages.model");
const redisClient = require("../redis/redis");
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
          user = redisClient.get(decoded.username);
          if (user) {
            logger.info("User found in cache: " + json.stringify(user));
            socket.user = user;
            next();
          } else {
            logger.info(
              "User not found in cache going to hit the db:" + user.username
            );
            await User.findOne({ username: decoded.username })
              .then((user) => {
                if (!user) {
                  logger.error("User not found for the token:" + token);
                  next(new Error("User not found"));
                }
                redisClient.set(decoded.username, user);
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
      User.findByIdAndUpdate(
        data,
        { socketid: socket.id },
        function (error, user) {
          if (error) {
            console.log("error in updation socket id");
          }
        }
      );
    });
    socket.on("new_message", function (message) {
      User.findById(message.to, function (error, user) {
        if (user.socketid !== "NULL") {
          socketObj.to(user.socketid).emit("new_message", message);
        }
      });
    });
    socket.on("update_message_status_received", function (id) {
      Message.findByIdAndUpdate(
        id,
        { status: "received" },
        function (error, message) {
          if (error) {
            console.log("cannot update status");
          }
          User.findById(message.from, function (error, user) {
            if (user.socketid !== "NULL")
              socketObj
                .to(user.socketid)
                .emit("update_message_status_received", id);
          });
        }
      );
    });
    socket.on("add_friend", function (id) {
      User.findById(id, function (error, user) {
        if (error) console.log(error);
        else {
          if (user.socketid !== "NULL") {
            socketObj.to(user.socketid).emit("add_friend", id);
          }
        }
      });
    });
    socket.on("update_message_status_seen", function (id) {
      Message.findByIdAndUpdate(
        id,
        { status: "seen" },
        function (error, message) {
          if (error) {
            console.log("cannot update status");
          }
          User.findById(message.from, function (error, user) {
            if (user.socketid !== "NULL")
              socketObj
                .to(user.socketid)
                .emit("update_message_status_seen", id);
          });
        }
      );
    });
    socket.on("disconnect", function () {
      User.findOneAndUpdate(
        { socketid: socket.id },
        { socketid: "NULL" },
        function (error, user) {
          if (error) {
            console.log("error in removing socket id");
          }
        }
      );
    });
  });
}

module.exports = { EstablishSocket, afterConnect };
