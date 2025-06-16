import "../styles/LandingPage.css"
import logo from "../assets/LandingPageLogo.png";


function LandingPage(){
    return (
        <div class="container">
            <div class="left-container">
                <h1>SidePage</h1>
                <p>Your intelligent reading companion.</p>
            </div>
            <div class="right-container">
                <div class="nav-bar">
                    <a href="#">Home</a>
                    <a href="#">About</a>
                    <a href="#">Sign Up</a>
                    <a href="#">Log In</a>
                </div>
                <img src={logo} alt="Logo" />
            </div>
        </div>
    );
}

export default LandingPage;