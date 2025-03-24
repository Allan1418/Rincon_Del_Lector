import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';
import { AuthContext } from './Context/AuthContext';
import { handleLogout } from '../services/ProfileService';
import { useUserData } from './Hooks/useUserData';

function Navbar() {
  const { profileData, isLoading, error } = useUserData(); // Usa el hook
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      logout();
      alert('Logout exitoso');
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      alert('Error al cerrar sesión');
    }
  };

  const goToProfile = () => {
    navigate(`/${profileData.username}`);
  }

  return (
    <div className={styles.navbarContainer}>
      {/* Resto del código del Navbar, usando profileData */}
      <nav className={styles.navbar}>
        <a href="/" className={styles.navbarLogo}>Rincon Del Lector </a>

        <div className={styles.navbarMenu}>
          <button className={styles.menuItem}>Biblioteca</button>
          <button className={styles.menuItem}>Explorar libreria</button>
          {isAuthenticated && (
            <button className={styles.menuItem} onClick={goToProfile}>Mi perfil</button>
          )}
          </div>
          <div className={styles.navbarAuth}>
            <div className={styles.navbarSearch}>
              {isSearchOpen && (
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar..."
                  className={styles.searchInput}
                />
              )}
              <button className={styles.searchButton} onClick={toggleSearch}>
                <FaSearch />
              </button>
            </div>
  
            {!isAuthenticated && (
              <a href='/AuthForm'><button className={styles.registerButton}>Registrarse </button></a>
            )}
            {isAuthenticated && (
              <a className={styles.carrito} href='/MyCart' ><FaShoppingCart /></a>
            )}
  
            {isAuthenticated && (
              <button className={styles.registerButton} onClick={handleLogoutClick}>Cerrar sesión</button>
            )}
  
          </div>
        </nav>
      </div>
    );
  }
  
  export default Navbar;