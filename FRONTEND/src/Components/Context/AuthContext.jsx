import React, { createContext, useState, useEffect } from 'react';
import { handleLogout } from '../../services/ProfileService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  useEffect(() => {
    const token = localStorage.getItem('Authorization');
    const storedUsername = localStorage.getItem('username');
    if (token) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
  }, []);

  const login = (token, username) => {
    localStorage.setItem('Authorization', token);
    localStorage.setItem('username', username);
    setIsAuthenticated(true);
    setUsername(username);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('Authorization');
      await handleLogout(token);
      localStorage.removeItem('Authorization');
      localStorage.removeItem('username');
      setIsAuthenticated(false);
      setUsername(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const showLoading = () => {
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  const contextValue = {
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout,
    username,
    isLoading,
    showLoading,
    hideLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);