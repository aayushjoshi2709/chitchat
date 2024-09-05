import React from "react";
import Footer from "../Common/Footer/Footer";
import Header from "../Common/Header/Header";
import SignUpPage from "./SignUpPage/SignUpPage";
const SignUp = ({ setJWTToken }) => {
  return (
    <div
      className="d-flex flex-column"
      style={{
        height: "100vh",
      }}
    >
      <Header />
      <SignUpPage setJWTToken={setJWTToken} />
      <Footer />
    </div>
  );
};
export default SignUp;
