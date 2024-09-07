import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
const LeftPane = ({ setUser, user, logOut, JWTToken, axios }) => {
  const [updatedImage, setUpdatedImage] = useState("");
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    if (updatedImage.length > 0) {
      setUser({ ...user, image: updatedImage });
      imageRef.current.src = user.image;
    }
  }, [updatedImage]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      axios
        .post("/user/image", formData, {
          headers: {
            Authorization: `Bearer ${JWTToken}`,
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (res.status === 200) {
            toast.success(res.data.message);
            setUpdatedImage(res.data.image);
          }
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    }
  };
  return (
    <div className="col-md-4 h-100 py-5 d-flex justify-content-center">
      <Toaster />
      <div className=" mx-auto text-center">
        <div className="img-thumbnail rounded">
          <img
            ref={imageRef}
            onClick={handleImageClick}
            className="img-fluid rounded"
            src={
              user && user.image
                ? user.image
                : process.env.PUBLIC_URL + "/assets/avatar.png"
            }
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
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
