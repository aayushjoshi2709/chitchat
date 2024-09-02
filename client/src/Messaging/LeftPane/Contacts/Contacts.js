import React from "react";
import "../../Styles/messaging.css";
import Contact from "./Contact/Contact";
function Contacts(props) {
  return (
    <div id="contacts">
      {Object.keys(props.messages).map((index) => {
        return (
          <Contact
            getTime={props.getTime}
            key={index}
            id={index}
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
