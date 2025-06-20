import "../styles/LandingPage.css"
import { Link } from 'react-router-dom'
import logo from "../assets/LandingPageLogo.png";


function LandingPage(){
    return (
        <div className="container">
            <div className="left-container">
                <h1>SidePage</h1>
                <p>Your intelligent reading companion.</p>
            </div>
            <div className="right-container">
                <div className="nav-bar">
                    <a href="#">Home</a>
                    <a href="#">About</a>
                    <a href="#">Sign Up</a>
                    <Link to="/library">Log In</Link>
                </div>
                <img src={logo} alt="Logo" />
            </div>
        </div>
    );
}

export default LandingPage;