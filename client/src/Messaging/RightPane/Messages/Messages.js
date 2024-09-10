import React, { useEffect } from "react";
import SentMessage from "./SentMessage/SentMessage";
import ReceivedMessage from "./ReceivedMessage/ReceivedMessage";
import Styles from "./messages.module.css";
import { useRef } from "react";
const Messages = ({ messageData, getTime, socket, user, friend }) => {
  const messagesRef = useRef(null);
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messageData]);
  return (
    <div ref={messagesRef} className={Styles.messages}>
      {messageData
        ? Object.keys(messageData).map(function (messageId) {
            return messageData[messageId].from.username === user.username ? (
              <SentMessage
                key={messageId}
                message={messageData[messageId]}
                getTime={getTime}
              />
            ) : (
              <ReceivedMessage
                friend={friend}
                key={messageId}
                message={messageData[messageId]}
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
