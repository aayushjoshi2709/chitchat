import React from 'react'
import '../../Styles/messaging.css'
const SendMessage = ()=> {
  return (
    <div className="card p-2 m-0">
        <div className="row">
            <div className="footer-sent">
                <input id="sendText" type="text" className="form-control p-2 rounded-pill " placeholder="Enter the text to be sent..."></input>
                <button id="sendButton" className="btn btn-success float-right">Send</button>
            </div>
        </div>
    </div>
  )
}

export default SendMessage