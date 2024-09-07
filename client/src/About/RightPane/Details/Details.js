import React from "react";

function Details({ user, axios }) {
  return (
    <div id="details-container" className="container">
      <form className="mt-4" action="" method="post">
        <h1 className="display-5 text-center">User Details Page</h1>
        <div className="form-group m-2 mt-4">
          <input
            type="text"
            className="form-control"
            required
            name="firstName"
            value={user.firstName}
          />
        </div>
        <div className="form- m-2">
          <input
            type="text"
            className="form-control"
            required
            name="lastName"
            value={user.lastName}
          />
        </div>
        <div className="form-group m-2">
          <input
            type="email"
            className="form-control"
            required
            name="email"
            value={user.email}
          />
        </div>
        <div className="form-group m-2">
          <input
            type="text"
            className="form-control"
            required
            name="username"
            value={user.username}
          />
        </div>
        ;
        <div className="text-center mt-3">
          <button type="submit" className="btn btn-primary btn-lg">
            Update Data
          </button>
        </div>
      </form>
    </div>
  );
}

export default Details;
