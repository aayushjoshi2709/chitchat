import React from 'react'
import MessageCount from './MessageCount/MessageCount'
import '../../../Styles/Messaging.css'
function Contact(props) {
  return (
    <>
        <a href="#right-pane-div" onClick={()=>{props.setIsRightOn(true)}}>
            <div className="card p-3" >
                <div className="row">
                    <div className="col-1"style={{width: '42px'}} >
                        <img src="https://winaero.com/blog/wp-content/uploads/2019/11/Photos-new-icon.png" className="rounded-circle" width="42px" height="42px"></img>
                    </div>
                    <div className="col-10 ">
                        <div className="row ">
                            <div id="name" className="col-8">
                                FirstName+" "+lastName
                            </div>
                            <div className="col-4 text-end text-muted" style={{fontSize: 'small', textAlign: 'end'}}>
                                Time
                            </div>
                        </div>
                        <div className ="row">
                            <div className="col-8 contact-last-msg text-muted" >
                                LastMessage
                            </div>
                            <MessageCount/>
                        </div>
                    </div>
                </div>	
            </div>
        </a>
   </>
  )
}

export default Contact