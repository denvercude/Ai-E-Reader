import { useState } from "react";
import "../styles/LoginSignUp.css";
import { signupUser, loginUser } from '../services/api.js';

export default function LoginSignUpPage() {
    // Animation state variables
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    // Form submission state variables
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }

    const validateSignupForm = () => {
        const newErrors = {};
        
        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (formData.username.length > 20) {
            newErrors.username = 'Username must be less than 20 characters';
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        // Only set errors if validation fails
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }
        
        // Clear any existing errors if validation passes
        setErrors({});
        return true;
    };
    
    const validateLoginForm = () => {
        const newErrors = {};
        
        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }
        
        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        
        // Only set errors if validation fails
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }
        
        // Clear any existing errors if validation passes
        setErrors({});
        return true;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        
        // Clear previous messages
        setMessage('');
        
        // Validate form
        if (!validateSignupForm()) {
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await signupUser({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            setMessage('Account created successfully! Please log in.');
            // Clear form data
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
            // Switch to login mode
            setIsLoginMode(true);
            
        } catch (error) {
            setMessage(error.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Clear previous messages
        setMessage('');
        
        // Validate form
        if (!validateLoginForm()) {
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await loginUser({
                email: formData.email,
                password: formData.password
            });
            
            // Store token in localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            setMessage('Login successful! Redirecting...');
            
            // Here you would typically redirect to the main app
            // For now, just show success message
            
        } catch (error) {
            setMessage(error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
            <h1>SIDE-PAGE</h1>
            <div className="card-slot">
                <div className="card-pocket">
                    <div className={`login-card ${isAnimating ? 'sliding-out' : !isLoginMode ? 'invisible' : ''}`}>
                        <div className="card-header">
                            <div className="accession-number">ACC NO. 001</div>
                            <div className="classification">L001.1</div>
                        </div>
                        <div className="card-title">
                            <div className="sub-title">Login</div>
                        </div>
                        <div className="card-content">
                        <div className="login-form">
                            <input 
                                type="email" 
                                name="email"
                                placeholder="Username or Email" 
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            
                            <input 
                                type="password" 
                                name="password"
                                placeholder="Password" 
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            
                            <button 
                                className="login-button" 
                                type="submit"
                                onClick={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                        </div>
                        <div className="card-footer">
                            <span className="footer-text">Need an account?</span>
                            <button className="signup-toggle" onClick={toggleMode}>Sign Up</button>
                        </div>
                    </div>
                    <div className={`signup-card ${isAnimating ? 'sliding-out' : !isLoginMode ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="accession-number">ACC NO. 002</div>
                            <div className="classification">S001.1</div>
                        </div>
                        <div className="card-title">
                            <div className="sub-title">Sign Up</div>
                        </div>
                        <div className="card-content">
                        <div className="signup-form">
                            <input 
                                type="text" 
                                name="username"
                                placeholder="Username" 
                                value={formData.username}
                                onChange={handleInputChange}
                            />
                            
                            <input 
                                type="email" 
                                name="email"
                                placeholder="Email" 
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            
                            <input 
                                type="password" 
                                name="password"
                                placeholder="Password" 
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            
                            <input 
                                type="password" 
                                name="confirmPassword"
                                placeholder="Confirm Password" 
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                            />
                            
                            <button 
                                className="signup-button" 
                                type="submit"
                                onClick={handleSignup}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </div>
                        </div>
                        <div className="card-footer">
                            <span className="footer-text">Already have an account?</span>
                            <button className="login-toggle" onClick={toggleMode}>Login</button>
                        </div>
                    </div>
                    <div className="pocket-front">
                        <div className="title-text">ARCHIVE-ACCESS</div>
                        {message && (
                            <div className={`message ${message.includes('success') ? 'success-message' : 'error-message'}`}>
                                {message}
                            </div>
                        )}
                        {Object.keys(errors).length > 0 && (
                            <div className="error-message">
                                {Object.values(errors)[0]}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="background-text">
                A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. 
                I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. 
                I am so happy, my dear friend, so absorbed in the exquisite sense of mere tranquil existence, that I neglect my talents. 
                I should be incapable of drawing a single stroke at the present moment; and yet I feel that I never was a greater artist than now. 
                When, while the lovely valley teems with vapour around me, and the meridian sun strikes the upper surface of the impenetrable foliage of my trees, 
                and but a few stray gleams steal into the inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, 
                a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms
                of the insects and flies, then I feel the presence of the Almighty, who formed us in his own image, and the breath of that universal love which bears and sustains us, 
                as it floats around us in an eternity of bliss; and then, my friend, when darkness overspreads my eyes, and heaven and earth seem to dwell in my soul and absorb its power, 
                like the form of a beloved mistress, then I often think with longing, Oh, would I could describe these conceptions, could impress upon paper all that is living 
                so full and warm within me, that it might be the mirror of my soul, as my soul is the mirror of the infinite God! O my friend — but it is too much for my strength — 
                I sink under the weight of the splendour of these visions!
            </div>
        </div>
    )
}