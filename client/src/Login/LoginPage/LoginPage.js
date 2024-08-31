import React from "react";
import { useNavigate } from "react-router-dom";
function LoginPage(props) {
  let navigate = useNavigate();
  function logmein(e) {
    if (props.login(e)) {
      navigate("/messaging");
    }
  }
  return (
    <div
      className="container d-flex justify-content-center align-items-center rounded"
      style={{ flex: 1 }}
    >
      <div className="col-sm-10 col-md-6" style={{ margin: "30px auto" }}>
        <div
          className="p-4 card"
          style={{ backgroundColor: "rgba(225,225,225,0.6)" }}
        >
          <form
            onSubmit={(e) => {
              logmein(e);
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
