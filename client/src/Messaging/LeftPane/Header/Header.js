import React from 'react'
import '../../Styles/messaging.css'
import { Link } from 'react-router-dom'
const Header = ()=> {
  return (
	<Link to="/about">
		<div className="card p-2 header">
			<img src="https://winaero.com/blog/wp-content/uploads/2019/11/Photos-new-icon.png" className="rounded-circle" width="42px" height="42px"></img>
		</div>
	</Link>
  )
}

export default Header