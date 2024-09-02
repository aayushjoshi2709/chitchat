import React from "react";
import SentMessage from "./SentMessage/SentMessage";
import ReceivedMessage from "./ReceivedMessage/ReceivedMessage";
import Styles from "./messages.module.css";
const Messages = (props) => {
  console.table(props.messageData);
  return (
    <div className={Styles.messages}>
      {props.messageData
        ? props.messageData.map(function (message) {
            return message.from.username === props.user.username ? (
              <SentMessage
                key={message.id}
                message={message}
                getTime={props.getTime}
              />
            ) : (
              <ReceivedMessage
                key={message.id}
                message={message}
                getTime={props.getTime}
                socket={props.socket}
              />
            );
          })
        : ""}
    </div>
  );
};
export default Messages;
