import React from 'react'
import Footer from '../Common/Footer/Footer';
import Header from '../Common/Header/Header';
import LoginPage from './LoginPage/LoginPage';
function Login(props) {
  return (
    <>
        <Header/>
        <LoginPage login={props.login}/>
        <Footer/>
    </>
  )
}

export default Login