import React from 'react';
import styles from './Navbar.module.css';
import { FaShoppingCart } from 'react-icons/fa';

function Navbar() {
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
          <a className={styles.carrito} href='/' ><FaShoppingCart /></a>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;