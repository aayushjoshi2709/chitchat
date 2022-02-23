import React from 'react';
import Header from './Header/Header'
import LPane from './LeftPane/LeftPane'
import RPane from './RightPane/RightPane'
import './Styles/messaging.css'
const Messaging = (props)=>{    

    return(
        <>
        <div id='messages-top-container'>
            <Header/>
            <div  className="container-fluid" id="main-container">
    		    <div className="sub-container row">
                    <LPane setIsRightOn = {props.setIsRightOn}/>
                    {
                        props.isRightOn?<RPane />:""
                    }
                </div>
            </div>
        </div>    
        </>
    )
}
export default Messaging;