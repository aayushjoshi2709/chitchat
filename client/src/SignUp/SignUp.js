import React from "react";
import Footer from "../Common/Footer/Footer";
import Header from "../Common/Header/Header";
import SignUpPage from "./SignUpPage/SignUpPage";
const SignUp = (props) => {
  return (
    <div
      className="d-flex flex-column"
      style={{
        height: "100vh",
      }}
    >
      <Header />
      <SignUpPage signUp={props.signUp} />
      <Footer />
    </div>
  );
};
export default SignUp;
