import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./Main/Main";
import SignUp from "./SignUp/SignUp";
import Messaging from "./Messaging/Messaging";
import Login from "./Login/Login";
import axios from "axios";
const App = () => {
  // states to store data for the user
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState({});
  const [messages, setMessages] = useState({});
  const [isRightOn, setIsRightOn] = useState(false);
  // get messages function
  const getMessages = async () =>
  {
  
  }
  // const get friends
  const getFriends = async () =>{

  }
    // login to the app
    const login = async (event) => {
      event.preventDefault();
      let uname = event.target[0].value;
      let pass = event.target[1].value;
      await axios
        .post("/login", {
          username: uname,
          password: pass,
        })
        .then(function (response) {
          console.log(response);
          if (response.status == 200) {
            setUser(response.data);
            console.log(user.messages);
            setFriends(response.data.friends);
            setMessages(response.data.messages);
            window.location.href = "/messaging";
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    };
  
  // sign up function
  const signUp = async (event) => {
    event.preventDefault();
    var fname = event.target[0].value;
    var lname = event.target[1].value;
    var email = event.target[2].value;
    var username = event.target[3].value;
    var pass = event.target[4].value;
    await axios
      .post("/register", {
        firstName: fname,
        lastName: lname,
        email: email,
        username: username,
        password: pass,
      })
      .then(function (response) {
        if (response.status == 200 && response.data !== undefined) {
          setUser(response.data);
          console.log(user.messages);
          getMessages();
          getFriends();
          window.location.href = "/messaging";
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  // logout function
  const logOut = async function(){
    setUser({});
    setFriends({});
    setMessages({});
    await axios
      .post("http://127.0.0.1:5000/logout", {})
      .then(function (response) {
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  // add new friend

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Main />} />
        <Route exact path="/login" element={<Login login={login} />} />
        <Route
          exact
          path="/messaging"
          element={<Messaging messages={messages} isRightOn = {isRightOn} setIsRightOn = {setIsRightOn} />}
        />
        <Route exact path="/register" element={<SignUp signUp={signUp} />} />
      </Routes>
    </Router>
  );
};
export default App;
