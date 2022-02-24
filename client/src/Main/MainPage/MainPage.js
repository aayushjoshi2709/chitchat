import React from "react";
import {Link} from "react-router-dom";
const MainPage = ()=>{
    return(
    <>
        <div className="container-fluid"> 
        <div className="container" id="landing-header">
            <h1 className="display-1" id="header">Chit - Chat</h1>
            <p className="lead" id="header-li">A chatting app for all...</p>
            <Link to="/register" className="btn btn-light btn-lg">Sign Up</Link>
        </div> 
        </div>
    </>)
}
export default MainPage;