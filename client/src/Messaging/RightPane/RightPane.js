import React from 'react'
import Header from './Header/Header'
import SendMessage from './SendMessage/SendMessage'
import Messages from './Messages/Messages'
import '../Styles/messaging.css'
const RightPane = () => {
  return (
    <div id="right-pane" className="panels col-md-8 p-0 m-0">	
        <Header/>
        <Messages/>
        <SendMessage/>
    </div>
  )
}
export default RightPane 