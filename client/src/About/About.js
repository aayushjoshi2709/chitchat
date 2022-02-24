import React from 'react'
import RightPane from './RightPane/RightPane'
import LeftPane from './LeftPane/LeftPane'
import './Styles/about.css'
function About() {
    return (
        <>
            <div className="p-4 header">
            </div>
            <div id="about-main-container" className="container-fluid" style={{ backgroundColor: "white" }}>

                <div className="row about-container-row">
                    <LeftPane/>
                    <RightPane/>
                </div>
            </div>
        </>
    )
}

export default About