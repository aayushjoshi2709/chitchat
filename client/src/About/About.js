import React from "react";
import RightPane from "./RightPane/RightPane";
import LeftPane from "./LeftPane/LeftPane";
import Styles from "./about.module.css";
function About(props) {
  return (
    <div className={Styles.topContainer}>
      <div className={Styles.header}></div>
      <div className={Styles.mainContainer}>
        <LeftPane user={props.user} logOut={props.logOut} />
        <RightPane friends={props.friends} user={props.user} />
      </div>
    </div>
  );
}

export default About;
