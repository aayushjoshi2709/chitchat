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
            <p className={style.name}>
              {contact.firstName + " " + contact.lastName}
            </p>
            <small className={style.lastMessage}>
              {lastMessage ? lastMessage.message : ""}
            </small>
          </div>
          <div>
            <small>
              {lastMessage && lastMessage.time ? getTime(lastMessage.time) : ""}
            </small>
            {contact.received && contact.received > 0 ? (
              <MessageCount count={contact.received} />
            ) : (
              ""
            )}
          </div>
        </>
      ) : (
        <div className={style.nameContact}>
          <p className={style.name}>Removed Friend</p>
          <small className={style.lastMessage}>
            {lastMessage && lastMessage.message ? lastMessage.message : ""}
          </small>
        </div>
      )}
    </div>
  );
}

export default Contact;
