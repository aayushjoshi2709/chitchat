import React from "react";
import "../../Styles/messaging.css";
import { useRef } from "react";
const SendMessage = ({ socket }) => {
  const input = useRef(null);
  const send = async () => {
    const text = input.current.value;
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
            onClick={() => send()}
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
