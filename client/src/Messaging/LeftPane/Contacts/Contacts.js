import React from "react";
import Contact from "./Contact/Contact";
import styles from "./contacts.module.css";
function Contacts({ messages, friends, getTime, loadMessages }) {
  return (
    <div className={styles.contacts}>
      {Object.keys(messages).map((index) => {
        return (
          <Contact
            getTime={getTime}
            key={index}
            friendUsername={index}
            contact={friends[index]}
            lastMessage={messages[index][messages[index].length - 1]}
            loadMessages={loadMessages}
          />
        );
      })}
    </div>
  );
}
export default Contacts;
