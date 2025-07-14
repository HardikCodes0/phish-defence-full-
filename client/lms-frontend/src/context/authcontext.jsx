import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Validate JWT token
  const isValidToken = (token) => {
    if (!token) return false;
    try {
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    console.log('🔍 AuthContext - Checking stored auth:', { 
      hasUser: !!storedUser, 
      hasToken: !!storedToken,
      isValidToken: isValidToken(storedToken)
    });
    
    if (storedUser && storedToken && isValidToken(storedToken)) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('✅ AuthContext - Restored user session:', { 
          _id: userData._id, 
          email: userData.email, 
          username: userData.username 
        });
        setUser(userData);
      } catch (error) {
        console.error('❌ AuthContext - Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('❌ AuthContext - No valid session found, clearing storage');
      // Clear invalid data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  const login = (user, token) => {
    console.log('🔐 AuthContext - Login called:', { 
      _id: user._id, 
      email: user.email, 
      username: user.username,
      hasToken: !!token 
    });
    
    if (!user || !token) {
      console.error('❌ AuthContext - Invalid login data');
      return;
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    console.log('✅ AuthContext - User logged in successfully');
  };

  const logout = () => {
    console.log('🚪 AuthContext - Logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
