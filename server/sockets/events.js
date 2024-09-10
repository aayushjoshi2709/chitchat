const logger = require("../logger/logger");
const { socketInstance } = require("../sockets/socket");
const Message = require("../models/Messages/Messages.model");
const { socketCache } = require("../redis/redis");
const socketEvents = {};

socketEvents.connection = (socket) => {
  socket.on("disconnect", () => {
    logger.info("User disconnected: " + socket.user.username);
    socketCache.del(socket.user.username);
  });
  socket.on("update_message_status_received", async (data) => {
    Message.updateMany(
      { id: { $in: data.ids } },
      { $set: { status: "seen" } }
    ).then((messages) => {
      logger.info("Messagages status updated to received for ids: " + data.ids);
      socketCache.get(data.username).then((friendSocketId) => {
        if (friendSocketId) {
          logger.info(
            "Going to emit message to the friend on socket id: " +
              friendSocketId
          );
          socketInstance.emitEvent(
            friendSocketId,
            "update_message_status_received_ack",
            {
              friend: socket.user.username,
              messageIds: data.ids,
            }
          );
        }
      });
    });
  });
  socket.on("update_message_status_seen", async (data) => {
    Message.findByIdAndUpdate(data.id, { $set: { status: "seen" } }).then(
      (messages) => {
        logger.info("Message status updated to seen: " + data.id);
        friendSocketId = socketCache
          .get(data.username)
          .then((friendSocketId) => {
            if (friendSocketId) {
              logger.info(
                "Going to emit message to the friend on socket id: " +
                  friendSocketId
              );
              socketInstance.emitEvent(
                friendSocketId,
                "update_message_status_seen_ack",
                {
                  friend: socket.user.username,
                  id: data.id,
                }
              );
            }
          });
      }
    );
  });
};

module.exports = socketEvents;
