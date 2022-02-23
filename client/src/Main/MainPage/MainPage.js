import React from "react";
const MainPage = ()=>{
    return(
    <>
        <div className="container-fluid"> 
        <div className="container" id="landing-header">
            <h1 className="display-1" id="header">Chit - Chat</h1>
            <p className="lead" id="header-li">A chatting app for all...</p>
            <a href="/user/new" className="btn btn-light btn-lg">Sign Up</a>
        </div> 
        </div>
    </>)
}
export default MainPage;