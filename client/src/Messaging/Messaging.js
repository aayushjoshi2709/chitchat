import React from 'react';
import Header from './Header/Header'
import LPane from './LeftPane/LeftPane'
import RPane from './RightPane/RightPane'
import { useState,useEffect } from 'react';
import './Styles/messaging.css'
const Messaging = (props)=>{    
    const [isRightOn, setIsRightOn] = useState(false);
    const [messageData,setMessageData] = useState({});
    function getTime(str){
        let today = new Date(str);
        let hour = today.getHours() < 10 ? "0"+today.getHours():today.getHours();
        let minute = today.getMinutes() < 10 ? "0"+today.getMinutes():today.getMinutes();
        let time = hour + ":" + minute;
        return time;    
    }
    function loadMessages(id){
        setMessageData(props.messages[id]);
        setIsRightOn(true);
    }
    useEffect(() => {
        if(messageData.length >0){
            setIsRightOn(true);
        }
    }, [messageData])
    
    return(
        <>
        <div id='messages-top-container'>
            <Header/>
            <div  className="container-fluid" id="main-container">
    		    <div className="sub-container row">
                    <LPane messages={props.messages} getTime={getTime} loadMessages={loadMessages}/>
                    {
                        isRightOn?<RPane userid={props.user.id} messageData={messageData} getTime={getTime} socket={props.socket}/>:""
                    }
                </div>
            </div>
        </div>    
        </>
    )
}
export default Messaging;