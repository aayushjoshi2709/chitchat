import React from "react";
import Contacts from "./Contacts/Contacts";
import "../Styles/messaging.css";
import Header from "../Header/Header";
import SearchFriend from "./SearchFriend/SearchFriend";
import styles from "./leftPane.module.css";
const LeftPane = ({
  user,
  friends,
  getTime,
  loadMessages,
  messages,
  setSearchedFriendText,
  searchedFriends,
}) => {
  return (
    <>
      <div className={styles.leftPane}>
        <Header user={user} currentUser={true} />
        <SearchFriend setSearchedFriendText={setSearchedFriendText} />
        <Contacts
          searchedFriends={searchedFriends}
          friends={friends}
          getTime={getTime}
          messages={messages}
          loadMessages={loadMessages}
        />
      </div>
    </>
  );
};
export default LeftPane;
