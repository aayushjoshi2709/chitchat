import React from "react";
import "../../Styles/messaging.css";
import { useRef } from "react";
const SendMessage = ({ socket, friend }) => {
  const input = useRef(null);
  const send = () => {
    console.log("Sending message to: ", friend.username);
    socket.emit("new_message", {
      to: friend.username,
      message: input.current.value,
    });
    input.current.value = "";
  };
  return (
    <div className="card p-2 m-0">
      <div className="row">
        <div className="footer-sent">
          <input
            ref={input}
            id="sendText"
            type="text"
            className="form-control px-3 rounded-pill "
            placeholder="Enter the text to be sent..."
          ></input>
          <button
            onClick={() => {
              send();
            }}
            className="btn btn-success float-right"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMessage;
