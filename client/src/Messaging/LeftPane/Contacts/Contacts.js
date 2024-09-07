import React from "react";
import Contact from "./Contact/Contact";
import styles from "./contacts.module.css";
function Contacts({
  messages,
  friends,
  getTime,
  loadMessages,
  searchedFriends,
}) {
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
                    ? messages[friendUserName][
                        messages[friendUserName].length - 1
                      ]
                    : null
                }
                loadMessages={loadMessages}
              />
            );
          })
        : Object.keys(messages).map((friendUserName) => {
            return (
              <Contact
                getTime={getTime}
                key={friendUserName}
                friendUsername={friendUserName}
                contact={friends[friendUserName]}
                lastMessage={
                  messages[friendUserName][messages[friendUserName].length - 1]
                }
                loadMessages={loadMessages}
              />
            );
          })}
    </div>
  );
}
export default Contacts;
