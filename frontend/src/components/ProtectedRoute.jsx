import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    // If no token or invalid token, redirect to login
    if (!token || !isValidToken(token)) {
        return <Navigate to="/login-signup" replace />;
    }
    
    // If token exists, render the protected component
    return children;
};

// Helper function to validate token format/expiration
const isValidToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
    } catch {
        return false;
    }
};

export default ProtectedRoute;