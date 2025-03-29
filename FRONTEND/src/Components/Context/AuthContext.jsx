import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      if (token) await handleLogout(token);
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('Authorization');
      localStorage.removeItem('username');
      setIsAuthenticated(false);
      setUsername(null);
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