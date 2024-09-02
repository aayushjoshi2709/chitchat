const socket = require("socket.io");
const User = require("../models/User/User.model");
const Message = require("../models/Messages/Messages.model");
require("dotenv").config();
// store socket id for a user on connection
function EstablishSocket(http) {
  return socket(http, {
    cors: {
      origin: "http://" + process.env.IP + ":" + process.env.PORT,
      methods: ["GET", "POST"],
      transports: ["websocket", "polling"],
      credentials: true,
    },
    allowEIO3: true,
  });
}

function afterConnect(socketObj) {
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
