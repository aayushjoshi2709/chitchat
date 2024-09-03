import React from "react";
import RightPane from "./RightPane/RightPane";
import LeftPane from "./LeftPane/LeftPane";
import Styles from "./about.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
function About({ JWTToken, setJWTToken }) {
  // logout function
  const logOut = async function () {
    localStorage.removeItem("token");
    setJWTToken("");
  };
  const [user, setUser] = useState({});
  useEffect(async () => {
    await axios
      .get("/user/about", {
        headers: {
          Authorization: `Bearer ${JWTToken}`,
        },
      })
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
        <LeftPane user={user} logOut={logOut} />
        <RightPane user={user} JWTToken={JWTToken} />
      </div>
    </div>
  );
}

export default About;
