import React, { useState } from "react";
import Details from "./Details/Details";
import Friends from "./Friends/Friends";
import Navbar from "./Navbar/Navbar";
const RightPane = ({ user, setUser, axios, friends, setFriends }) => {
  const [details, setDetails] = useState(true);
  return (
    <div className="col-md-8 h-100 p-4 py-5">
      <Navbar setDetails={setDetails} />
      {details ? (
        <Details axios={axios} user={user} setUser={setUser} />
      ) : (
        <Friends friends={friends} setFriends={setFriends} axios={axios} />
      )}
    </div>
  );
};
export default RightPane;
