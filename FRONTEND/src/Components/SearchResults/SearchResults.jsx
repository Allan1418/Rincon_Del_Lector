"use client"

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

  const [orderingFilter, setOrderingFilter] = useState(null)
  const [ownedFilter, setOwnedFilter] = useState(null)
  const [purchasedFilter, setPurchasedFilter] = useState(null)
  const [searchFilter, setSearchFilter] = useState(null)
  const [searchType, setSearchType] = useState("title_synopsis")
  const [goToPage, setGoToPage] = useState("")
  const [showFilters, setShowFilters] = useState(true)

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
      setSearchFilter(params.get("search") || null)
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
      setSearchFilter(params.get("search") || null)
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

        if (searchFilter) {
          owner = searchType === "owner" ? searchFilter : null
          search = searchType === "title_synopsis" ? searchFilter : null
        } else {
          search = query
        }

        results = await getLibros(token, owner, orderingFilter, ownedFilter, pageToFetch, purchasedFilter, search)
      } else {
        results = await searchUsers(query, pageToFetch, token)
      }

      setItems(results.results)
      setTotalPages(Math.ceil(results.count / pageSize))
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
    const navigateUrl = `/search?q=${encodeURIComponent(searchQuery)}&tab=${activeTab}&page=1`
    navigate(navigateUrl)
  }

  const handleTabChange = (tab) => {
    let navigateUrl = `/search?q=${encodeURIComponent(searchQuery)}&tab=${tab}&page=1`

    if (orderingFilter) navigateUrl += `&ordering=${orderingFilter}`
    if (ownedFilter !== null) navigateUrl += `&owned=${ownedFilter}`
    if (purchasedFilter !== null) navigateUrl += `&purchased=${purchasedFilter}`
    if (searchFilter) {
      if (searchType === "owner") {
        navigateUrl += `&owner=${searchFilter}`
      } else {
        navigateUrl += `&search=${searchFilter}`
      }
    }
    if (goToPage) navigateUrl += `&page=${goToPage}`

    navigate(navigateUrl)
  }

  const handleBookClick = (bookId) => {
    navigate(`/libros/${bookId}`)
  }

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`)
  }

  const applyFilters = () => {
    let navigateUrl = `/search?q=${encodeURIComponent(searchQuery)}&tab=${activeTab}&page=1`

    if (orderingFilter) navigateUrl += `&ordering=${orderingFilter}`
    if (ownedFilter !== null) navigateUrl += `&owned=${ownedFilter}`
    if (purchasedFilter !== null) navigateUrl += `&purchased=${purchasedFilter}`
    if (searchFilter) {
      if (searchType === "owner") {
        navigateUrl += `&owner=${searchFilter}`
      } else {
        navigateUrl += `&search=${searchFilter}`
      }
    }
    if (goToPage) navigateUrl += `&page=${goToPage}`

    navigate(navigateUrl)
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
          onClick={() => {
            let navigateUrl = `/search?q=${encodeURIComponent(searchQuery)}&tab=${activeTab}&page=${i}`
            if (orderingFilter) navigateUrl += `&ordering=${orderingFilter}`
            if (ownedFilter !== null) navigateUrl += `&owned=${ownedFilter}`
            if (purchasedFilter !== null) navigateUrl += `&purchased=${purchasedFilter}`
            if (searchFilter) {
              if (searchType === "owner") {
                navigateUrl += `&owner=${searchFilter}`
              } else {
                navigateUrl += `&search=${searchFilter}`
              }
            }
            navigate(navigateUrl)
          }}
          className={page === i ? styles.activePage : styles.pageButton}
        >
          {i}
        </button>,
      )
    }

    return (
      <div className={styles.pagination}>
        {startPage > 1 && (
          <>
            <button
              onClick={() => {
                let navigateUrl = `/search?q=${encodeURIComponent(searchQuery)}&tab=${activeTab}&page=1`
                if (orderingFilter) navigateUrl += `&ordering=${orderingFilter}`
                if (ownedFilter !== null) navigateUrl += `&owned=${ownedFilter}`
                if (purchasedFilter !== null) navigateUrl += `&purchased=${purchasedFilter}`
                if (searchFilter) {
                  if (searchType === "owner") {
                    navigateUrl += `&owner=${searchFilter}`
                  } else {
                    navigateUrl += `&search=${searchFilter}`
                  }
                }
                navigate(navigateUrl)
              }}
              className={styles.pageButton}
            >
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
              onClick={() => {
                let navigateUrl = `/search?q=${encodeURIComponent(searchQuery)}&tab=${activeTab}&page=${totalPages}`
                if (orderingFilter) navigateUrl += `&ordering=${orderingFilter}`
                if (ownedFilter !== null) navigateUrl += `&owned=${ownedFilter}`
                if (purchasedFilter !== null) navigateUrl += `&purchased=${purchasedFilter}`
                if (searchFilter) {
                  if (searchType === "owner") {
                    navigateUrl += `&owner=${searchFilter}`
                  } else {
                    navigateUrl += `&search=${searchFilter}`
                  }
                }
                navigate(navigateUrl)
              }}
              className={styles.pageButton}
            >
              <FaChevronRight className={styles.paginationIcon} />
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchHeader}>
        <h1 className={styles.title}>Resultados de Búsqueda</h1>
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
            placeholder={`Buscar ${activeTab === "books" ? "título de libros" : "usuarios"}...`}
            className={styles.searchInput}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit()
              }
            }}
          />
          <button onClick={handleSearchSubmit} className={styles.searchButton}>
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
            <button className={styles.toggleFiltersButton} onClick={() => setShowFilters(!showFilters)}>
              <span>{showFilters ? "Ocultar filtros" : "Mostrar filtros"}</span>
            </button>
          </div>

          {showFilters && (
            <div className={styles.filtersGrid}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Ordenar por</label>
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
                <label className={styles.filterLabel}>Propiedad</label>
                <select
                  value={ownedFilter === null ? "" : ownedFilter}
                  onChange={(e) =>
                    setOwnedFilter(e.target.value === "" ? null : e.target.value === "true" ? true : false)
                  }
                  className={styles.filterSelect}
                  title="Filtra entre tus libros y los de otros usuarios"
                >
                  <option value="">Todos los libros</option>
                  <option value="true">Mis Libros</option>
                  <option value="false">Libros de Otros</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Estado de Compra</label>
                <select
                  value={purchasedFilter === null ? "" : purchasedFilter}
                  onChange={(e) =>
                    setPurchasedFilter(e.target.value === "" ? null : e.target.value === "true" ? true : false)
                  }
                  className={styles.filterSelect}
                  title="Filtra entre libros que has comprado y los que no"
                >
                  <option value="">Todos los Libros</option>
                  <option value="true">Ya Comprados</option>
                  <option value="false">No Comprados</option>
                </select>
              </div>

              <div className={styles.searchFilterContainer}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Buscar por</label>
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
                  <label className={styles.filterLabel}>Búsqueda</label>
                  <input
                    type="text"
                    value={searchFilter || ""}
                    onChange={(e) => setSearchFilter(e.target.value || null)}
                    placeholder={searchType === "title_synopsis" ? "Título o sinopsis" : "Nombre de usuario"}
                    className={styles.filterInput}
                    title={
                      searchType === "title_synopsis"
                        ? "Busca palabras clave en el título o sinopsis de los libros"
                        : "Filtra libros por el nombre de usuario del propietario"
                    }
                  />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Ir a página</label>
                <input
                  type="number"
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  placeholder="Número de página"
                  className={styles.filterInput}
                  title="Ir a una página específica"
                />
              </div>

              <div className={`${styles.filterGroup} ${styles.filterActions}`}>
                <button onClick={applyFilters} className={styles.applyFiltersButton}>
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
            Intenta con diferentes términos de búsqueda o ajusta los filtros para encontrar lo que buscas.
          </p>
        </div>
      ) : (
        <div className={activeTab === "books" ? styles.booksGrid : styles.usersGrid}>
          {activeTab === "books"
            ? items.map((book) => (
                <div
                  key={book.id}
                  className={`${styles.bookCard} ${styles.fadeIn}`}
                  onClick={() => handleBookClick(book.id)}
                >
                  <div className={styles.bookCover}>
                    <img src={getBookImageUrl(book.id) || "/placeholder.svg"} alt={book.title} />
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
                        <span>Ver detalles</span>
                        <FaArrowRight className={styles.arrowIcon} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : items.map((user) => (
                <div
                  key={user.id}
                  className={`${styles.userCard} ${styles.fadeIn}`}
                  onClick={() => handleUserClick(user.username)}
                >
                  <img
                    src={getProfileImage(user.image_name) || "/placeholder.svg"}
                    alt={user.username}
                    className={styles.avatar}
                  />
                  <div className={styles.userInfo}>
                    <h3>{user.username}</h3>
                    <span className={styles.viewProfile}>
                      Ver perfil
                      <FaArrowRight className={styles.profileArrowIcon} />
                    </span>
                  </div>
                </div>
              ))}
        </div>
      )}
      {totalPages > 1 && <div className={styles.paginationContainer}>{renderPagination()}</div>}
    </div>
  )
}

export default UserSearchResults

