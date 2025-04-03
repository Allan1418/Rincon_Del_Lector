"use client"

import { useState, useRef, useEffect, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthContext } from "./Context/AuthContext"
import { handleLogout } from "../services/ProfileService"
import { useUserData } from "./Hooks/useUserData"
import {
  FaShoppingCart,
  FaSearch,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaUser,
  FaQuestionCircle,
  FaSignOutAlt,
  FaEdit,
  FaRegMoneyBillAlt,
  FaHistory,
  FaBook,
  FaCompass,
} from "react-icons/fa"
import styles from "./Navbar.module.css"

function Navbar() {
  // Hooks and state
  const { profileData } = useUserData()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const { isAuthenticated, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef(null)

  // Handle clicks outside the dropdown menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Toggle user menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Handle logout
  const handleLogoutClick = async () => {
    try {
      await handleLogout()
      logout()
      navigate("/")
      window.location.reload()
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
      alert("Error al cerrar sesión")
    }
    setIsMenuOpen(false)
  }

  // Navigation functions
  const goToProfile = () => {
    navigate(`/user/${profileData.username}`)
    setIsMenuOpen(false)
  }

  const handleEditProfileClick = () => {
    navigate(`/user/${profileData.username}/changed`)
    setIsMenuOpen(false)
  }

  const handleGananciasClick = () => {
    navigate(`/ganancias`)
    setIsMenuOpen(false)
  }

  const handleComprasClick = () => {
    navigate(`/historial`)
    setIsMenuOpen(false)
  }

  // Search function
  const handleSearch = () => {
    const queryParam = searchQuery.trim() ? searchQuery : ""
    navigate(`/search/?q=${encodeURIComponent(queryParam)}&page=1&tab=books`)
    setSearchQuery("")
    setIsMobileSearchOpen(false)
  }

  // Handle key press for search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className={styles.navbarContainer}>
      <div className={styles.navbarWrapper}>
        <nav className={styles.navbar}>
          <Link to="/" className={styles.navbarLogo}>
            <div className={styles.logoIcon}>
              <FaBook />
            </div>
            <span>Rincon Del Lector</span>
          </Link>

          <div className={styles.navbarMenu}>
            <Link to="/explorar" className={styles.menuItem}>
              <FaCompass className={styles.menuIcon} />
              <span>Explorar</span>
            </Link>
            {isAuthenticated && (
              <Link to={`/user/${profileData.username}`} className={styles.menuItem}>
                <FaBook className={styles.menuIcon} />
                <span>Mi libreria</span>
              </Link>
            )}
          </div>

          <div className={styles.navbarActions}>
            <div className={styles.searchContainer}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar libros, autores..."
                className={styles.searchInput}
                onKeyPress={handleKeyPress}
              />
              <button className={styles.searchButton} onClick={handleSearch} aria-label="Buscar">
                <FaSearch />
              </button>
            </div>

            <button
              className={styles.mobileSearchButton}
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Abrir búsqueda"
            >
              <FaSearch />
            </button>

            {isAuthenticated && (
              <Link to="/cart" className={styles.cartLink} aria-label="Carrito">
                <FaShoppingCart />
              </Link>
            )}

            {!isAuthenticated ? (
              <Link to="/authForm" className={styles.authLink}>
                <button className={styles.registerButton}>Registrarse</button>
              </Link>
            ) : (
              <div className={styles.userMenuContainer} ref={dropdownRef}>
                <button
                  className={styles.userButton}
                  onClick={toggleMenu}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                >
                  <span className={styles.username}>{profileData.username}</span>
                  <FaChevronDown className={isMenuOpen ? styles.chevronUp : ""} />
                </button>

                {isMenuOpen && (
                  <div className={styles.menuDropdown}>
                    <div className={styles.menuHeader}>
                      <div className={styles.menuAvatar}>{profileData.username.charAt(0).toUpperCase()}</div>
                      <div className={styles.menuUserInfo}>
                        <span className={styles.menuUsername}>{profileData.username}</span>
                        <span className={styles.menuUserRole}>Lector</span>
                      </div>
                    </div>

                    <div className={styles.menuDropdownSeparator} />

                    <button className={styles.menuDropdownItem} onClick={goToProfile}>
                      <FaUser />
                      <span>Mi perfil</span>
                    </button>
                    <button className={styles.menuDropdownItem} onClick={handleEditProfileClick}>
                      <FaEdit />
                      <span>Editar perfil</span>
                    </button>
                    <button className={styles.menuDropdownItem} onClick={handleGananciasClick}>
                      <FaRegMoneyBillAlt />
                      <span>Mis ganancias</span>
                    </button>
                    <button className={styles.menuDropdownItem} onClick={handleComprasClick}>
                      <FaHistory />
                      <span>Historial Compras</span>
                    </button>
                    <button className={styles.menuDropdownItem}>
                      <FaQuestionCircle />
                      <span>Ayuda</span>
                    </button>

                    <div className={styles.menuDropdownSeparator} />

                    <button className={styles.menuDropdownItemLogout} onClick={handleLogoutClick}>
                      <FaSignOutAlt />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Navbar

