import React from 'react';
import Footer from '../Common/Footer/Footer';
import Header from '../Common/Header/Header';
import SignUpPage from './SignUpPage/SignUpPage';
const SignUp = (props) =>{
    return(
		<>
			<Header/>
			<SignUpPage signUp={props.signUp}/>
			<Footer/>
	   </>
    )
}
export default SignUp;