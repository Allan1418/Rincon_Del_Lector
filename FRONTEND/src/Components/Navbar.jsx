"use client"

import { useState, useRef, useEffect, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthContext } from "./Context/AuthContext"
import { handleLogout } from "../services/ProfileService"
import { getLibros } from "../services/ProfileService"
import {
  FaShoppingCart,
  FaSearch,
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
  const { isAuthenticated, logout, userData, isLoading } = useContext(AuthContext)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)

  // Estados para las sugerencias de búsqueda
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Función debounce para búsquedas
  const debounce = (func, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  // Efecto para obtener sugerencias
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim()) {
        setIsSearching(true)
        try {
          const response = await getLibros(null, null, null, null, null, null, searchQuery)
          setSearchSuggestions(response.results)
          setShowSuggestions(true)
        } catch (error) {
          console.error("Error fetching suggestions:", error)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchSuggestions([])
        setShowSuggestions(false)
      }
    }

    const debouncedFetch = debounce(fetchSuggestions, 300)
    debouncedFetch()

    return () => debouncedFetch.cancel?.()
  }, [searchQuery])

  // Manejar clics fuera de los menús
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

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

  const goToProfile = () => {
    navigate(`/user/${userData?.username}`)
    setIsMenuOpen(false)
  }

  const handleEditProfileClick = () => {
    navigate(`/user/${userData?.username}/changed`)
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

  const handleSearch = () => {
    const queryParam = searchQuery.trim() ? searchQuery : ""
    navigate(`/search/?q=${encodeURIComponent(queryParam)}&page=1&tab=books`)
    setSearchQuery("")
    setShowSuggestions(false)
    setIsMobileSearchOpen(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  if (isLoading) {
    return
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
            <Link to="/FAQ" className={styles.menuItem}>
              <FaQuestionCircle className={styles.menuIcon} />
              <span>Ayuda</span>
            </Link>

            <Link to="/explorar" className={styles.menuItem}>
              <FaCompass className={styles.menuIcon} />
              <span>Explorar</span>
            </Link>
            {isAuthenticated && (
              <Link to={`/user/${userData?.username}`} className={styles.menuItem}>
                <FaBook className={styles.menuIcon} />
                <span>Mi libreria</span>
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/cart" className={styles.menuItem}>
                <FaShoppingCart className={styles.menuIcon} />
                <span>Mi carrito</span>
              </Link>
            )}
          </div>

          <div className={styles.navbarActions}>
            <div className={styles.searchContainer} ref={searchRef}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Buscar libros ..."
                className={styles.searchInput}
                onKeyPress={handleKeyPress}
              />

              {showSuggestions && searchQuery && (
                <div className={styles.suggestionsDropdown}>
                  {isSearching ? (
                    <div className={styles.suggestionItem}>
                      <div className={styles.searchingIndicator}>
                        <div className={styles.searchingDot}></div>
                        <div className={styles.searchingDot}></div>
                        <div className={styles.searchingDot}></div>
                      </div>
                      <span>Buscando...</span>
                    </div>
                  ) : searchSuggestions.length > 0 ? (
                    searchSuggestions.map((book) => (
                      <Link
                        key={book.id}
                        to={`/libros/${book.id}`}
                        className={styles.suggestionItem}
                        onClick={() => {
                          setShowSuggestions(false)
                          setSearchQuery("")
                        }}
                      >
                        <div className={styles.suggestionContent}>
                          <div className={styles.suggestionTitle}>{book.title}</div>
                          <div className={styles.suggestionAuthor}>por {book.owner.username}</div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className={styles.suggestionItem}>
                      <div className={styles.emptyResults}>
                        <FaSearch className={styles.emptyResultsIcon} />
                        <span>No se encontraron resultados</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

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

            {!isAuthenticated ? (
              <Link to="/authForm" className={styles.authLink}>
                <button className={styles.registerButton}>Registrarse</button>
              </Link>
            ) : (
              <div className={styles.userMenuContainer} ref={dropdownRef}>
                <button
                  className={`${styles.userButton} ${isMenuOpen ? styles.userButtonActive : ""}`}
                  onClick={toggleMenu}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                >
                  <div className={styles.userAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>
                  <span className={styles.username}>{userData?.username}</span>
                  <FaChevronDown className={`${styles.chevronIcon} ${isMenuOpen ? styles.chevronUp : ""}`} />
                </button>

                {isMenuOpen && (
                  <div className={styles.menuDropdown}>
                    <div className={styles.menuHeader}>
                      <div className={styles.menuAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>
                      <div className={styles.menuUserInfo}>
                        <span className={styles.menuUsername}>{userData?.username}</span>
                      </div>
                    </div>

                    <div className={styles.menuDropdownSeparator} />

                    <div className={styles.menuDropdownScroll}>
                      <button className={styles.menuDropdownItem} onClick={goToProfile}>
                        <div className={styles.menuItemIcon}>
                          <FaUser />
                        </div>
                        <div className={styles.menuItemContent}>
                          <span className={styles.menuItemTitle}>Mi perfil</span>
                          <span className={styles.menuItemDescription}>Ver tu perfil público</span>
                        </div>
                      </button>

                      <button className={styles.menuDropdownItem} onClick={handleEditProfileClick}>
                        <div className={styles.menuItemIcon}>
                          <FaEdit />
                        </div>
                        <div className={styles.menuItemContent}>
                          <span className={styles.menuItemTitle}>Editar perfil</span>
                          <span className={styles.menuItemDescription}>Actualiza tu información</span>
                        </div>
                      </button>

                      <button className={styles.menuDropdownItem} onClick={handleGananciasClick}>
                        <div className={styles.menuItemIcon}>
                          <FaRegMoneyBillAlt />
                        </div>
                        <div className={styles.menuItemContent}>
                          <span className={styles.menuItemTitle}>Mis ganancias</span>
                          <span className={styles.menuItemDescription}>Administra tus ingresos</span>
                        </div>
                      </button>

                      <button className={styles.menuDropdownItem} onClick={handleComprasClick}>
                        <div className={styles.menuItemIcon}>
                          <FaHistory />
                        </div>
                        <div className={styles.menuItemContent}>
                          <span className={styles.menuItemTitle}>Historial Compras</span>
                          <span className={styles.menuItemDescription}>Revisa tus compras anteriores</span>
                        </div>
                      </button>
                    </div>

                    <div className={styles.menuDropdownSeparator} />

                    <button className={styles.menuDropdownItemLogout} onClick={handleLogoutClick}>
                      <div className={styles.menuItemIcon}>
                        <FaSignOutAlt />
                      </div>
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
