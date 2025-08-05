const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? `http://localhost:${import.meta.env.VITE_API_URL}`
    : 'http://localhost:5000';

// Signup API call
export const signupUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: userData.username,
                email: userData.email,
                password: userData.password
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }
        
        return data;
    } catch (error) {
        throw new Error(`Signup request failed: ${error.message}`);
    }
};

// Login API call
export const loginUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userData.email,
                password: userData.password
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        return data;
    } catch (error) {
        throw new Error(`Login request failed: ${error.message}`);
    }
};