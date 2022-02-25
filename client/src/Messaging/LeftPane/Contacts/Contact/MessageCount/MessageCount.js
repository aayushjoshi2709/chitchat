import React from 'react'

function MessageCount(props) {
  return (
    <div className="col-4 d-flex justify-content-end " style={{fontSize: "small", textAlign: "end"}}>
      <div style={{backgroundColor:"#90EE90",width:"20px",borderRadius:"50%",textAlign:"center"}}>
        {props.count}
      </div>
    </div>
  )
}

export default MessageCount