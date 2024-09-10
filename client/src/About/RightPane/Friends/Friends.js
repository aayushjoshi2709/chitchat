import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
const Friends = ({ axios, friends, setFriends }) => {
  const [searchedFriendsText, setSearchedFriendsText] = useState("");
  const [searchedFriends, setSearchedFriends] = useState([]);
  const [addFriend, setAddFriend] = useState(null);
  const [removeFriend, setRemoveFriend] = useState(null);

  useEffect(() => {
    if (addFriend) {
      axios
        .put(`/friends`, {
          username: addFriend.username,
        })
        .then((response) => {
          if (response.status === 200) {
            toast.success(response.data.message);
            setFriends({ ...friends, [addFriend.username]: addFriend });
          }
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    }
  }, [addFriend]);

  useEffect(() => {
    if (removeFriend) {
      axios(`/friends/${removeFriend.username}`, {
        method: "DELETE",
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            toast.success(response.data.message);
            setFriends((prev) => {
              delete prev[removeFriend];
              return prev;
            });
          }
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    }
  }, [removeFriend]);

  useEffect(() => {
    if (searchedFriendsText.length > 0) {
      axios.get(`/friends/search/${searchedFriendsText}`).then((response) => {
        if (response.status === 200) {
          setSearchedFriends(response.data);
        }
      });
    } else {
      setSearchedFriends([]);
    }
  }, [searchedFriendsText]);

  return (
    <div id="friends-container" className="container">
      <div className="row">
        <input
          id="friend-add-search-text"
          type="text"
          className="form-control my-3"
          placeholder="Search a friend by user Handle to add..."
          onChange={(e) => {
            setSearchedFriendsText(e.target.value);
          }}
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
              <tbody id="friends-search-body">
                {searchedFriends
                  ? searchedFriends.map((friend, index) => {
                      return (
                        <tr key={friend.username}>
                          <th scope="row">{index + 1}</th>
                          <td>{friend.firstName + " " + friend.lastName}</td>
                          <td>{friend.email}</td>
                          <td>@{friend.username}</td>
                          <td>
                            <button
                              className="btn btn-success"
                              onClick={() => {
                                setAddFriend(friend);
                              }}
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  : ""}
              </tbody>
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
                    ? Object.keys(friends).map((friendUserName, index) => {
                        const friend = friends[friendUserName];
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
                                  setRemoveFriend(friend);
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
