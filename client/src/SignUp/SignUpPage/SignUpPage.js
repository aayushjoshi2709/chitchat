import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
const SignUpPage = ({ setJWTToken }) => {
  let navigate = useNavigate();
  const signUp = async (event) => {
    event.preventDefault();
    const fname = event.target[0].value;
    const lname = event.target[1].value;
    const email = event.target[2].value;
    const username = event.target[3].value;
    const pass = event.target[4].value;
    axios
      .post("/auth/register", {
        firstName: fname,
        lastName: lname,
        email: email,
        username: username,
        password: pass,
      })
      .then((response) => {
        if (response.status === 200) {
          const token = response.data.token;
          if (token) {
            toast.success(response.data.message);
            localStorage.setItem("token", token);
            setJWTToken(token);
            navigate("/messaging");
          }
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
    return false;
  };
  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ flex: 1 }}
    >
      <div className="col-sm-10 col-md-6" style={{ margin: "30px auto" }}>
        <Toaster position="bottom-center" reverseOrder={false} />
        <div
          className="p-4 card rounded"
          style={{ backgroundColor: "rgba(225,225,225,0.6)" }}
        >
          <form
            onSubmit={(e) => {
              signUp(e);
            }}
          >
            <h1
              className="display-1 m-2"
              style={{ textAlign: "center", fontWeight: "bolder" }}
            >
              Sign Up
            </h1>
            <div className="form-group m-2 mt-4">
              <input
                type="text"
                className="form-control"
                placeholder="First Name"
                required
                name="firstName"
              ></input>
            </div>
            <div className="form- m-2">
              <input
                type="text"
                className="form-control"
                placeholder="Last Name"
                required
                name="lastName"
              ></input>
            </div>
            <div className="form-group m-2">
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                required
                name="email"
              ></input>
            </div>
            <div className="form-group m-2">
              <input
                type="text"
                className="form-control"
                placeholder="username"
                required
                name="username"
              ></input>
            </div>
            <div className="form-group m-2">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                required
                name="password"
              ></input>
            </div>
            <div className="form-group m-2">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                required
              ></input>
            </div>
            <hr />
            <div className="text-center">
              <button
                type="submit"
                className="mt-2 btn-lg btn-success btn-block"
              >
                Signup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
