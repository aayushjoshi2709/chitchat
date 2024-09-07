import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

function LoginPage({ setJWTToken }) {
  let navigate = useNavigate();

  // login to the app
  const login = async (event) => {
    event.preventDefault();
    let uname = event.target[0].value;
    let pass = event.target[1].value;
    axios
      .post("/auth/login", {
        username: uname,
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
        console.log(error.response);
        toast.error(error.response.data.message);
      });
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center rounded"
      style={{ flex: 1 }}
    >
      <div className="col-sm-10 col-md-6" style={{ margin: "30px auto" }}>
        <Toaster position="bottom-center" reverseOrder={false} />
        <div
          className="p-4 card"
          style={{ backgroundColor: "rgba(225,225,225,0.6)" }}
        >
          <form
            onSubmit={(e) => {
              login(e);
            }}
          >
            <h1
              className="display-1 m-2"
              style={{ textAlign: "center", fontWeight: "bolder" }}
            >
              Login
            </h1>
            <div className="form-group m-2 mt-4">
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
            <hr />
            <div className="text-center">
              <button
                type="submit"
                className="btn-lg btn-success btn-block mt-2"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
