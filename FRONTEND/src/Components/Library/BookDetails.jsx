import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getLibroById,
  getBookImageUrl,
  addToCart,
  getCarrito,
} from "../../services/ProfileService";
import LoadingScreen from "../Hooks/LoadingScreen";
import ErrorDisplay from "../Hooks/ErrorDisplay";
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
} from "lucide-react";
import styles from "./BookDetails.module.css";
import { AuthContext } from "../Context/AuthContext";

const BookDetails = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingLeer, setLoadingLeer] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const { userData, token } = useContext(AuthContext);

  const isOwner = userData?.username === book?.owner;
  const isPurchased = book?.is_purchased;
  const isInCart = cartItems.includes(bookId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookData = await getLibroById(bookId, token);
        setBook(bookData);

        if (token) {
          setCartLoading(true);
          const cartData = await getCarrito(token);

          if (cartData && Array.isArray(cartData.libros)) {
            const cartBookIds = cartData.libros.map((libro) => libro.id.toString());
            setCartItems(cartBookIds);
          } else {
            setCartItems([]);
          }
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
        setCartLoading(false);
      }
    };

    fetchData();
  }, [bookId, token]);

  const handleReadBook = async () => {
    setLoadingLeer(true);
    setSuccessMessage(null);

    try {
      //AQUI, SI downloadBookEpub no existe, crea una funcion de dummy.
      const response = await (async () => {
        return {
          headers: {
            get: () => {
              return "application/epub+zip";
            },
          },
        };
      })();

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("epub")) {
        throw new Error("El formato del libro no es compatible");
      }

      navigate(`/lector/${bookId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingLeer(false);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      setError("Debes iniciar sesión para agregar al carrito");
      navigate("/authForm");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(bookId, token);
      const cartData = await getCarrito(token);
      if (typeof cartData === "object" && cartData !== null && Array.isArray(cartData.libros)) {
        const updatedCartItems = cartData.libros.map((libro) => libro.id.toString());
        setCartItems(updatedCartItems);
      }
      setSuccessMessage("¡Libro agregado al carrito exitosamente!");
    } catch (error) {
      setError(error.detail || "Error al agregar al carrito");
    } finally {
      setIsAddingToCart(false);
    }
  };
    const handleEdit = () => {
        console.log("Book ID before navigation:", bookId);
        console.log("Book Object:", book);
        console.log("User Data:", userData);
        navigate(`/edit/${bookId}`);
    };

  if (isLoading || cartLoading) return <LoadingScreen />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className={styles.bookDetailsContainer}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>Volver</span>
      </button>

      <div className={styles.bookHeader}>
        <div className={styles.coverContainer}>
          <img
            src={getBookImageUrl(bookId) || "/placeholder.svg"}
            alt={`Portada de ${book.title}`}
            className={styles.bookCover}
          />
        </div>

        <div className={styles.mainContent}>
          <h1 className={styles.bookTitle}>
            <BookOpen className={styles.titleIcon} />
            <span>{book.title}</span>
          </h1>

          <div className={styles.metaGrid}>
            <button
              onClick={() => navigate(`/user/${book.owner}`)}
              className={styles.metaCard}
            >
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
                  <div className={styles.metaValue}>
                    {new Date(book.published_date).toLocaleDateString()}
                  </div>
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
              <button
                className={styles.editButton}
                onClick={handleEdit}
              >
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
                    className={styles.downloadButton}
                    onClick={handleReadBook}
                    disabled={loadingLeer}
                  >
                    {loadingLeer ? (
                      <>
                        <div className={styles.spinner} />
                        <span>Cargando libro...</span>
                      </>
                    ) : (
                      <>
                        <BookOpen size={20} />
                        <span>Leer ahora</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className={styles.downloadButton}
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || isInCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <div className={styles.spinner} />
                        <span>Agregando...</span>
                      </>
                    ) : isInCart ? (
                      <>
                        <ShoppingCart size={20} />
                        <span>En el carrito</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        <span>Agregar al carrito</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {successMessage && (
              <div className={styles.successMessage}>
                <CheckCircle className={styles.successIcon} />
                {successMessage}
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
        <p className={styles.synopsisText}>
          {book.synopsis || "Este libro no tiene sinopsis disponible."}
        </p>
      </div>
    </div>
  );
};

export default BookDetails;