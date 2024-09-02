import React from "react";
const SearchFriend = () => {
  return (
    <div className="card p-3">
      <input
        id="friend-search"
        type="text"
        className="form-control p-1 px-3 rounded-pill"
        placeholder="Enter friend name to search..."
      ></input>
    </div>
  );
};
export default SearchFriend;
