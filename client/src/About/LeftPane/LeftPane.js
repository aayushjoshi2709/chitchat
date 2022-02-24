import React from 'react'
import { Link } from 'react-router-dom';
const LeftPane = () => {
    return (
        <div className="col-md-4 h-100 py-5 d-flex justify-content-center">
            <div className=" mx-auto text-center">
                <div className="img-thumbnail rounded">
                    <img className="img-fluid rounded" src="<%=user.image?'.\\'+user.image:'https://winaero.com/blog/wp-content/uploads/2019/11/Photos-new-icon.png'%>" />
                </div>
                <h1 className="display-5 text-center mt-2">User Full Name</h1>
                <p className="display-5 text-center mt-2" style={{fontSize: "larger"}}>username</p>
                <div className="mt-2">
                    <Link className="btn btn-success btn-lg" to="/">Logout</Link>
                    <Link to="/messaging" className="btn btn-danger btn-lg">Close</Link>
                </div>
            </div>
        </div>
    )
}
export default LeftPane;