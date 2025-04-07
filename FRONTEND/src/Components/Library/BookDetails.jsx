"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getLibroById, getBookImageUrl, addToCart, getCarrito } from "../../services/ProfileService"
import LoadingScreen from "../Hooks/LoadingScreen"
import ErrorDisplay from "../Hooks/ErrorDisplay"
import {
  Book,
  Calendar,
  BadgeCent,
  User,
  ArrowLeft,
  BookOpen,
  Edit,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Heart,
  Share2,
  BookMarked,
  FileX,
} from "lucide-react"
import styles from "./BookDetails.module.css"
import { AuthContext } from "../Context/AuthContext"

const BookDetails = () => {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingLeer, setLoadingLeer] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(false)
  const { userData, token } = useContext(AuthContext)
  const hasFile = book?.has_file
  const isOwner = userData?.username === book?.owner
  const isPurchased = book?.is_purchased
  const isInCart = cartItems.includes(bookId)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookData = await getLibroById(bookId, token)
        setBook(bookData)

        if (token) {
          setCartLoading(true)
          const cartData = await getCarrito(token)

          if (cartData && Array.isArray(cartData.libros)) {
            const cartBookIds = cartData.libros.map((libro) => libro.id.toString())
            setCartItems(cartBookIds)
          } else {
            setCartItems([])
          }
        }
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
        setCartLoading(false)
      }
    }

    fetchData()
  }, [bookId, token])

  const handleReadBook = async () => {
    setLoadingLeer(true)
    setSuccessMessage(null)

    try {
      const response = await (async () => {
        return {
          headers: {
            get: () => {
              return "application/epub+zip"
            },
          },
        }
      })()

      const contentType = response.headers.get("content-type")

      if (!contentType?.includes("epub")) {
        throw new Error("El formato del libro no es compatible")
      }

      navigate(`/lector/${bookId}/ver`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingLeer(false)
    }
  }

  const handleAddToCart = async () => {
    if (!token) {
      setError("Debes iniciar sesión para agregar al carrito")
      navigate("/authForm")
      return
    }

    if (!hasFile) {
      setError("El creador no ha subido un archivo al libro")
      return
    }

    setIsAddingToCart(true)
    try {
      await addToCart(bookId, token)
      const cartData = await getCarrito(token)
      if (typeof cartData === "object" && cartData !== null && Array.isArray(cartData.libros)) {
        const updatedCartItems = cartData.libros.map((libro) => libro.id.toString())
        setCartItems(updatedCartItems)
      }
      setSuccessMessage("¡Libro agregado al carrito exitosamente!")

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      setError(error.detail || "Error al agregar al carrito")

      // Auto-hide error message after 3 seconds
      setTimeout(() => {
        setError(null)
      }, 3000)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleEdit = () => {
    navigate(`/edit/${bookId}`)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: book?.title,
          text: `Mira este libro: ${book?.title}`,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error))
    } else {
      navigator.clipboard.writeText(window.location.href)
      setSuccessMessage("¡Enlace copiado al portapapeles!")
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    }
  }

  if (isLoading || cartLoading) return <LoadingScreen />
  if (error && !successMessage) return <ErrorDisplay error={error} />

  return (
    <div className={styles.bookDetailsContainer}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>Volver</span>
      </button>

      <div className={styles.bookHeader}>
        <div className={styles.coverContainer}>
          {book && book.has_image ? (
            <img
              src={getBookImageUrl(bookId) || "/placeholder.svg"}
              alt={`Portada de ${book.title}`}
              className={styles.bookCover}
            />
          ) : (
            <div className={`${styles.bookCover} ${styles.noImage}`}>
              <BookMarked size={64} />
            </div>
          )}
        </div>

        <div className={styles.mainContent}>
          <div className={styles.titleContainer}>
            <h1 className={styles.bookTitle}>
              <BookOpen className={styles.titleIcon} />
              <span>{book.title}</span>
            </h1>
            {isPurchased && (
              <div className={styles.purchasedBadge}>
                <CheckCircle size={16} />
                <span>Comprado</span>
              </div>
            )}
          </div>

          <div className={styles.metaGrid}>
            <button onClick={() => navigate(`/user/${book.owner}`)} className={styles.metaCard}>
              <div className={styles.metaItem}>
                <User className={styles.metaIcon} />
                <div>
                  <div className={styles.metaLabel}>Propietario</div>
                  <div className={styles.ownerLink}>
                    <div className={styles.metaValue}>{book.owner}</div>
                  </div>
                </div>
              </div>
            </button>

            <div className={styles.metaCard}>
              <div className={styles.metaItem}>
                <Calendar className={styles.metaIcon} />
                <div>
                  <div className={styles.metaLabel}>Fecha de publicación</div>
                  <div className={styles.metaValue}>{new Date(book.published_date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actionRow}>
            <div className={styles.priceBadge}>
              <BadgeCent size={20} />
              <span>{book.price}</span>
            </div>

            {isOwner && (
              <button className={styles.editButton} onClick={handleEdit}>
                <Edit size={18} />
                <span>Editar</span>
              </button>
            )}
          </div>

          <div className={styles.downloadSection}>
            {!isOwner && (
              <>
                {isPurchased ? (
                  <button
                    className={`${styles.downloadButton} ${!hasFile ? styles.disabledButton : ""}`}
                    onClick={handleReadBook}
                    disabled={loadingLeer || !hasFile}
                  >
                    {loadingLeer ? (
                      <>
                        <div className={styles.spinner} />
                        <span>Cargando libro...</span>
                      </>
                    ) : !hasFile ? (
                      <>
                        <FileX size={20} />
                        <span>ArchivoEpub no accesible</span>
                      </>
                    ) : (
                      <>
                        <BookOpen size={20} />
                        <span>Leer ahora</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className={styles.purchaseSection}>
                    {!hasFile ? (
                      <button className={`${styles.downloadButton} ${styles.disabledButton}`} disabled={true}>
                        <FileX size={20} />
                        <span>ArchivoEpub no accesible</span>
                      </button>
                    ) : isInCart ? (
                      <button className={`${styles.downloadButton} ${styles.inCartButton}`} disabled={true}>
                        <CheckCircle size={20} />
                        <span>En el carrito</span>
                      </button>
                    ) : (
                      <button className={styles.downloadButton} onClick={handleAddToCart} disabled={isAddingToCart}>
                        {isAddingToCart ? (
                          <>
                            <div className={styles.spinner} />
                            <span>Agregando...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={20} />
                            <span>Agregar al carrito</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {successMessage && (
              <div className={styles.successMessage}>
                <CheckCircle className={styles.successIcon} />
                {successMessage}
              </div>
            )}

            {error && (
              <div className={styles.errorMessage}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.synopsisSection}>
        <h2 className={styles.sectionTitle}>
          <Book className={styles.sectionIcon} />
          <span>Sinopsis</span>
        </h2>
        <p className={styles.synopsisText}>{book.synopsis || "Este libro no tiene sinopsis disponible."}</p>
      </div>
    </div>
  )
}

export default BookDetails

