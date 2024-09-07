import React from "react";
import MessageCount from "./MessageCount/MessageCount";
import "../../../Styles/messaging.css";
import style from "./contact.module.css";
function Contact({
  friendUsername,
  contact,
  loadMessages,
  lastMessage,
  getTime,
}) {
  return (
    <div
      className={style.contact}
      onClick={() => {
        loadMessages(friendUsername);
      }}
    >
      <img
        src={
          contact && contact.image
            ? contact.image
            : process.env.PUBLIC_URL + "/assets/avatar.png"
        }
        className={style.avatar}
      />
      {contact ? (
        <>
          <div className={style.nameContact}>
            <p>{contact.firstName + " " + contact.lastName}</p>
            <p className={style.lastMessage}>
              {lastMessage ? lastMessage.message : ""}
            </p>
          </div>
          <div>
            {lastMessage && lastMessage.time ? getTime(lastMessage.time) : ""}
            {contact.received && contact.received > 0 ? (
              <MessageCount count={contact.received} />
            ) : (
              ""
            )}
          </div>
        </>
      ) : (
        <div className={style.nameContact}>
          <p>Removed Friend</p>
          <p className={style.lastMessage}>
            {lastMessage && lastMessage.message ? lastMessage.message : ""}
          </p>
        </div>
      )}
    </div>
  );
}

export default Contact;
