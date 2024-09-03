import React from "react";

const Friends = ({ friends, JWTToken }) => {
  const removeFriend = (username) => {
    console.log(username);
    fetch(`/friends/${username}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${JWTToken}`,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then((data) => {
        console.log(data);
        window.location.reload();
      });
  };
  return (
    <div id="friends-container" className="container">
      <div className="row">
        <input
          id="friend-add-search-text"
          type="text"
          className="form-control my-3"
          placeholder="Search a friend by user Handle to add..."
        />
        <div
          style={{ overflowX: "hidden", overflowY: "scroll", height: "50vh" }}
        >
          <div className="table-responsive">
            <table
              id="friend-add-search-table"
              className="table table-striped"
              width="100%"
            >
              <col style={{ width: "10%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "10%" }} />
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Handle</th>
                  <th scope="col">Add</th>
                </tr>
              </thead>
              <tbody id="friends-search-body"></tbody>
            </table>
          </div>
          <h3 className="h3">Current Friends</h3>
          <hr />
          <div className="row">
            <div className="table-responsive">
              <table className="table table-striped" width="100%">
                <col style={{ width: "10%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "10%" }} />
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Handle</th>
                    <th scope="col">Remove</th>
                  </tr>
                </thead>
                <tbody id="friends-table-body">
                  {friends
                    ? friends.map((friend, index) => {
                        return (
                          <tr key={friend.username}>
                            <th scope="row">{index + 1}</th>
                            <td>{friend.firstName + " " + friend.lastName}</td>
                            <td>{friend.email}</td>
                            <td>@{friend.username}</td>
                            <td>
                              <button
                                className="btn btn-danger"
                                onClick={() => {
                                  removeFriend(friend.username);
                                }}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    : ""}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Friends;
