import React from "react";

const Friends = (props) => {
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
                  {Object.keys(props.friends).map((key, index) => {
                    return (
                      <tr key={key}>
                        <th scope="row">{index + 1}</th>
                        <td>{props.friends[key].name}</td>
                        <td>{props.friends[key].email}</td>
                        <td>{props.friends[key].handle}</td>
                        <td>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              props.removeFriend(key);
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
