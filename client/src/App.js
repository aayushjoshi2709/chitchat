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
import "./App.css";
const App = () => {
  // states to store data for the user
  const [JWTToken, setJWTToken] = useState("");
  axios.defaults.baseURL = "http://localhost:5000";
  // sign up function
  useEffect(async () => {
    console.log(JWTToken);
    if (JWTToken === "") {
      const token = await localStorage.getItem("token");
      if (token) {
        setJWTToken(token);
      } else {
        redirect("/login");
      }
    } else {
      axios.defaults.headers.common["Authorization"] = `Bearer ${JWTToken}`;
    }
  }, [JWTToken]);

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

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Main axios={axios} />} />
        <Route
          exact
          path="/login"
          element={<Login setJWTToken={setJWTToken} axios={axios} />}
        />
        <Route
          exact
          path="/messaging"
          element={
            <Messaging
              JWTToken={JWTToken}
              setJWTToken={setJWTToken}
              axios={axios}
            />
          }
        />
        <Route
          exact
          path="/register"
          element={<SignUp setJWTToken={setJWTToken} axios={axios} />}
        />
        <Route
          exact
          path="/about"
          element={<About setJWTToken={setJWTToken} axios={axios} />}
        />
      </Routes>
    </Router>
  );
};
export default App;
