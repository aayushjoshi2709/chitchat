import React from "react";
import LPane from "./LeftPane/LeftPane";
import RPane from "./RightPane/RightPane";
import { useState, useEffect } from "react";
import "./Styles/messaging.css";
import styles from "./messaging.module.css";

const Messaging = ({
  JWTToken,
  axios,
  socket,
  friends,
  setFriends,
  messages,
  setMessages,
}) => {
  const [user, setUser] = useState(null);
  const [isRightOn, setIsRightOn] = useState(false);
  const [friendusername, setFriendUserName] = useState("");
  const [searchedFriendText, setSearchedFriendText] = useState("");
  const [searchedFriends, setSearchedFriends] = useState([]);
  const [gotFriends, setGotFriends] = useState(false);

  // check for recived messages
  function checkReceived(messages) {
    for (let username in messages) {
      const ids = [];
      let count = 0;
      Object.keys(messages[username]["messages"]).forEach(function (id) {
        let message = messages[username]["messages"][id];
        if (
          message.status &&
          message.status === "sent" &&
          message.to.username === user.username &&
          socket != null
        ) {
          ids.push(message._id);
          messages[username]["messages"][id].status = "received";
          count++;
        }
      });
      messages[username].received = count;
      if (ids.length > 0) {
        socket.emit("update_message_status_received", {
          from: username,
          ids: ids,
        });
      }
    }
    return messages;
  }
  // get messages function
  const getMessages = async () => {
    axios.get("/messages").then((response) => {
      if (response.status === 200) {
        setMessages(checkReceived(response.data));
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
        setGotFriends(true);
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
    }
  }, [JWTToken]);

  useEffect(async () => {
    if (user) {
      await getFriends();
    }
  }, [user]);

  useEffect(async () => {
    if (gotFriends) {
      await getMessages();
      setGotFriends(false);
    }
  }, [gotFriends]);

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
              messages={messages}
              setMessages={setMessages}
              user={user}
              friendusername={friendusername}
              friend={friends[friendusername]}
              getTime={getTime}
              socket={socket}
              axios={axios}
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
