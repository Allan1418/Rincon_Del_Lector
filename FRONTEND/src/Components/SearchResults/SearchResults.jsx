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
    const query = params.get("q")
    const tab = params.get("tab") || "books"
    const pageParam = params.get("page") ? Number.parseInt(params.get("page")) : 1

    if (query !== null) {
      setSearchQuery(query)
      setActiveTab(tab)
      setPage(pageParam)

      setOrderingFilter(params.get("ordering") || null)
      setOwnedFilter(params.get("owned") === "true" ? true : params.get("owned") === "false" ? false : null)
      setPurchasedFilter(params.get("purchased") === "true" ? true : params.get("purchased") === "false" ? false : null)
      setSearchType(params.get("searchType") || "title_synopsis")
      setGoToPage(params.get("page") || "")

      fetchData(query, tab, pageParam)
    } else {
      setSearchQuery("")
      setActiveTab(tab)
      setPage(pageParam)

      setOrderingFilter(params.get("ordering") || null)
      setOwnedFilter(params.get("owned") === "true" ? true : params.get("owned") === "false" ? false : null)
      setPurchasedFilter(params.get("purchased") === "true" ? true : params.get("purchased") === "false" ? false : null)
      setSearchType(params.get("searchType") || "title_synopsis")
      setGoToPage(params.get("page") || "")

      fetchData("", tab, pageParam)
    }
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
          ownedFilter ? null : purchasedFilter, // Cambio clave aquí
          search
        )
      } else {
        results = await searchUsers(query, pageToFetch, token)
      }

      setItems(results.results)
      setTotalPages(Math.ceil(results.count / pageSize))

      if (results.results.length === 0) {
        setNoResultsMessage("No hay resultados para esta página.")
      } else {
        setNoResultsMessage("")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setItems([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSubmit = () => {
    const navigateUrl = `/search?q=${encodeURIComponent(searchQuery)}&tab=${activeTab}&page=1&searchType=${searchType}`
    navigate(navigateUrl)
  }

  const handleTabChange = (tab) => {
    let navigateUrl = `/search?q=${encodeURIComponent(searchQuery)}&tab=${tab}&page=1`

    if (orderingFilter) navigateUrl += `&ordering=${orderingFilter}`
    if (ownedFilter !== null) navigateUrl += `&owned=${ownedFilter}`
    if (purchasedFilter !== null && ownedFilter !== true) navigateUrl += `&purchased=${purchasedFilter}`
    if (goToPage) navigateUrl += `&page=${goToPage}`
    navigateUrl += `&searchType=${searchType}`

    navigate(navigateUrl)
  }

  const handleBookClick = (bookId) => {
    navigate(`/libros/${bookId}`)
  }

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`)
  }

  const applyFilters = () => {
    let pageNumber = goToPage && !isNaN(goToPage) && goToPage >= 1 ? Number.parseInt(goToPage) : 1

    if (pageNumber > totalPages) {
      pageNumber = totalPages
    }

    let navigateUrl = `/search?q=${encodeURIComponent(searchQuery)}&tab=${activeTab}&page=${pageNumber}`

    if (orderingFilter) navigateUrl += `&ordering=${orderingFilter}`
    if (ownedFilter !== null) navigateUrl += `&owned=${ownedFilter}`
    if (purchasedFilter !== null && ownedFilter !== true) navigateUrl += `&purchased=${purchasedFilter}`
    navigateUrl += `&searchType=${searchType}`

    navigate(navigateUrl)
  }

  const clearFilters = () => {
    setOrderingFilter(null)
    setOwnedFilter(null)
    setPurchasedFilter(null)
    setGoToPage("")

    const navigateUrl = `/search?q=${encodeURIComponent(searchQuery)}&tab=${activeTab}&page=1&searchType=${searchType}`
    navigate(navigateUrl)
  }

  const isFilterDisabled = (filterType) => {
    if (!isLoggedIn && (filterType === "owned" || filterType === "purchased")) {
      return true
    }

    if (filterType === "purchased" && ownedFilter === true) {
      return true
    }

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
    const endPage = Math.min(totalPages, startPage + visiblePages - 1)

    if (endPage - startPage < visiblePages - 1) {
      startPage = Math.max(1, endPage - visiblePages + 1)
    }

    const pages = []
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={page === i ? styles.activePage : styles.pageButton}
        >
          {i}
        </button>
      )
    }

    return (
      <div className={styles.pagination}>
        {startPage > 1 && (
          <>
            <button onClick={() => handlePageChange(1)} className={styles.pageButton} aria-label="Primera página">
              <FaChevronLeft className={styles.paginationIcon} />
            </button>
            {startPage > 2 && <span className={styles.ellipsis}>...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className={styles.pageButton}
              aria-label="Última página"
            >
              <FaChevronRight className={styles.paginationIcon} />
            </button>
          </>
        )}
      </div>
    )
  }

  const getDynamicTitle = () => {
    if (activeTab === "books") {
      if (searchType === "owner") {
        return "Búsqueda por Creadores"
      } else {
        return "Búsqueda por Títulos y Sinopsis"
      }
    } else {
      return "Búsqueda de Usuarios"
    }
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
              activeTab === "books" ? "Buscar por título, sinopsis o autor..." : "Buscar usuarios por nombre..."
            }
            className={styles.searchInput}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit()
              }
            }}
          />
          <button onClick={handleSearchSubmit} className={`${styles.searchButton} ${styles.enhancedButton}`}>
            <FaSearch className={styles.searchIcon} />
            <span className={styles.searchButtonText}>Buscar</span>
          </button>
        </div>
      </div>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === "books" ? styles.activeTab : ""} ${styles.enhancedTab}`}
          onClick={() => handleTabChange("books")}
        >
          <FaBook className={styles.tabIcon} />
          <span>Libros</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "users" ? styles.activeTab : ""} ${styles.enhancedTab}`}
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
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <FaSort className={styles.filterLabelIcon} />
                  Ordenar por
                </label>
                <select
                  value={orderingFilter || ""}
                  onChange={(e) => setOrderingFilter(e.target.value || null)}
                  className={styles.filterSelect}
                  title="Ordena los resultados según diferentes criterios"
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
                  {!isLoggedIn && <FaLock className={styles.lockIcon} title="Inicia sesión para usar este filtro" />}
                </label>
                <div className={styles.filterSelectWrapper}>
                  <select
                    value={ownedFilter === null ? "" : ownedFilter}
                    onChange={(e) => {
                      const newValue = e.target.value === "" ? null : e.target.value === "true"
                      setOwnedFilter(newValue)
                      if (newValue === true) setPurchasedFilter(null)
                    }}
                    className={`${styles.filterSelect} ${isFilterDisabled("owned") ? styles.disabledFilter : ""}`}
                    title={renderFilterTooltip("owned")}
                    disabled={isFilterDisabled("owned")}
                  >
                    <option value="">Todos los libros</option>
                    <option value="true">Mis Libros</option>
                    <option value="false">Libros de Otros</option>
                  </select>
                  {!isLoggedIn && (
                    <div className={styles.filterOverlay} title="Inicia sesión para usar este filtro"></div>
                  )}
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <FaShoppingCart className={styles.filterLabelIcon} />
                  Estado de Compra
                  {(!isLoggedIn || ownedFilter === true) && (
                    <FaLock className={styles.lockIcon} title={renderFilterTooltip("purchased")} />
                  )}
                </label>
                <div className={styles.filterSelectWrapper}>
                  <select
                    value={purchasedFilter === null ? "" : purchasedFilter}
                    onChange={(e) =>
                      setPurchasedFilter(e.target.value === "" ? null : e.target.value === "true" ? true : false)
                    }
                    className={`${styles.filterSelect} ${isFilterDisabled("purchased") ? styles.disabledFilter : ""}`}
                    title={renderFilterTooltip("purchased")}
                    disabled={isFilterDisabled("purchased")}
                  >
                    <option value="">Todos los Libros</option>
                    <option value="true">Ya Comprados</option>
                    <option value="false">No Comprados</option>
                  </select>
                  {isFilterDisabled("purchased") && (
                    <div className={styles.filterOverlay} title={renderFilterTooltip("purchased")}></div>
                  )}
                </div>
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
                  title="Ir a una página específica"
                  min="1"
                  max={totalPages}
                />
              </div>
              <div className={`${styles.filterGroup} ${styles.filterActions}`}>
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
          <div className={styles.emptyIcon}>{activeTab === "books" ? <FaBook size={32} /> : <FaUser size={32} />}</div>
          <h2 className={styles.emptyTitle}>No se encontraron resultados</h2>
          <p className={styles.emptyDescription}>
            {searchQuery
              ? `No encontramos resultados para "${searchQuery}". Intenta con diferentes términos o ajusta los filtros.`
              : `No hay ${activeTab === "books" ? "libros" : "usuarios"} disponibles. Intenta con una nueva búsqueda.`}
          </p>
          <button onClick={clearFilters} className={`${styles.clearFiltersButton} ${styles.enhancedButton}`}>
            <FaTimes className={styles.clearIcon} />
            <span>Refrescar</span>
          </button>
        </div>
      ) : (
        <div className={activeTab === "books" ? styles.booksGrid : styles.usersGrid}>
          {activeTab === "users"
            ? items.map((user) => (
                <div
                  key={user.id}
                  className={`${styles.userCard} ${styles.fadeIn}`}
                  onClick={() => handleUserClick(user.username)}
                >
                  {user.image_name ? (
                    <img
                      src={getProfileImage(user.image_name) || "/placeholder.svg"}
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
                  className={`${styles.bookCard} ${styles.fadeIn}`}
                  onClick={() => handleBookClick(book.id)}
                >
                  <div className={styles.bookCover}>
                    {book.has_image ? (
                      <img src={getBookImageUrl(book.id) || "/placeholder.svg"} alt={book.title} />
                    ) : (
                      <div className={`${styles.bookCoverFallback} ${styles.noImage}`}></div>
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

