import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Main from "./Main/Main";
import SignUp from "./SignUp/SignUp";
import Messaging from "./Messaging/Messaging";
import Login from "./Login/Login";
import axios from "axios";
import About from "./About/About";
import io from 'socket.io-client';
const App = () => {
  var socket = io.connect();
  
  // disconnect socket when when window/browser/site is closed
  window.addEventListener("onbeforeunload", function (e) {
    socket.disconnect();
  });
  // states to store data for the user
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState({});
  const [messages, setMessages] = useState({});
  // get messages function
  const getMessages = async () => {
    await axios.get(`/user/${user.id}/message`).then(
      function(response){
        if(response.status == 200){
          setMessages(response.data);
        }    
      }
    )      
  }
  // const get friends
  const getFriends = async () => {
    await axios.get(`/user/${user.id}/friend`).then(
      function(response){
        if(response.status == 200){
          setFriends(response.data);
        }    
      }
    )
  }
  useEffect(() => {
    if(user != undefined){
      socket.on('connect',function(){ 
        // Send emit user id right after connect
        socket.emit('user', user.id);
      });
      getMessages();
      getFriends();
    }
  }, [user])

  useEffect(()=>{
    if(friends.length != 0)
      console.table(friends); 
  },[friends])
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
        if (response.status == 200) {
          setUser(response.data);
          return true;
        }
      })
      .catch(function (error) {
        console.log(error);
      });
      return false;
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
          getMessages();
          return true;
        }
      })
      .catch(function (error) {
        console.log(error);
      });
      return false;
  };
  // logout function
  const logOut = async function () {
    await axios
      .post("http://127.0.0.1:5000/logout")
      .then(function (response) {
        setUser({});
        setFriends({});
        setMessages({});
        return true;
      })
      .catch(function (error) {
        console.log(error);
        return false;
      });
  }
  // check for recived messages
  function checkRecieved(){
    for(let key in messages)
    {
        var count = 0;
        messages[key].messages.forEach(function(message){
                if(message.status && (message.status !="seen" && message.to == user.id)){
                    socket.emit('update_message_status_received',message.id);     
                    message.status = "received";
                    count++;
                }
            }
        );     
        messages[key].received = count;    
    }
  }
  useEffect(() => {
    checkRecieved();
  }, [messages])

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Main />} />
        <Route exact path="/login" element={<Login login={login} />} />
        <Route
          exact
          path="/messaging"
          element={<Messaging messages={messages} user={user} socket={socket}/>}
        />
        <Route exact path="/register" element={<SignUp signUp={signUp} />} />
        <Route exact path="/about" element={<About user={user} logOut={logOut}/>} />
      </Routes>
    </Router>
  );
};
export default App;
