import React, { useState, useRef, useEffect } from 'react';
import styles from './Navbar.module.css';
import { FaShoppingCart, FaSearch } from 'react-icons/fa';

function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <a href="/" className={styles.navbarLogo}>Rincon Del Lector</a>

        <div className={styles.navbarMenu}>
          <button className={styles.menuItem}>Biblioteca</button>
          <a href='/User/name'><button className={styles.menuItem}>Mi perfil </button></a>
        </div>

        <div className={styles.navbarAuth}>
          <a href='/AuthForm'><button className={styles.registerButton}>Registrarse </button></a>
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
            <a className={styles.carrito} href='/MyCart' ><FaShoppingCart /></a>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;