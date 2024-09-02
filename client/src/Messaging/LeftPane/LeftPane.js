import React from "react";
import Contacts from "./Contacts/Contacts";
import "../Styles/messaging.css";
import Header from "../Header/Header";
import SearchFriend from "./SearchFriend/SearchFriend";
import styles from "./leftPane.module.css";
const LeftPane = (props) => {
  return (
    <>
      <div className={styles.leftPane}>
        <Header user={props.user} currentUser={true} />
        <SearchFriend />
        <Contacts
          friends={props.friends}
          getTime={props.getTime}
          messages={props.messages}
          loadMessages={props.loadMessages}
        />
      </div>
    </>
  );
};
export default LeftPane;
