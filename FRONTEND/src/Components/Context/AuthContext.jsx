import React, { createContext, useState, useEffect } from "react";
import { getUserData } from "../../services/ProfileService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("Authorization");
        if (storedToken) {
            setIsAuthenticated(true);
            setToken(storedToken);
            getUserData(storedToken)
                .then(data => {
                    setUserData(data);
                })
                .catch(error => {
                    console.error("Error al obtener datos del usuario:", error);
                });
        }
    }, []);

    const login = (newToken, loggedInUsername) => {
        localStorage.setItem("Authorization", newToken);
        setToken(newToken);
        setUsername(loggedInUsername);
        setIsAuthenticated(true);
        getUserData(newToken)
            .then(data => {
                setUserData(data);
            })
            .catch(error => {
                console.error("Error al obtener datos del usuario:", error);
            });
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
            setUserData(null);
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
        userData,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);