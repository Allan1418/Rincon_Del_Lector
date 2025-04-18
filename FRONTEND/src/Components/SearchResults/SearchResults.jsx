import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  FaSearch,
  FaBook,
  FaUser,
  FaFilter,
  FaUserCircle,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaSort,
  FaShoppingCart,
  FaEye,
  FaLock,
} from "react-icons/fa"
import { searchUsers, getProfileImage, getLibros, getBookImageUrl } from "../../services/ProfileService"
import styles from "./SearchResults.module.css"

const UserSearchResults = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState([])
  const [activeTab, setActiveTab] = useState("books")
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const location = useLocation()
  const navigate = useNavigate()
  const token = localStorage.getItem("Authorization")
  const isLoggedIn = !!token

  const [orderingFilter, setOrderingFilter] = useState(null)
  const [ownedFilter, setOwnedFilter] = useState(null)
  const [purchasedFilter, setPurchasedFilter] = useState(null)
  const [searchType, setSearchType] = useState("title_synopsis")
  const [goToPage, setGoToPage] = useState("")
  const [showFilters, setShowFilters] = useState(true)
  const [noResultsMessage, setNoResultsMessage] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const query = params.get("q") || ""
    const tab = params.get("tab") || "books"
    const pageParam = parseInt(params.get("page")) || 1

    setSearchQuery(query)
    setActiveTab(tab)
    setPage(pageParam)

    if (tab === "books") {
      setOrderingFilter(params.get("ordering") || null)
      setOwnedFilter(params.get("owned") ? params.get("owned") === "true" : null)
      setPurchasedFilter(params.get("purchased") ? params.get("purchased") === "true" : null)
      setSearchType(params.get("searchType") || "title_synopsis")
    }

    fetchData(query, tab, pageParam)
  }, [location.search])

  const fetchData = async (query, tab, pageToFetch) => {
    setIsLoading(true)
    try {
      let results
      const pageSize = 20

      if (tab === "books") {
        let owner = null
        let search = null

        if (searchType === "owner") {
          owner = query
        } else {
          search = query
        }

        results = await getLibros(
          token,
          owner,
          orderingFilter,
          ownedFilter,
          pageToFetch,
          ownedFilter ? null : purchasedFilter,
          search
        )
      } else {
        results = await searchUsers(query, pageToFetch, token)
      }

      setItems(results.results)
      setTotalPages(Math.ceil(results.count / pageSize))
      setNoResultsMessage(results.results.length === 0 ? "No hay resultados para esta página." : "")
    } catch (error) {
      console.error("Error fetching data:", error)
      setItems([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChange = (e) => setSearchQuery(e.target.value)

  const handleSearchSubmit = () => {
    const params = new URLSearchParams()
    params.set("q", searchQuery)
    params.set("tab", activeTab)
    params.set("page", 1)
    params.set("searchType", searchType)
    
    if (activeTab === "books") {
      if (orderingFilter) params.set("ordering", orderingFilter)
      if (ownedFilter !== null) params.set("owned", ownedFilter)
      if (purchasedFilter !== null) params.set("purchased", purchasedFilter)
    }
    
    navigate(`/search?${params.toString()}`)
  }

  const handleTabChange = (tab) => {
    const newParams = new URLSearchParams()
    newParams.set("q", searchQuery)
    newParams.set("tab", tab)
    newParams.set("page", 1)
    newParams.set("searchType", searchType)

    if (tab === "books") {
      if (orderingFilter) newParams.set("ordering", orderingFilter)
      if (ownedFilter !== null) newParams.set("owned", ownedFilter)
      if (purchasedFilter !== null) newParams.set("purchased", purchasedFilter)
    }

    navigate(`/search?${newParams.toString()}`)
  }

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(location.search)
    params.set("page", newPage)
    navigate(`/search?${params.toString()}`)
  }

  const handleBookClick = (bookId) => navigate(`/libros/${bookId}`)
  const handleUserClick = (userId) => navigate(`/user/${userId}`)

  const applyFilters = () => {
    let pageNumber = Math.min(Math.max(1, parseInt(goToPage) || 1), totalPages)
    const params = new URLSearchParams(location.search)
    params.set("page", pageNumber)
    
    if (activeTab === "books") {
      if (orderingFilter) params.set("ordering", orderingFilter)
      if (ownedFilter !== null) params.set("owned", ownedFilter)
      if (purchasedFilter !== null) params.set("purchased", purchasedFilter)
      params.set("searchType", searchType)
    }
    
    navigate(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(location.search)
    params.delete("ordering")
    params.delete("owned")
    params.delete("purchased")
    params.set("page", 1)
    
    setOrderingFilter(null)
    setOwnedFilter(null)
    setPurchasedFilter(null)
    setGoToPage("")
    
    navigate(`/search?${params.toString()}`)
  }

  const isFilterDisabled = (filterType) => {
    if (!isLoggedIn && (filterType === "owned" || filterType === "purchased")) return true
    if (filterType === "purchased" && ownedFilter === true) return true
    return false
  }

  const renderFilterTooltip = (filterType) => {
    if (!isLoggedIn && (filterType === "owned" || filterType === "purchased")) {
      return "Inicia sesión para usar este filtro"
    }
    if (filterType === "purchased" && ownedFilter === true) {
      return "No disponible cuando 'Mis Libros' está seleccionado"
    }
    return ""
  }

  const renderPagination = () => {
    const visiblePages = 5
    let startPage = Math.max(1, page - Math.floor(visiblePages / 2))
    let endPage = Math.min(totalPages, startPage + visiblePages - 1)

    if (endPage - startPage < visiblePages - 1) {
      startPage = Math.max(1, endPage - visiblePages + 1)
    }

    return (
      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={styles.pageButton}
        >
          <FaChevronLeft />
        </button>

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => (
          <button
            key={startPage + i}
            onClick={() => handlePageChange(startPage + i)}
            className={`${styles.pageButton} ${
              page === startPage + i ? styles.activePage : ""
            }`}
            disabled={page === startPage + i}
          >
            {startPage + i}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className={styles.pageButton}
        >
          <FaChevronRight />
        </button>
      </div>
    )
  }

  const getDynamicTitle = () => {
    if (activeTab === "books") {
      return searchType === "owner" 
        ? "Búsqueda por Creadores" 
        : "Búsqueda por Títulos y Sinopsis"
    }
    return "Búsqueda de Usuarios"
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchHeader}>
        <h1 className={styles.title}>{getDynamicTitle()}</h1>
        {searchQuery && (
          <p className={styles.searchQuery}>
            Mostrando resultados para: <span className={styles.highlight}>{searchQuery}</span>
          </p>
        )}
        <div className={styles.searchBar}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={
              activeTab === "books" 
                ? "Buscar por título, sinopsis o autor..." 
                : "Buscar usuarios por nombre..."
            }
            className={styles.searchInput}
            onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
          />
          <button onClick={handleSearchSubmit} className={`${styles.searchButton} ${styles.enhancedButton}`}>
            <FaSearch className={styles.searchIcon} />
            <span className={styles.searchButtonText}>Buscar</span>
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === "books" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("books")}
        >
          <FaBook className={styles.tabIcon} />
          <span>Libros</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "users" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("users")}
        >
          <FaUser className={styles.tabIcon} />
          <span>Usuarios</span>
        </button>
      </div>

      {activeTab === "books" && (
        <div className={styles.filters}>
          <div className={styles.filtersHeader}>
            <h2 className={styles.filtersTitle}>
              <FaFilter className={styles.filtersIcon} />
              Filtros
            </h2>
            <div className={styles.filterActions}>
              {(orderingFilter || ownedFilter !== null || purchasedFilter !== null) && (
                <button className={`${styles.clearFiltersButton} ${styles.enhancedButton}`} onClick={clearFilters}>
                  <FaTimes className={styles.clearIcon} />
                  <span>Limpiar filtros</span>
                </button>
              )}
              <button
                className={`${styles.toggleFiltersButton} ${styles.enhancedButton}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <span>{showFilters ? "Ocultar filtros" : "Mostrar filtros"}</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className={styles.filtersGrid}>
              {/* Filtros específicos de libros */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <FaSort className={styles.filterLabelIcon} />
                  Ordenar por
                </label>
                <select
                  value={orderingFilter || ""}
                  onChange={(e) => setOrderingFilter(e.target.value || null)}
                  className={styles.filterSelect}
                >
                  <option value="">Sin ordenar</option>
                  <option value="title">Título (A-Z)</option>
                  <option value="-title">Título (Z-A)</option>
                  <option value="price">Precio (Menor a Mayor)</option>
                  <option value="-price">Precio (Mayor a Menor)</option>
                  <option value="published_date">Fecha (Más Antigua)</option>
                  <option value="-published_date">Fecha (Más Reciente)</option>
                  <option value="most_purchased">Popularidad (Más Comprados)</option>
                  <option value="least_purchased">Popularidad (Menos Comprados)</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <FaUserCircle className={styles.filterLabelIcon} />
                  Propiedad
                  {!isLoggedIn && <FaLock className={styles.lockIcon} />}
                </label>
                <select
                  value={ownedFilter === null ? "" : ownedFilter}
                  onChange={(e) => {
                    const newValue = e.target.value === "" ? null : e.target.value === "true"
                    setOwnedFilter(newValue)
                    if (newValue === true) setPurchasedFilter(null)
                  }}
                  className={`${styles.filterSelect} ${isFilterDisabled("owned") ? styles.disabledFilter : ""}`}
                  disabled={isFilterDisabled("owned")}
                >
                  <option value="">Todos los libros</option>
                  <option value="true">Mis Libros</option>
                  <option value="false">Libros de Otros</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <FaShoppingCart className={styles.filterLabelIcon} />
                  Estado de Compra
                  {(!isLoggedIn || ownedFilter === true) && <FaLock className={styles.lockIcon} />}
                </label>
                <select
                  value={purchasedFilter === null ? "" : purchasedFilter}
                  onChange={(e) => setPurchasedFilter(e.target.value === "" ? null : e.target.value === "true")}
                  className={`${styles.filterSelect} ${isFilterDisabled("purchased") ? styles.disabledFilter : ""}`}
                  disabled={isFilterDisabled("purchased")}
                >
                  <option value="">Todos los Libros</option>
                  <option value="true">Ya Comprados</option>
                  <option value="false">No Comprados</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <FaSearch className={styles.filterLabelIcon} />
                  Buscar por
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="title_synopsis">Título/Sinopsis</option>
                  <option value="owner">Propietario</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <FaChevronRight className={styles.filterLabelIcon} />
                  Ir a página
                </label>
                <input
                  type="number"
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  placeholder="Número de página"
                  className={styles.filterInput}
                  min="1"
                  max={totalPages}
                />
              </div>

              <div className={styles.filterGroup}>
                <button onClick={applyFilters} className={`${styles.filterButton} ${styles.pulseButton}`}>
                  <FaFilter className={styles.buttonIcon} />
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando resultados...</p>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            {activeTab === "books" ? <FaBook size={32} /> : <FaUser size={32} />}
          </div>
          <h2 className={styles.emptyTitle}>No se encontraron resultados</h2>
          <p className={styles.emptyDescription}>
            {searchQuery
              ? `No encontramos resultados para "${searchQuery}". Intenta con diferentes términos o ajusta los filtros.`
              : `No hay ${activeTab === "books" ? "libros" : "usuarios"} disponibles. Intenta con una nueva búsqueda.`}
          </p>
        </div>
      ) : (
        <div className={activeTab === "books" ? styles.booksGrid : styles.usersGrid}>
          {activeTab === "users"
            ? items.map((user) => (
                <div
                  key={user.id}
                  className={styles.userCard}
                  onClick={() => handleUserClick(user.username)}
                >
                  {user.image_name ? (
                    <img
                      src={getProfileImage(user.image_name)}
                      alt={user.username}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>
                      <FaUserCircle className={styles.fallbackIcon} />
                      <span className={styles.avatarInitial}>{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className={styles.userInfo}>
                    <h3>{user.username}</h3>
                    <span className={styles.viewProfile}>
                      <FaEye className={styles.viewIcon} />
                      Ver perfil
                      <FaArrowRight className={styles.profileArrowIcon} />
                    </span>
                  </div>
                </div>
              ))
            : items.map((book) => (
                <div
                  key={book.id}
                  className={styles.bookCard}
                  onClick={() => handleBookClick(book.id)}
                >
                  <div className={styles.bookCover}>
                    {book.has_image ? (
                      <img src={getBookImageUrl(book.id)} alt={book.title} />
                    ) : (
                      <div className={styles.bookCoverFallback}></div>
                    )}
                    {book.is_new && <span className={styles.bookBadge}>Nuevo</span>}
                  </div>
                  <div className={styles.bookDetails}>
                    <h3 className={styles.bookTitle}>{book.title}</h3>
                    <div className={styles.bookAuthor}>
                      <FaUserCircle className={styles.authorIcon} />
                      <span>Creador: {book.owner}</span>
                    </div>
                    <p className={styles.bookSynopsis}>{book.synopsis}</p>
                    <div className={styles.bookFooter}>
                      <div className={styles.bookPrice}>₡{book.price}</div>
                      <div className={styles.viewDetails}>
                        <FaEye className={styles.viewIcon} />
                        <span>Ver detalles</span>
                        <FaArrowRight className={styles.arrowIcon} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      )}

      {totalPages > 1 && <div className={styles.paginationContainer}>{renderPagination()}</div>}
      {noResultsMessage && <p className={styles.noResultsMessage}>{noResultsMessage}</p>}
    </div>
  )
}

export default UserSearchResults