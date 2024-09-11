import React from "react";
import style from "./sentMessage.module.css";
const SentMessage = ({ message, getTime }) => {
  return (
    <div className="d-flex justify-content-end">
      <div className="card msg color-green p-1 m-1 rounded">
        <div>
          <p className={style.messagePara}>{message.message}</p>
        </div>
        <div id={message.id} className="text-muted text-end">
          <small>{getTime(message.time)} </small>
          {message.status === "sent" ? (
            <i className="fa-solid fa-check"></i>
          ) : message.status === "received" ? (
            <i className="fa-solid fa-check-double"></i>
          ) : message.status === "seen" ? (
            <i
              className="fa-solid fa-check-double"
              style={{ color: "blue" }}
            ></i>
          ) : (
            ""
          )}{" "}
        </div>
      </div>
    </div>
  );
};
export default SentMessage;
