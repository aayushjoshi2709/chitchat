import React from 'react'
import Header from './Header/Header'
import SendMessage from './SendMessage/SendMessage'
import Messages from './Messages/Messages'
import '../Styles/messaging.css'
const RightPane = (props) => {
  console.log(props.userid)
  console.log(props.messageData)
  return (
    <div id="right-pane" className="panels col-md-8 p-0 m-0">	
        <Header name={props.messageData.name}/>
        <Messages socket={props.socket} userid={props.userid} messageData={props.messageData.messages} getTime={props.getTime}/>
        <SendMessage/>
    </div>
  )
}
export default RightPane 