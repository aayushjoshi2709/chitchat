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
import axios from "axios";
import About from "./About/About";
import io from "socket.io-client";
import "./App.css";
const App = () => {
  const socket = io.connect({
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
  });
  axios.defaults.baseURL = "http://localhost:5000";
  // disconnect socket when when window/browser/site is closed
  window.addEventListener("onbeforeunload", function (e) {
    socket.disconnect();
  });
  // states to store data for the user
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState({});
  const [messages, setMessages] = useState({});
  const [JWTToken, setJWTToken] = useState("");

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

  // get messages function
  const getMessages = async () => {
    axios
      .get("/messages", {
        headers: {
          Authorization: `Bearer ${JWTToken}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setMessages(response.data);
        }
      });
  };
  // const get friends
  const getFriends = async () => {
    axios
      .get(`/friends`, {
        headers: {
          Authorization: `Bearer ${JWTToken}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          const friendMap = {};
          response.data.forEach((friend) => {
            friendMap[friend.username] = friend;
          });
          setFriends(friendMap);
        }
      });
  };

  // get user function
  const getUser = async () => {
    axios
      .get(`/user`, {
        headers: {
          Authorization: `Bearer ${JWTToken}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setUser(response.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(async () => {
    if (JWTToken !== "") {
      await getUser();
      await getFriends();
      await getMessages();
      socket.on("connect", function () {
        // Send emit user id right after connect
        socket.emit("user", JWTToken);
      });
    }
  }, [JWTToken]);

  // sign up function

  useEffect(() => {
    if (JWTToken === "") {
      const token = localStorage.getItem("token");
      if (token) {
        setJWTToken(token);
      }
    }
  }, []);

  // check for recived messages
  function checkRecieved() {
    for (let key in messages) {
      let count = 0;
      messages[key].forEach(function (message) {
        if (
          message.status &&
          message.status !== "seen" &&
          message.to.username === user.username
        ) {
          socket.emit("update_message_status_received", message._id);
          message.status = "received";
          count++;
        }
      });
      messages[key].received = count;
    }
  }
  useEffect(() => {
    checkRecieved();
  }, [messages]);

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Main />} />
        <Route
          exact
          path="/login"
          element={<Login setJWTToken={setJWTToken} />}
        />
        <Route
          exact
          path="/messaging"
          element={
            <Messaging
              messages={messages}
              friends={friends}
              user={user}
              socket={socket}
            />
          }
        />
        <Route
          exact
          path="/register"
          element={<SignUp setJWTToken={setJWTToken} />}
        />
        <Route
          exact
          path="/about"
          element={<About JWTToken={JWTToken} setJWTToken={setJWTToken} />}
        />
      </Routes>
    </Router>
  );
};
export default App;
