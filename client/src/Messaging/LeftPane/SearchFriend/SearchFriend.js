import React from "react";
const SearchFriend = ({ setSearchedFriendText }) => {
  const changeSearchFriendPrefix = (e) => {
    if (e.target.value && e.target.value.length > 0) {
      setSearchedFriendText(e.target.value);
    }
  };

  return (
    <div className="card p-3">
      <input
        onChange={changeSearchFriendPrefix}
        id="friend-search"
        type="text"
        className="form-control p-1 px-3 rounded-pill"
        placeholder="Enter friend name to search..."
      ></input>
    </div>
  );
};
export default SearchFriend;
