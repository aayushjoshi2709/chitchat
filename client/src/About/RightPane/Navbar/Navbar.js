import React from 'react'

function Navbar(props) {
    return (
        <div className="row">
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <a onClick={()=>{props.setDetails(true)}} id="details-container-trigger" className="nav-link active" aria-current="page" href="#">Details</a>
                </li>
                <li className="nav-item">
                    <a onClick={()=>{props.setDetails(false)}} id="friends-container-trigger" className="nav-link" href="#">Friends</a>
                </li>
            </ul>
        </div>
    )
}

export default Navbar