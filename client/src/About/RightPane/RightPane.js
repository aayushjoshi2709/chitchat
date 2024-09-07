import React, { useState } from "react";
import Details from "./Details/Details";
import Friends from "./Friends/Friends";
import Navbar from "./Navbar/Navbar";
const RightPane = ({ user, JWTToken, axios }) => {
  const [details, setDetails] = useState(true);
  return (
    <div className="col-md-8 h-100 p-4 py-5">
      <Navbar setDetails={setDetails} />
      {details ? (
        <Details axios={axios} user={user} />
      ) : (
        <Friends axios={axios} friends={user.friends} JWTToken={JWTToken} />
      )}
    </div>
  );
};
export default RightPane;
