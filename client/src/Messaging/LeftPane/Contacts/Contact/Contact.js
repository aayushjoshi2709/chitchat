import React from 'react'
import MessageCount from './MessageCount/MessageCount'
import '../../../Styles/messaging.css'
function Contact(props) {
  return (
    <>
        
            <div className="card p-3" onClick={()=>{
                props.loadMessages(props.id);
            }} >
                <div className="row">
                    <div className="col-1"style={{width: '42px'}} >
                        <img src="https://winaero.com/blog/wp-content/uploads/2019/11/Photos-new-icon.png" className="rounded-circle" width="42px" height="42px"></img>
                    </div>
                    <div className="col-10 ">
                        <div className="row ">
                            <div id="name" className="col-8">
                                {props.contact.name}
                            </div>
                            <div className="col-4 text-end text-muted" style={{fontSize: 'small', textAlign: 'end'}}>
                                {props.getTime(props.contact.lasttime)}
                            </div>
                        </div>
                        <div className ="row">
                            <div className="col-8 contact-last-msg text-muted" >
                                {props.contact.messages[props.contact.messages.length-1].message}
                            </div>
                            {
                                props.contact.received>0?<MessageCount count ={props.contact.received}/>:""
                            }
                        </div>
                    </div>
                </div>	
            </div>
   </>
  )
}

export default Contact