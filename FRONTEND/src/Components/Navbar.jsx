"use client"

import { useState, useRef, useEffect, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthContext } from "./Context/AuthContext" // Asegúrate de que la ruta es correcta
import { handleLogout } from "../services/ProfileService"
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
    // Hooks y estado
    const { isAuthenticated, logout, userData, isLoading } = useContext(AuthContext) // Obtén userData y isLoading del contexto
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")
    const dropdownRef = useRef(null)

    // Manejar clics fuera del menú desplegable
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

    // Alternar menú de usuario
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    // Manejar el cierre de sesión
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

    // Funciones de navegación
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

    // Función de búsqueda
    const handleSearch = () => {
        const queryParam = searchQuery.trim() ? searchQuery : ""
        navigate(`/search/?q=${encodeURIComponent(queryParam)}&page=1&tab=books`)
        setSearchQuery("")
        setIsMobileSearchOpen(false)
    }

    // Manejar la pulsación de teclas para la búsqueda
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    // Renderizado condicional basado en isLoading
    if (isLoading) {
        return; // O un spinner
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
                                    <span className={styles.username}>{userData?.username}</span>
                                    <FaChevronDown className={isMenuOpen ? styles.chevronUp : ""} />
                                </button>

                                {isMenuOpen && (
                                    <div className={styles.menuDropdown}>
                                        <div className={styles.menuHeader}>
                                            <div className={styles.menuAvatar}>{userData?.username?.charAt(0).toUpperCase()}</div>
                                            <div className={styles.menuUserInfo}>
                                                <span className={styles.menuUsername}>{userData?.username}</span>
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