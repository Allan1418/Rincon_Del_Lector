"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserByUsername,
  getProfileImage,
  followUser,
  unfollowUser,
  createBook,
  getLibros,
  getBookImageUrl,
  deleteLibro,
} from "../../services/ProfileService";
import styles from "./ProfileSection.module.css";
import ErrorDisplay from "../Hooks/ErrorDisplay";
import LoadingScreen from "../Hooks/LoadingScreen";
import { AuthContext } from "../Context/AuthContext";
import { Book, ShoppingCart, Bookmark, Eye, User, Users, Edit, PlusCircle, Calendar, Heart, Clock, BookOpen, Trash2Icon } from 'lucide-react';

const defaultProfileImage = "/images/Avatar.png";

const UserProfile = () => {
  const { username } = useParams();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [profileState, setProfileState] = useState({
    data: null,
    imageUrl: defaultProfileImage,
    isLoading: true,
    error: null,
    isUpdating: false,
  });
  const [bookData, setBookData] = useState({ title: "", synopsis: "", price: 0 });
  const [bookError, setBookError] = useState(null);
  const [bookSuccess, setBookSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("published");
  const [publishedBooks, setPublishedBooks] = useState([]);
  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const token = localStorage.getItem("Authorization");
  const [showFullBio, setShowFullBio] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    setProfileState((prevState) => ({ ...prevState, isLoading: true, error: null }));
    try {
      const data = await getUserByUsername(username, token);
      setProfileState((prevState) => ({
        ...prevState,
        data,
        imageUrl: data.image_name ? getProfileImage(data.image_name) : defaultProfileImage,
      }));
    } catch (err) {
      setProfileState((prevState) => ({ ...prevState, error: err }));
    } finally {
      setProfileState((prevState) => ({ ...prevState, isLoading: false }));
    }
  };

  const fetchPublishedBooks = async () => {
    try {
      const books = await getLibros(token, null, true);
      if (books && books.results) {
        const ownerBooks = books.results.filter((book) => book.owner === username);
        setPublishedBooks(ownerBooks);
      }
    } catch (err) {
      console.error("Error fetching published books:", err);
    }
  };

  const fetchPurchasedBooks = async () => {
    try {
      const books = await getLibros(token, null, null, null, true);
      if (books && books.results) {
        setPurchasedBooks(books.results);
      }
    } catch (err) {
      console.error("Error fetching purchased books:", err);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      alert("🔒 Debes iniciar sesión para realizar esta acción.");
      return;
    }

    setProfileState((prevState) => ({ ...prevState, isUpdating: true }));
    try {
      if (profileState.data.is_following) {
        await unfollowUser(username, token);
      } else {
        await followUser(username, token);
      }
      await fetchUserProfile();
    } catch (err) {
      alert("❌ Error al procesar la solicitud.");
      console.error("💥 Error al seguir/dejar de seguir:", err);
    } finally {
      setProfileState((prevState) => ({ ...prevState, isUpdating: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    setBookError(null);
    setBookSuccess(null);

    if (!isAuthenticated) {
      setBookError("🔒 Debes iniciar sesión para agregar un libro.");
      return;
    }

    try {
      const newBook = await createBook(bookData, token);
      setBookSuccess(`✅ Libro "${newBook.title}" agregado con éxito.`);
      setBookData({ title: "", price: "", synopsis: "" });
      if (newBook.owner === username) {
        fetchPublishedBooks();
      }

      setTimeout(() => {
        setShowBookForm(false);
        setBookSuccess(null);
      }, 2000);
    } catch (err) {
      setBookError("❌ Error al agregar el libro. Verifica los datos e inténtalo de nuevo.");
      console.error("💥 Error al agregar libro:", err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchPublishedBooks();
    fetchPurchasedBooks();
  }, [username, token]);

  if (profileState.isLoading) return <LoadingScreen />;
  if (profileState.error) return <ErrorDisplay error={profileState.error} />;

  const truncateSynopsis = (synopsis, maxLength) => {
    if (!synopsis) return "";
    if (synopsis.length <= maxLength) return synopsis;
    return synopsis.substring(0, maxLength) + "...";
  };

  const handleViewDetails = (bookId) => {
    navigate(`/libros/${bookId}`);
  };

  const handleEditBook = (bookId) => {
    navigate(`/edit-book/${bookId}`);
  };

  const toggleBookForm = () => {
    setShowBookForm(!showBookForm);
    if (!showBookForm) {
      setBookData({ title: "", price: "", synopsis: "" });
      setBookError(null);
      setBookSuccess(null);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este libro?")) {
      try {
        await deleteLibro(bookId, token);
        fetchPublishedBooks(); 
      } catch (err) {
        console.error("Error al eliminar el libro:", err);
        alert("❌ Error al eliminar el libro.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.headerBackground}></div>
        <div className={styles.profileContent}>
          <div className={styles.profileImageWrapper}>
            <img
              src={profileState.imageUrl || "/placeholder.svg"}
              alt={`Imagen de perfil de ${profileState.data?.username}`}
              className={styles.profileImage}
              onError={() => setProfileState((prevState) => ({ ...prevState, imageUrl: defaultProfileImage }))}
            />
          </div>

          <div className={styles.profileDetails}>
            <div className={styles.nameAndActions}>
              <div className={styles.nameSection}>
                <h1 className={styles.username}>
                  {profileState.data?.username}
                  {profileState.data?.verified && <span className={styles.verifiedBadge}>✓</span>}
                </h1>
                <p className={styles.userRole}>Autor</p>
              </div>

              {isAuthenticated && (
                <button
                  className={`${styles.followButton} ${profileState.data.is_following ? styles.following : ""}`}
                  onClick={handleFollow}
                  disabled={profileState.isUpdating}
                >
                  {profileState.isUpdating
                    ? profileState.data.is_following ? "Dejando de seguir..." : "Siguiendo..."
                    : profileState.data.is_following ? (
                      <>
                        <Heart size={16} className={styles.buttonIcon} />
                        Siguiendo
                      </>
                    ) : (
                      <>
                        <Users size={16} className={styles.buttonIcon} />
                        Seguir
                      </>
                    )}
                </button>
              )}
            </div>

            {profileState.data?.about && (
              <div className={styles.bioSection}>
                <p className={styles.bioText}>
                  {showFullBio ? profileState.data.about : truncateSynopsis(profileState.data.about, 200)}
                  {profileState.data.about.length > 200 && (
                    <button
                      className={styles.readMoreButton}
                      onClick={() => setShowFullBio(!showFullBio)}
                    >
                      {showFullBio ? "Ver menos" : "Ver más"}
                    </button>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{profileState.data?.follower_count || 0}</div>
          <div className={styles.statLabel}>
            <Users size={16} className={styles.statIcon} />
            Seguidores
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{profileState.data?.following_count || 0}</div>
          <div className={styles.statLabel}>
            <User size={16} className={styles.statIcon} />
            Siguiendo
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{publishedBooks.length}</div>
          <div className={styles.statLabel}>
            <Book size={16} className={styles.statIcon} />
            Mis Libros
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{purchasedBooks.length}</div>
          <div className={styles.statLabel}>
            <ShoppingCart size={16} className={styles.statIcon} />
            Comprados
          </div>
        </div>
      </div>

      <div className={styles.contentSection}>
        <div className={styles.contentHeader}>
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabButton} ${activeTab === "published" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("published")}
            >
              <BookOpen size={18} className={styles.tabIcon} />
              Publicaciones
            </button>

              <button
                className={`${styles.tabButton} ${activeTab === "purchased" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("purchased")}
              >
                <ShoppingCart size={18} className={styles.tabIcon} />
                Biblioteca
              </button>
          </div>

            <button
              className={styles.createBookButton}
              onClick={toggleBookForm}
            >
              <PlusCircle size={18} className={styles.buttonIcon} />
              {showBookForm ? "Cancelar" : "Publicar libro"}
            </button>
        </div>

        {showBookForm && (
          <div className={styles.bookFormContainer}>
            <h3 className={styles.formTitle}>Publicar un nuevo libro</h3>
            <form onSubmit={handleCreateBook} className={styles.bookForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Título del libro</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Escribe el título de tu libro"
                  value={bookData.title}
                  onChange={handleInputChange}
                  required
                  className={styles.bookInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Precio</label>
                <input
                  type="number"
                  name="price"
                  placeholder="Establece un precio"
                  value={bookData.price}
                  onChange={handleInputChange}
                  required
                  className={styles.bookInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Sinopsis</label>
                <textarea
                  name="synopsis"
                  placeholder="Escribe una breve descripción de tu libro"
                  value={bookData.synopsis}
                  onChange={handleInputChange}
                  required
                  className={styles.bookTextarea}
                />
              </div>

              <button type="submit" className={styles.bookButton}>
                <Book size={18} className={styles.buttonIcon} />
                Publicar libro
              </button>
            </form>
            {bookError && <p className={styles.errorMessage}>{bookError}</p>}
            {bookSuccess && <p className={styles.successMessage}>{bookSuccess}</p>}
          </div>
        )}

        <div className={styles.booksContainer}>
          {activeTab === "published" ? (
            <>
              {publishedBooks.length > 0 ? (
                <div className={styles.booksGrid}>
                  {publishedBooks.map((book) => (
                    <div key={book.id} className={styles.bookCard}>
                      <div className={styles.bookCoverWrapper}>
                        <img src={getBookImageUrl(book.id) || "/placeholder.svg"}
                          alt={`Portada de ${book.title}`}
                          className={styles.bookCover} />
                        <div className={styles.bookOverlay}>
                          <div className={styles.bookActions}>

                            <button
                              className={styles.bookActionButton}
                              onClick={() => handleViewDetails(book.id)}>
                              <Eye size={16} />
                              Ver
                            </button>

                            <button
                              className={`${styles.bookActionButton} ${styles.editButton}`}
                              onClick={() => handleEditBook(book.id)}>
                              <Edit size={18} className={styles.actionIcon} />
                              <span>Editar</span>
                            </button>

                            <button
                              className={`${styles.bookActionButton} ${styles.deleteButton}`}
                              onClick={() => handleDeleteBook(book.id)}>
                              <Trash2Icon size={18} className={styles.actionIcon} />
                              <span>Eliminar</span>
                            </button>

                          </div>
                        </div>
                      </div>
                      <div className={styles.bookInfo}>
                        <h3 className={styles.bookTitle}>{book.title}</h3>
                        <div className={styles.bookPrice}>${book.price}</div>
                        <div className={styles.bookMeta}>
                          <span className={styles.bookDate}>
                            <Calendar size={14} />
                            {formatDate(book.published_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <Book size={48} />
                  </div>
                  <h3 className={styles.emptyStateTitle}>No hay libros publicados</h3>
                  <p className={styles.emptyStateText}>Este usuario aún no ha publicado ningún libro</p>
                    <button
                      className={styles.emptyStateButton}
                      onClick={toggleBookForm}
                    >
                      <PlusCircle size={18} />
                      Publicar mi primer libro
                    </button>
                </div>
              )}
            </>
          ) : (
            <>
              {purchasedBooks.length > 0 ? (
                <div className={styles.booksGrid}>
                  {purchasedBooks.map((book) => (
                    <div key={book.id} className={styles.bookCard}>
                      <div className={styles.bookCoverWrapper}>
                        <img src={getBookImageUrl(book.id) || "/placeholder.svg"} alt={`Portada de ${book.title}`} className={styles.bookCover} />
                        <div className={styles.bookOverlay}>
                          <div className={styles.bookActions}>
                            <button
                              className={styles.bookActionButton}
                              onClick={() => handleViewDetails(book.id)}
                            >
                              <Bookmark size={16} />
                              Leer
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className={styles.bookInfo}>
                        <h3 className={styles.bookTitle}>{book.title}</h3>
                        <p className={styles.bookAuthor}>
                          <User size={14} />
                          por {book.owner}
                        </p>
                        <p className={styles.bookSynopsis}>
                          {truncateSynopsis(book.synopsis, 100)}
                        </p>
                        <div className={styles.bookMeta}>
                          <span className={styles.purchaseDate}>
                            <Clock size={14} />
                            Comprado el {formatDate(book.published_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <ShoppingCart size={48} />
                  </div>
                  <h3 className={styles.emptyStateTitle}>No hay libros comprados</h3>
                  <p className={styles.emptyStateText}>Este usuario aún no ha comprado ningún libro</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;