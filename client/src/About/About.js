import React from "react";
import RightPane from "./RightPane/RightPane";
import LeftPane from "./LeftPane/LeftPane";
import Styles from "./about.module.css";
import { useState, useEffect } from "react";
import { redirect } from "react-router-dom";
function About({ setJWTToken, axios, friends, setFriends }) {
  // logout function
  const logOut = () => {
    console.log("here");
    localStorage.removeItem("token");
    setJWTToken("");
    redirect("/login");
  };
  const [user, setUser] = useState({});
  useEffect(async () => {
    axios
      .get("/user/about")
      .then((res) => {
        if (res.status === 200) {
          setUser(res.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className={Styles.topContainer}>
      <div className={Styles.header}></div>
      <div className={Styles.mainContainer}>
        <LeftPane setUser={setUser} user={user} logOut={logOut} axios={axios} />
        <RightPane
          friends={friends}
          setFriends={setFriends}
          user={user}
          axios={axios}
          setUser={setUser}
        />
      </div>
    </div>
  );
}

export default About;
