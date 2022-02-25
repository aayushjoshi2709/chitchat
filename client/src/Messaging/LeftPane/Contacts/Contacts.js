import React from 'react'
import '../../Styles/messaging.css'
import Contact from './Contact/Contact'
function Contacts(props) {
  
  return (
    <div id='contacts'>
      {
        Object.keys(props.messages).map(function(index) {
          return <Contact getTime={props.getTime} key={index} id={index} contact={props.messages[index]} loadMessages={props.loadMessages} />
        })
      }
   </div>
  )
}
export default Contacts