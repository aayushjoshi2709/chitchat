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
    await axios
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
    await axios
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
    await axios
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

  // login to the app
  const login = async (event) => {
    event.preventDefault();
    let uname = event.target[0].value;
    let pass = event.target[1].value;
    axios
      .post("/auth/login", {
        username: uname,
        password: pass,
      })
      .then((response) => {
        if (response.status === 200) {
          setJWTToken(response.data.token);
          return true;
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return false;
  };

  // sign up function
  const signUp = async (event) => {
    event.preventDefault();
    const fname = event.target[0].value;
    const lname = event.target[1].value;
    const email = event.target[2].value;
    const username = event.target[3].value;
    const pass = event.target[4].value;
    axios
      .post("/auth/register", {
        firstName: fname,
        lastName: lname,
        email: email,
        username: username,
        password: pass,
      })
      .then((response) => {
        if (response.status === 200 && response.data !== undefined) {
          setJWTToken(response.data.token);
          return true;
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return false;
  };

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
        <Route exact path="/login" element={<Login login={login} />} />
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
        <Route exact path="/register" element={<SignUp signUp={signUp} />} />
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
