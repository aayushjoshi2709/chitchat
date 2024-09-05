import React from "react";
import SentMessage from "./SentMessage/SentMessage";
import ReceivedMessage from "./ReceivedMessage/ReceivedMessage";
import Styles from "./messages.module.css";
const Messages = ({ messageData, getTime, socket, user }) => {
  console.table(messageData);
  return (
    <div className={Styles.messages}>
      {messageData
        ? messageData.map(function (message) {
            return message.from.username === user.username ? (
              <SentMessage
                key={message.id}
                message={message}
                getTime={getTime}
              />
            ) : (
              <ReceivedMessage
                key={message.id}
                message={message}
                getTime={getTime}
                socket={socket}
              />
            );
          })
        : ""}
    </div>
  );
};
export default Messages;
