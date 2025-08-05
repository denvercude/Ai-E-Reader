import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    // If no token or invalid token, redirect to login
    if (!token || !isValidToken(token)) {
        return <Navigate to="/login-signup" replace />;
    }
    
    return children;
};

// Helper function to validate token format/expiration
const isValidToken = (token) => {
    try {
        // For JWT tokens, decode and check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
    } catch {
        // If token is not a valid JWT or any other error, consider it invalid
        return false;
    }
};

export default ProtectedRoute;