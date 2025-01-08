import React,{useState, useEffect} from "react";
import Styles from "./header.module.css";
import { Link } from "react-router-dom";

const Header = ({axios, user, currentUser}) => {
  const [isOnline, setIsOnline] = useState(false);
  useEffect(() => {
    setInterval(() => {
      if(axios && user){
        axios
        .get(`/user/${user.username}/checkOnline`)
        .then((res)=>{
          if(res.status === 200){
            if(res.data.status){
              setIsOnline(true);
            }else{
              setIsOnline(false);
            }
          }
        })
      }
    }, 15000);
  }, [user])
  
  const data = (user, currentUser) => {
    return (
      <div className={Styles.header}>
        <img
          className={Styles.avatar}
          src={
            user && user.image
              ? `${process.env.REACT_APP_SERVER_URL}/${user.image}`
              : process.env.PUBLIC_URL + "/assets/avatar.png"
          }
        />
        {currentUser === false ? (
          user ? (
            <div className={Styles.details}>
              <p>{user.firstName + " " + user.lastName}</p>
              <span className={Styles.onlineSpan}>
                {isOnline?<i className="fa-solid fa-circle"></i>:""}
              </span>
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
  return currentUser ? (
    <Link to="/about">{data(user, currentUser)}</Link>
  ) : (
    data(user, currentUser)
  );
};
export default Header;
