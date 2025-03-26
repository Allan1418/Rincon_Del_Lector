import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';
import { AuthContext } from './Context/AuthContext';
import { handleLogout } from '../services/ProfileService';
import { useUserData } from './Hooks/useUserData';

function Navbar() {
  const { profileData } = useUserData();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      logout();
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      alert('Error al cerrar sesión');
    }
    setIsMenuOpen(false);
  };

  const goToProfile = () => {
    navigate(`/user/${profileData.username}`);
    setIsMenuOpen(false);
  };

  const handleEditProfileClick = () => {
    navigate(`/user/${profileData.username}/changed`)
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <a href="/" className={styles.navbarLogo}>Rincon Del Lector </a>

        <div className={styles.navbarMenu}>
          <button className={styles.menuItem}>Biblioteca</button>
          <button className={styles.menuItem}>Explorar libreria</button>
        </div>
        <div className={styles.navbarAuth}>
          <div className={styles.navbarSearch}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar..."
              className={styles.searchInput}
            />
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
            <div className={styles.userMenu}>
              <button className={styles.userButton} onClick={toggleMenu}>
                {profileData.username}
              </button>
              {isMenuOpen && (
                <div className={styles.menuDropdown}>
                  <button className={styles.menuDropdownItem} onClick={goToProfile}>Mi perfil</button>
                  <button className={styles.menuDropdownItem} onClick={handleEditProfileClick}>Editar perfil </button>
                  <button className={styles.menuDropdownItem}>Ayuda</button>
                  <button className={styles.menuDropdownItem} onClick={handleLogoutClick}>Cerrar sesión</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;