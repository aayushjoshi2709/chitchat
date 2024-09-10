import React from "react";
import "../../Styles/messaging.css";
import { useRef } from "react";
const SendMessage = ({ axios, friend, messages, setMessages }) => {
  const input = useRef(null);
  const send = () => {
    if (input.current.value !== "") {
      axios
        .post("/messages", {
          to: friend.username,
          message: input.current.value,
        })
        .then((response) => {
          if (response.status === 201) {
            const message = response.data.data;
            const updatedMessages = {
              ...messages,
              [friend.username]: {
                ...messages[friend.username],
                messages: {
                  ...messages[friend.username]?.messages,
                  [message._id]: message,
                },
                lastMessage: {
                  message: message.message,
                  time: message.time,
                },
              },
            };
            setMessages(updatedMessages);
            input.current.value = "";
          }
        });
    }
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
