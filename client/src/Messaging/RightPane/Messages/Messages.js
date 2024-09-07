import React, { useEffect } from "react";
import SentMessage from "./SentMessage/SentMessage";
import ReceivedMessage from "./ReceivedMessage/ReceivedMessage";
import Styles from "./messages.module.css";
import { useRef } from "react";
const Messages = ({ messageData, getTime, socket, user }) => {
  const messagesRef = useRef(null);
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messageData]);
  return (
    <div ref={messagesRef} className={Styles.messages}>
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
