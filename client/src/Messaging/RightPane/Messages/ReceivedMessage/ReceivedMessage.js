import React from "react";

const ReceivedMessage = ({ message, getTime, socket }) => {
  if (
    message.status &&
    (message.status === "received" || message.status === "sent")
  ) {
    socket.emit("update_message_status_seen", message.id);
    message.status = "seen";
  }
  return (
    <div className="d-flex justify-content-start">
      <div className="card msg bg-light p-1 m-1 rounded">
        <div>{message.message}</div>
        <div
          id={message.id}
          className="text-muted text-end"
          style={{ fontSize: "small" }}
        >
          {getTime(message.time)}
        </div>
      </div>
    </div>
  );
};
export default ReceivedMessage;
