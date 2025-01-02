import React, { useEffect, useState } from "react";
import Contact from "./Contact/Contact";
import styles from "./contacts.module.css";
function Contacts({
  messages,
  friends,
  getTime,
  loadMessages,
  searchedFriends,
}) {
  const [sortedFriends, setSortedFriends] = useState([]);
  useEffect(()=>{
    let friends = []
    for(const friendUsername in messages){
      friends.push({
        username: friendUsername,
        lastMessageTime: messages[friendUsername].lastMessage.time
      })
    }
    friends = friends.sort((a, b) => {
       return new Date(b.lastMessageTime) > new Date(a.lastMessageTime) ? 1 : -1
      })
    setSortedFriends(friends)
  },[messages])
  
  return (
    <div className={styles.contacts}>
      {searchedFriends && searchedFriends.length > 0
        ? searchedFriends.map((friendUserName) => {
            return (
              <Contact
                getTime={getTime}
                key={friendUserName}
                friendUsername={friendUserName}
                contact={friends[friendUserName]}
                lastMessage={
                  messages[friendUserName]
                    ? messages[friendUserName]["lastMessage"]
                    : null
                }
                loadMessages={loadMessages}
              />
            );
          })
        : sortedFriends.map((friend) => {
            const friendUserName = friend.username
            return (
              <Contact
                getTime={getTime}
                key={friendUserName}
                friendUsername={friendUserName}
                contact={friends[friendUserName]}
                lastMessage={
                  messages[friendUserName]
                    ? messages[friendUserName]["lastMessage"]
                    : null
                }
                loadMessages={loadMessages}
              />
            );
          })}
    </div>
  );
}
export default Contacts;
