import React from "react";
import styles from "./receivedMessage.module.css";
const ReceivedMessage = ({ message, getTime, socket, friend }) => {
  if (
    message.status &&
    (message.status === "received" || message.status === "sent")
  ) {
    socket.emit("update_message_status_seen", {
      username: friend.username,
      id: message._id,
    });
    message.status = "seen";
  }
  return (
    <div className="d-flex justify-content-start">
      <div className="card msg bg-light p-1 m-1 rounded">
        <div>
          <p className={styles.messagePara}>{message.message}</p>
        </div>
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
