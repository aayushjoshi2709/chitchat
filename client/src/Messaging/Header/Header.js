import React from "react";
import Styles from "./header.module.css";
import { Link } from "react-router-dom";

const Header = (props) => {
  const data = (props) => {
    return (
      <div className={Styles.header}>
        <img
          className={Styles.avatar}
          src={
            props.user && props.user.image
              ? props.user.image
              : process.env.PUBLIC_URL + "/assets/avatar.png"
          }
        />
        {props.currentUser === false ? (
          props.user ? (
            <div className={Styles.details}>
              <p>{props.user.firstName + " " + props.user.lastName}</p>
              <small>Online</small>
            </div>
          ) : (
            <div className={Styles.details}>
              <p>Removed Friend</p>
            </div>
          )
        ) : (
          ""
        )}
      </div>
    );
  };
  return props.currentUser ? (
    <Link to="/about">{data(props)}</Link>
  ) : (
    data(props)
  );
};
export default Header;
