import React from "react";
import Footer from "../Common/Footer/Footer";
import Header from "../Common/Header/Header";
import LoginPage from "./LoginPage/LoginPage";
function Login(props) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        height: "100vh",
      }}
    >
      <Header />
      <LoginPage login={props.login} />
      <Footer />
    </div>
  );
}

export default Login;
