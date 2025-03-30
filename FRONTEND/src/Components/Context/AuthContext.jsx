import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("Authorization");
        if (storedToken) {
            setIsAuthenticated(true);
            setToken(storedToken);
        }
    }, []);

    const login = (newToken, loggedInUsername) => {
      localStorage.setItem("Authorization", newToken);
      setToken(newToken);
      setUsername(loggedInUsername);
      setIsAuthenticated(true);
      console.log("Logged in username:", loggedInUsername);
  };

    const logout = async () => {
        try {
            if (token) await handleLogout(token);
        } catch (error) {
            console.error("Error en logout:", error);
        } finally {
            localStorage.removeItem("Authorization");
            setIsAuthenticated(false);
            setUsername(null);
            setToken(null);
        }
    };

    const showLoading = () => setIsLoading(true);
    const hideLoading = () => setIsLoading(false);

    const contextValue = {
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,
        token,
        isLoading,
        showLoading,
        hideLoading,
        username,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);
