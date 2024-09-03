import React from "react";
import { Link, useNavigate } from "react-router-dom";

const LeftPane = ({ user, logOut }) => {
  return (
    <div className="col-md-4 h-100 py-5 d-flex justify-content-center">
      <div className=" mx-auto text-center">
        <div className="img-thumbnail rounded">
          <img
            className="img-fluid rounded"
            src={
              user && user.image
                ? user.image
                : process.env.PUBLIC_URL + "/assets/avatar.png"
            }
          />
        </div>
        <h1 className="display-5 text-center mt-2">
          {user.firstName + " " + user.lastName}
        </h1>
        <p
          className="display-5 text-center mt-2"
          style={{ fontSize: "larger" }}
        >
          {user.username}
        </p>
        <div className="mt-2">
          <Link
            onClick={() => logOut()}
            className="btn btn-success btn-lg m-1"
            to="/"
          >
            Logout
          </Link>
          <Link to="/messaging" className="btn btn-danger btn-lg m-1">
            Close
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LeftPane;
