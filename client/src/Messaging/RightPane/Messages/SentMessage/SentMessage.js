import React from "react";

const SentMessage = ({ message, getTime }) => {
  return (
    <div className="d-flex justify-content-end">
      <div className="card msg color-green p-1 m-1 rounded">
        <div>{message.message}</div>
        <div
          id={message.id}
          className="text-muted text-end"
          style={{ fontSize: "small" }}
        >
          {getTime(message.time)}{" "}
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
