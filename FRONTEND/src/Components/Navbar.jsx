import { useState, useRef, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./Navbar.module.css"
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
} from "react-icons/fa"
import { AuthContext } from "./Context/AuthContext"
import { handleLogout } from "../services/ProfileService"
import { useUserData } from "./Hooks/useUserData"

function Navbar() {
    const { profileData } = useUserData()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
    const { isAuthenticated, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")
    const dropdownRef = useRef(null)

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
        navigate(`/user/${profileData.username}`)
        setIsMenuOpen(false)
    }

    const handleEditProfileClick = () => {
        navigate(`/user/${profileData.username}/changed`)
        setIsMenuOpen(false)
    }

    const handleSearch = () => {
        const queryParam = searchQuery.trim() ? searchQuery : "";
        navigate(`/search/?q=${encodeURIComponent(queryParam)}&page=1&tab=books`);
        setSearchQuery("");
    };

    return (
        <div className={styles.navbarContainer}>
            <div className={styles.navbarWrapper}>
                <nav className={styles.navbar}>
                    <a href="/" className={styles.navbarLogo}>
                        Rincon Del Lector
                    </a>

                    <div className={styles.navbarMenu}>
                        <button className={styles.menuItem}>Biblioteca</button>
                        <button className={styles.menuItem}>Explorar libreria</button>
                    </div>

                    <div className={styles.navbarActions}>
                        <div className={styles.searchContainer}>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar..."
                                className={styles.searchInput}
                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <button className={styles.searchButton} onClick={handleSearch}>
                                <FaSearch />
                            </button>
                        </div>

                        <button className={styles.mobileSearchButton} onClick={() => setIsMobileSearchOpen(true)}>
                            <FaSearch size={20} />
                        </button>

                        {isAuthenticated && (
                            <a href="/MyCart" className={styles.cartLink}>
                                <FaShoppingCart size={20} />
                            </a>
                        )}

                        {!isAuthenticated ? (
                            <a href="/AuthForm">
                                <button className={styles.registerButton}>Registrarse</button>
                            </a>
                        ) : (
                            <div className={styles.userMenuContainer} ref={dropdownRef}>
                                <button className={styles.userButton} onClick={toggleMenu}>
                                    {profileData.username}
                                    <FaChevronDown size={12} />
                                </button>

                                {isMenuOpen && (
                                    <div className={styles.menuDropdown}>
                                        <button className={styles.menuDropdownItem} onClick={goToProfile}>
                                            <FaUser size={14} />
                                            Mi perfil
                                        </button>
                                        <button className={styles.menuDropdownItem} onClick={handleEditProfileClick}>
                                            <FaEdit size={14} />
                                            Editar perfil
                                        </button>
                                        <button className={styles.menuDropdownItem}>
                                            <FaQuestionCircle size={14} />
                                            Ayuda
                                        </button>
                                        <div className={styles.menuDropdownSeparator} />
                                        <button className={styles.menuDropdownItem} onClick={handleLogoutClick}>
                                            <FaSignOutAlt size={14} />
                                            Cerrar sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <button className={styles.mobileMenuButton} onClick={() => setIsMobileMenuOpen(true)}>
                            <FaBars size={20} />
                        </button>
                    </div>
                </nav>
            </div>

            <div className={`${styles.mobileSearchOverlay} ${isMobileSearchOpen ? styles.mobileSearchOpen : ""}`}>
                <div className={styles.mobileMenuHeader}>
                    <h2>Buscar</h2>
                    <button className={styles.mobileMenuClose} onClick={() => setIsMobileSearchOpen(false)}>
                        <FaTimes />
                    </button>
                </div>
                <div className={styles.mobileSearchForm}>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar..."
                        className={styles.mobileSearchInput}
                    />
                    <button className={styles.mobileSearchButton} onClick={handleSearch}>
                        Buscar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Navbar;