import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    
    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/login-signup" replace />;
    }
    
    // If token exists, render the protected component
    return children;
};

export default ProtectedRoute;