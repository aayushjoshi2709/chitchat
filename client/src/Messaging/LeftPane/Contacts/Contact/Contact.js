import React from "react";
import MessageCount from "./MessageCount/MessageCount";
import "../../../Styles/messaging.css";
import style from "./contact.module.css";
function Contact(props) {
  return (
    <div
      className={style.contact}
      onClick={() => {
        props.loadMessages(props.contact.username);
      }}
    >
      <img
        src={
          props.contact && props.contact.image
            ? props.contact.image
            : process.env.PUBLIC_URL + "/assets/avatar.png"
        }
        className={style.avatar}
      />
      <div className={style.nameContact}>
        <p>{props.contact.firstName + " " + props.contact.lastName}</p>
        <p>{props.lastMessage.message}</p>
      </div>
      <div>
        {props.getTime(props.lastMessage.time)}
        {props.contact.received > 0 ? (
          <MessageCount count={props.contact.received} />
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default Contact;
