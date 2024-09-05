import React from "react";
import LPane from "./LeftPane/LeftPane";
import RPane from "./RightPane/RightPane";
import { useState, useEffect } from "react";
import "./Styles/messaging.css";
import styles from "./messaging.module.css";
const Messaging = ({ friends, messages, user, socket, JWTToken }) => {
  const [isRightOn, setIsRightOn] = useState(false);
  const [friendusername, setFriendUserName] = useState("");
  function getTime(str) {
    let today = new Date(str);
    let hour =
      today.getHours() < 10 ? "0" + today.getHours() : today.getHours();
    let minute =
      today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    let time = hour + ":" + minute;
    return time;
  }
  function loadMessages(friendUsername) {
    setFriendUserName(friendUsername);
    setIsRightOn(true);
  }
  useEffect(() => {
    if (friendusername.length > 0) {
      setIsRightOn(true);
    }
  }, [friendusername]);

  return (
    <>
      <div className={styles.topContainer}>
        <div className={styles.mainContainer}>
          <LPane
            user={user}
            messages={messages}
            getTime={getTime}
            loadMessages={loadMessages}
            friends={friends}
          />
          {isRightOn ? (
            <RPane
              user={user}
              friend={friends[friendusername]}
              messageData={messages[friendusername]}
              getTime={getTime}
              socket={socket}
              JWTToken={JWTToken}
            />
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};
export default Messaging;
