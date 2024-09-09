import React from "react";
import LPane from "./LeftPane/LeftPane";
import RPane from "./RightPane/RightPane";
import { useState, useEffect } from "react";
import "./Styles/messaging.css";
import styles from "./messaging.module.css";

const Messaging = ({ JWTToken, axios, socket }) => {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState({});
  const [messages, setMessages] = useState({});
  const [isRightOn, setIsRightOn] = useState(false);
  const [friendusername, setFriendUserName] = useState("");
  const [searchedFriendText, setSearchedFriendText] = useState("");
  const [searchedFriends, setSearchedFriends] = useState([]);

  // get messages function
  const getMessages = async () => {
    axios.get("/messages").then((response) => {
      if (response.status === 200) {
        setMessages(response.data);
      }
    });
  };
  // const get friends
  const getFriends = async () => {
    axios.get(`/friends`).then((response) => {
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
      .get(`/user`)
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
    if (JWTToken && JWTToken !== "") {
      await getUser();
      await getFriends();
      await getMessages();
    }
  }, [JWTToken]);
  function getTime(str) {
    let today = new Date(str);
    let hour =
      today.getHours() < 10 ? "0" + today.getHours() : today.getHours();
    let minute =
      today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    let time = hour + ":" + minute;
    return time;
  }
  function loadMessages(friendUsername) {
    setFriendUserName(friendUsername);
    setIsRightOn(true);
  }
  useEffect(() => {
    if (friendusername.length > 0) {
      setIsRightOn(true);
    }
  }, [friendusername]);

  // check for recived messages
  function checkRecieved() {
    for (let key in messages) {
      const ids = [];
      let count = 0;
      messages[key].forEach(function (message) {
        if (
          message.status &&
          message.status === "sent" &&
          message.to.username === user.username &&
          socket != null
        ) {
          ids.push(message._id);
          message.status = "received";
          count++;
        }
      });
      messages[key].received = count;
      if (ids.length > 0) {
        socket.emit("update_message_status_received", ids);
      }
    }
  }
  useEffect(() => {
    checkRecieved();
  }, [messages]);

  useEffect(() => {
    if (searchedFriendText.length > 0) {
      const friendsFound = Object.keys(friends).filter((friendUserName) => {
        if (friendUserName.includes(searchedFriendText.toLowerCase()))
          return true;
        const fullname =
          friends[friendUserName].firstName.toLowerCase() +
          " " +
          friends[friendUserName].lastName.toLowerCase();
        return fullname.includes(searchedFriendText.toLowerCase());
      });

      if (friendsFound.length > 0) {
        setSearchedFriends(friendsFound);
      } else {
        setSearchedFriends([]);
      }
    } else {
      setSearchedFriends([]);
    }
  }, [searchedFriendText]);
  useEffect(() => {
    if (socket) {
      socket.on("add_friend", (friend) => {
        setFriends((prev) => {
          return { ...prev, [friend.username]: friend };
        });
      });
    }
  }, [socket]);
  return (
    <>
      <div className={styles.topContainer}>
        <div className={styles.mainContainer}>
          <LPane
            user={user}
            messages={messages}
            getTime={getTime}
            loadMessages={loadMessages}
            friends={friends}
            setSearchedFriendText={setSearchedFriendText}
            searchedFriends={searchedFriends}
          />
          {isRightOn ? (
            <RPane
              user={user}
              friend={friends[friendusername]}
              messageData={messages[friendusername]}
              getTime={getTime}
              socket={socket}
            />
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};
export default Messaging;
