import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  redirect,
} from "react-router-dom";
import Main from "./Main/Main";
import SignUp from "./SignUp/SignUp";
import Messaging from "./Messaging/Messaging";
import Login from "./Login/Login";
import About from "./About/About";
import axios from "axios";
import io from "socket.io-client";
import "./App.css";
import ProtectedRoute from "./Utils/ProtectedRoute/ProtectedRoute";
const App = () => {
  // states to store data for the user
  const [JWTToken, setJWTToken] = useState("");
  const [socket, setSocket] = useState(null);
  const [friends, setFriends] = useState({});
  const [addFriend, setAddFriend] = useState({});
  const [removeFriend, setRemoveFriend] = useState("");
  const [newMessageData, setNewMessageData] = useState(null);
  const [messages, setMessages] = useState({});
  const [statusReceived, setStatusReceived] = useState(null);
  const [statusSeen, setStatusSeen] = useState(null);

  // disconnect socket when when window/browser/site is closed
  window.addEventListener("onbeforeunload", function (e) {
    if (socket) socket.disconnect();
  });

  axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;
  // sign up function
  useEffect(async () => {
    if (JWTToken === "") {
      const token = await localStorage.getItem("token");
      if (token) {
        setJWTToken(token);
      } else {
        redirect("/login");
        if (socket) {
          socket.disconnect();
        }
      }
    } else if (!socket) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${JWTToken}`;
      const socket_conn = io(process.env.REACT_APP_SERVER_URL, {
        query: { token: JWTToken },
      }).connect({
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
      });
      setSocket(socket_conn);
      socket_conn.on("add_friend", (friend) => {
        setAddFriend(friend);
      });
      socket_conn.on("remove_friend", (username) => {
        setRemoveFriend(username);
      });
      socket_conn.on("new_message", (messageData) => {
        setNewMessageData(messageData);
      });
      socket_conn.on("update_message_status_received_ack", (data) => {
        console.log("update_message_status_received_ack:", data);
        setStatusReceived(data);
      });
      socket_conn.on("update_message_status_seen_ack", (data) => {
        console.log("update_message_status_seen_ack:", data);
        setStatusSeen(data);
      });
    }
  }, [JWTToken, setSocket, socket]);

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        setJWTToken("");
        redirect("/login");
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    if (addFriend) {
      setFriends((prev) => {
        return { ...prev, [addFriend.username]: addFriend };
      });
      setAddFriend(null);
    }
    if (removeFriend) {
      setFriends((prev) => {
        delete prev[removeFriend];
        return prev;
      });
      setRemoveFriend(null);
    }
    if (newMessageData) {
      setMessages((prev) => {
        const username = newMessageData.from;
        const message = newMessageData.message;
        return {
          ...prev,
          [username]: {
            ...prev[username],
            messages: {
              ...prev[username]?.messages,
              [message._id]: message,
            },
            lastMessage: {
              message: message.message,
              time: message.time,
            },
          },
        };
      });
      socket.emit("update_message_status_received", {
        ids: [newMessageData.message._id],
        username: newMessageData.from,
      });
      setNewMessageData(null);
    }
    if (statusReceived) {
      const username = statusReceived.friend;
      const messageIds = new Set(statusReceived.messageIds);
      setMessages((prev) => {
        return {
          ...prev,
          [username]: {
            ...prev[username],
            messages: Object.keys(prev[username].messages).map((id) => {
              if (messageIds.has(id)) {
                return {
                  ...prev[username].messages[id],
                  status: "received",
                };
              }
              return prev[username].messages[id];
            }),
          },
        };
      });
      setStatusReceived(null);
    }
    if (statusSeen) {
      const username = statusSeen.friend;
      const id = statusSeen.id;
      setMessages((prev) => {
        return {
          ...prev,
          [username]: {
            ...prev[username],
            messages: Object.keys(prev[username].messages).map((id) => {
              if (id === id) {
                return {
                  ...prev[username].messages[id],
                  status: "seen",
                };
              }
              return prev[username].messages[id];
            }),
          },
        };
      });
    }
  }, [addFriend, removeFriend, newMessageData, statusReceived, statusSeen]);

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Main axios={axios} />} />
        <Route
          exact
          path="/login"
          element={<Login setJWTToken={setJWTToken} axios={axios} />}
        />
        <Route element={<ProtectedRoute JWTToken={JWTToken} />}>
          <Route
            exact
            path="/messaging"
            element={
              <Messaging
                JWTToken={JWTToken}
                setJWTToken={setJWTToken}
                axios={axios}
                socket={socket}
                friends={friends}
                setFriends={setFriends}
                messages={messages}
                setMessages={setMessages}
              />
            }
          />
          <Route
            exact
            path="/about"
            socket={socket}
            element={
              <About
                friends={friends}
                setFriends={setFriends}
                setJWTToken={setJWTToken}
                axios={axios}
              />
            }
          />
        </Route>
        <Route
          exact
          path="/register"
          element={<SignUp setJWTToken={setJWTToken} axios={axios} />}
        />
      </Routes>
    </Router>
  );
};
export default App;
