import React from 'react';
import '../../Styles/messaging.css'
import SentMessage from './SentMessage/SentMessage';
import ReceivedMessage from './ReceivedMessage/ReceivedMessage';
const Messages = (props) =>{
    
    return(
        <div id="messages" className="p-1 display-flex">
            {
                props.messageData.map(function(message){
                    return message.from == props.userid?<SentMessage key={message.id} message={message} getTime={props.getTime}/>:<ReceivedMessage key={message.id} message={message} getTime={props.getTime} socket={props.socket}/>
                })
            }
        </div>
    )
}
export default Messages;