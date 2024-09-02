import React from "react";
import Contact from "./Contact/Contact";
import styles from "./contacts.module.css";
function Contacts(props) {
  return (
    <div className={styles.contacts}>
      {Object.keys(props.messages).map((index) => {
        return (
          <Contact
            getTime={props.getTime}
            key={index}
            contact={props.friends[index]}
            lastMessage={
              props.messages[index][props.messages[index].length - 1]
            }
            loadMessages={props.loadMessages}
          />
        );
      })}
    </div>
  );
}
export default Contacts;
