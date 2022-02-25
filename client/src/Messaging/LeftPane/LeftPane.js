import React from 'react';
import {Link} from 'react-router-dom';
import Contacts from './Contacts/Contacts';
import '../Styles/messaging.css'
import Header from './Header/Header';
import SearchFriend from './SearchFriend/SearchFriend';
const LeftPane = (props)=>{
    return(
        <>
            <div className="panels col-md-4 m-0 p-0" >
				<Header/>
				<SearchFriend/>
                <Contacts getTime={props.getTime} messages={props.messages} loadMessages={props.loadMessages} />
			</div>
        </>
    )
}
export default LeftPane;