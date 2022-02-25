import React from 'react';
import '../../Styles/messaging.css'
const Header = (props) =>{
    return(
        <div id="right-pane-div" className="card p-2 header">
            <div className="row">
                <div id="back-button" className="col-1 me-0 pe-0 pt-1">
                    <a href="#main-container"><i className="fa-solid fa-arrow-left" style={{fontSize:'xx-large',color: 'black'}}></i></a>
                </div>
                <div className="col-2" style={{width: '42px'}} >
                    {/* Image of the friend */}
                    <img src="https://winaero.com/blog/wp-content/uploads/2019/11/Photos-new-icon.png" className="rounded-circle" width="42px" height="42px"></img>                
                </div>
                <div className="col-9 ms-2 py-0" style={{color: 'white'}}>
                    <div style={{fontSize: 'small', fontWeight: 'bold'}} id="friend-name">
                        {props.name}
                    </div>
                    <div style={{fontSize:'small'}}>
                        Online
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Header;