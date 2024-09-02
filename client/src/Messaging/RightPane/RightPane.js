import React from "react";
import Header from "../Header/Header";
import SendMessage from "./SendMessage/SendMessage";
import Messages from "./Messages/Messages";
import "../Styles/messaging.css";
import styles from "./rightPane.module.css";
const RightPane = (props) => {  
  return (
    <div className={styles.rightPane}>
      <Header user={props.friend} currentUser={false} />
      <Messages
        socket={props.socket}
        user={props.user}
        messageData={props.messageData.messages}
        getTime={props.getTime}
      />
      <SendMessage />
    </div>
  );
};
export default RightPane;
