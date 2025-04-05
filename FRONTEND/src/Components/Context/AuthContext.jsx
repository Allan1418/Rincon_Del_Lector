import React, { createContext, useState, useEffect } from "react";
import { getUserData, handleLogout } from "../../services/ProfileService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Inicializamos en true
    const [username, setUsername] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("Authorization");
        if (storedToken) {
            setToken(storedToken);
            loadUserData(storedToken);
        } else {
          setIsLoading(false);
        }
    }, []);

    const loadUserData = (token) => {
      setIsLoading(true);
      getUserData(token)
          .then(data => {
              setUserData(data);
              setIsAuthenticated(true);
          })
          .catch(error => {
              console.error("Error al obtener datos del usuario:", error);
              setIsAuthenticated(false);
          })
          .finally(()=>{
            setIsLoading(false);
          })
    }

    const login = (newToken, loggedInUsername) => {
        localStorage.setItem("Authorization", newToken);
        setToken(newToken);
        setUsername(loggedInUsername);
        loadUserData(newToken);
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            if (token) await handleLogout(token);
        } catch (error) {
            console.error("Error en logout:", error);
        } finally {
            localStorage.removeItem("Authorization");
            setIsAuthenticated(false);
            setUsername(null);
            setToken(null);
            setUserData(null);
            setIsLoading(false);
        }
    };

    const contextValue = {
        isAuthenticated,
        login,
        logout,
        token,
        isLoading,
        username,
        userData,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);