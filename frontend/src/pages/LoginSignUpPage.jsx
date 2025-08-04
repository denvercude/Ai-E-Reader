import { useState } from "react";
import "../styles/LoginSignUp.css";

export default function LoginSignUpPage() {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);


    const toggleMode = () => {
        if (isAnimating) return;

        setIsAnimating(true);

        setTimeout(() => {
            setIsLoginMode(!isLoginMode);
            setIsAnimating(false);
        }, 250);
    };


    return (
        <div className="login-signup-page">
            <div className="card-slot">
                <div className="card-pocket">
                    <div className={`login-card ${isAnimating ? 'sliding-out' : ''}`}>
                        <div className="card-header">
                            <div className="accession-number">Acc no. 001</div>
                            <div className="classification">L001.1</div>
                        </div>
                        <div className="card-title">
                            <div className="sub-title">Login</div>
                        </div>
                        <div className="card-content">
                            <div className="login-form">
                                <input type="email" placeholder="Username or Email" />
                                <input type="password" placeholder="Password" />
                                <button className="login-button" type="submit">Login</button>
                            </div>
                        </div>
                        <div className="card-footer">
                            <span className="footer-text">Need an account?</span>
                            <button className="signup-toggle" onClick={toggleMode}>Sign Up</button>
                        </div>
                    </div>
                    <div className={`signup-card ${isAnimating ? 'sliding-out' : !isLoginMode ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="accession-number">Acc no. 002</div>
                            <div className="classification">S001.1</div>
                        </div>
                        <div className="card-title">
                            <div className="sub-title">Sign Up</div>
                        </div>
                        <div className="card-content">
                            <div className="signup-form">
                                <input type="text" placeholder="Username" />
                                <input type="email" placeholder="Email" />
                                <input type="password" placeholder="Password" />
                                <input type="password" placeholder="Confirm Password" />
                                <button className="signup-button" type="submit">Sign Up</button>
                            </div>
                        </div>
                        <div className="card-footer">
                            <span className="footer-text">Already have an account?</span>
                            <button className="login-toggle" onClick={toggleMode}>Login</button>
                        </div>
                    </div>
                    <div className="pocket-front">
                        <div className="title-text">SIDE-PAGE</div>
                    </div>
                </div>
            </div>
        </div>
    )
}