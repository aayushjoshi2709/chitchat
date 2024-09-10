import React from "react";
import Header from "../Header/Header";
import SendMessage from "./SendMessage/SendMessage";
import Messages from "./Messages/Messages";
import "../Styles/messaging.css";
import styles from "./rightPane.module.css";
const RightPane = ({ friend, user, socket, messageData, getTime, axios }) => {
  return (
    <div className={styles.rightPane}>
      <Header user={friend} currentUser={false} />
      <Messages
        friend={friend}
        socket={socket}
        user={user}
        messageData={messageData}
        getTime={getTime}
      />
      {friend ? (
        <SendMessage axios={axios} friend={friend} socket={socket} />
      ) : null}
    </div>
  );
};
export default RightPane;
