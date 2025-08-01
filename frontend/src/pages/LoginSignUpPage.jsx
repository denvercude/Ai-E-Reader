import { useState } from "react";
import "../styles/LoginSignUp.css";

function LoginSignUpPage() {
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
        <div className="login-signup-container">
            <div className="library-card-slot">
                <div className="card-pocket">
                    <div className={`login-card ${isAnimating ? 'sliding-out' : ''}`}>
                        <div className="card-header">
                            <div className="accession-number">Acc no 001</div>
                            <div className="classification">L001.1</div>
                        </div>
                        <div className="card-title">
                            <div className="book-title">SIDE-PAGE</div>
                            <div className="subtitle">LOGIN</div>
                        </div>
                        <div className="card-content">
                            <div className="login-form">
                                <input type="email" placeholder="Email" className="form-input" />
                                <input type="password" placeholder="Password" className="form-input" />
                                <button className="login-button">Login</button>
                            </div>
                        </div>
                        <div className="card-footer">
                            <span>Need an account?</span>
                            <button className="signup-toggle" onClick={toggleMode}>Signup</button>
                        </div>
                    </div>
                    
                    <div className={`signup-card ${isAnimating ? 'sliding-out' : !isLoginMode ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="accession-number">Acc no 002</div>
                            <div className="classification">S001.1</div>
                        </div>
                        <div className="card-title">
                            <div className="book-title">SIDE-PAGE</div>
                            <div className="subtitle">SIGNUP</div>
                        </div>
                        <div className="card-content">
                            <div className="signup-form">
                                <input type="text" placeholder="Full Name" className="form-input" />
                                <input type="email" placeholder="Email" className="form-input" />
                                <input type="password" placeholder="Password" className="form-input" />
                                <input type="password" placeholder="Confirm Password" className="form-input" />
                                <button className="signup-button">Sign Up</button>
                            </div>
                        </div>
                        <div className="card-footer">
                            <span>Already have an account? </span>
                            <button className="login-toggle" onClick={toggleMode}>Login</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginSignUpPage;