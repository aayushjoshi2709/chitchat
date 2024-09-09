const logger = require("../logger/logger");
const { socketObj, socketCache } = require("../sockets/socket");
const Message = require("../models/Messages/Messages.model");
const socketEvents = {};

socketEvents.connection = (socket) => {
  socket.on("disconnect", () => {
    logger.info("User disconnected: " + socket.user.username);
    socketCache.del(socket.user.username);
  });
  socket.on("update_message_status_received", async (ids) => {
    Message.updateMany({ id: { $in: ids } }, { status: "received" }).then(
      (messages) => {
        logger.info("Messagages status updated to received for ids: " + ids);
        friendSocketId = socketCache.get(messages[0].from.username);
        if (friendSocketId) {
          logger.info(
            "Going to emit message to the friend on socket id: " +
              friendSocketId
          );
          socketObj.to(friendSocketId).emit("update_message_status_received", {
            friend: socket.user.username,
            messageIds: ids,
          });
        }
      }
    );
  });
  socket.on("update_message_status_seen", async (ids) => {
    Message.updateMany({ id: { $in: ids } }, { status: "seen" }).then(
      (messages) => {
        logger.info("Message status updated to seen: " + ids);
        friendSocketId = socketCache.get(messages[0].from.username);
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
};

module.exports = socketEvents;
