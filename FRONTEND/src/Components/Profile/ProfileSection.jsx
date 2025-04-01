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
  getFollowers,
  getFollowing,
} from "../../services/ProfileService";
import styles from "./ProfileSection.module.css";
import ErrorDisplay from "../Hooks/ErrorDisplay";
import LoadingScreen from "../Hooks/LoadingScreen";
import { AuthContext } from "../Context/AuthContext";
import {
  Book,
  ShoppingCart,
  Users,
  User,
  PlusCircle,
  Calendar,
  Heart,
  Clock,
} from "lucide-react";

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
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const token = localStorage.getItem("Authorization");
  const [showFullBio, setShowFullBio] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    setProfileState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await getUserByUsername(username, token);
      setProfileState((prev) => ({
        ...prev,
        data,
        imageUrl: data.image_name ? getProfileImage(data.image_name) : defaultProfileImage,
      }));
    } catch (err) {
      setProfileState((prev) => ({ ...prev, error: err }));
    } finally {
      setProfileState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const fetchPublishedBooks = async () => {
    try {
      const books = await getLibros(token, null, true);
      if (books?.results) {
        setPublishedBooks(books.results.filter((book) => book.owner === username));
      }
    } catch (err) {
      console.error("Error fetching published books:", err);
    }
  };

  const fetchPurchasedBooks = async () => {
    try {
      const books = await getLibros(token, null, null, null, true);
      setPurchasedBooks(books?.results || []);
    } catch (err) {
      console.error("Error fetching purchased books:", err);
    }
  };

  const fetchFollowers = async () => {
    setFollowersList([]);
    try {
      const response = await getFollowers(username, token);
      setFollowersList(response.results || response || []);
    } catch (err) {
      setFollowersList([]);
    }
  };

  const fetchFollowing = async () => {
    setFollowingList([]);
    try {
      const response = await getFollowing(username, token);
      setFollowingList(response.results || response || []);
    } catch (err) {
      setFollowingList([]);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      alert("🔒 Debes iniciar sesión para realizar esta acción.");
      return;
    }

    setProfileState((prev) => ({ ...prev, isUpdating: true }));
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
      setProfileState((prev) => ({ ...prev, isUpdating: false }));
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
      if (newBook.owner === username) fetchPublishedBooks();

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
    const fetchData = async () => {
      await fetchUserProfile();
      await fetchPublishedBooks();
      await fetchPurchasedBooks();
    };

    fetchData();

    return () => {
      setProfileState({
        data: null,
        imageUrl: defaultProfileImage,
        isLoading: true,
        error: null,
        isUpdating: false,
      });
      setPublishedBooks([]);
      setPurchasedBooks([]);
      setFollowersList([]);
      setFollowingList([]);
    };
  }, [username, token]);

  useEffect(() => {
    if (activeTab === "followers") fetchFollowers();
    if (activeTab === "following") fetchFollowing();
  }, [activeTab]);

  if (profileState.isLoading) return <LoadingScreen />;
  if (profileState.error) return <ErrorDisplay error={profileState.error} />;

  const truncateSynopsis = (synopsis, maxLength) => {
    if (!synopsis) return "";
    return synopsis.length <= maxLength ? synopsis : `${synopsis.substring(0, maxLength)}...`;
  };

  const handleViewDetails = (bookId) => navigate(`/libros/${bookId}`);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "published":
        return renderBooks(publishedBooks, true);
      case "purchased":
        return renderBooks(purchasedBooks, false);
      case "followers":
        return renderUsers(followersList, "No hay seguidores", "Este usuario aún no tiene seguidores");
      case "following":
        return renderUsers(followingList, "No estás siguiendo a nadie", "Aún no sigues a otros usuarios");
      default:
        return null;
    }
  };

  const renderUsers = (users, emptyTitle, emptyText) => {
    if (users.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Users size={48} />
          </div>
          <h3 className={styles.emptyStateTitle}>{emptyTitle}</h3>
          <p className={styles.emptyStateText}>{emptyText}</p>
        </div>
      );
    }

    return (
      <div className={styles.usersGrid}>
        {users.map((user) => (
          <UserCard key={user.username} user={user} navigate={navigate} />
        ))}
      </div>
    );
  };

  const UserCard = ({ user, navigate }) => {
    const imageUrl = user.image_name ? getProfileImage(user.image_name) : defaultProfileImage;

    return (
      <div className={styles.userCard} onClick={() => navigate(`/user/${user.username}`)}>
        <div className={styles.userImageContainer}>
          <img src={imageUrl || "/placeholder.svg"} alt={`Perfil de ${user.username}`} className={styles.userImage} />
        </div>
        <div className={styles.userInfo}>
          <h4 className={styles.userName}>
            {user.username}
            {user.verified && <span className={styles.verifiedBadge}>✓</span>}
          </h4>
          <div className={styles.userStats}>
            <span className={styles.userStat}>
              <Users size={14} /> {user.follower_count}
            </span>
            <span className={styles.userStat}>
              <Book size={14} /> {user.books_count}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderBooks = (books, isPublished) => {
    if (books.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Book size={48} />
          </div>
          <h3 className={styles.emptyStateTitle}>
            {isPublished ? "No hay libros publicados" : "No hay libros comprados"}
          </h3>
          <p className={styles.emptyStateText}>
            {isPublished ? "Este usuario aún no ha publicado ningún libro" : "Este usuario aún no ha comprado ningún libro"}
          </p>
          {isPublished && (
            <button className={styles.emptyStateButton} onClick={() => setShowBookForm(true)}>
              <PlusCircle size={18} />
              Publicar mi primer libro
            </button>
          )}
        </div>
      );
    }

    return (
      <div className={styles.booksGrid}>
        {books.map((book) => (
          <div key={book.id} className={styles.bookCard} onClick={() => handleViewDetails(book.id)}>
            <div className={styles.bookCoverWrapper}>
              <img src={getBookImageUrl(book.id) || "/placeholder.svg"} alt={`Portada de ${book.title}`} className={styles.bookCover} />
            </div>
            <div className={styles.bookInfo}>
              <h3 className={styles.bookTitle}>{book.title}</h3>
              {isPublished ? (
                <>
                  <div className={styles.bookMeta}>
                    <span className={styles.bookDate}>
                      <Calendar size={14} />
                      {formatDate(book.published_date)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.bookAuthor}>
                    <User size={14} />
                    por {book.owner}
                  </p>
                  <p className={styles.bookSynopsis}>{truncateSynopsis(book.synopsis, 100)}</p>
                  <div className={styles.bookMeta}>
                    <span className={styles.purchaseDate}>
                      <Clock size={14} />
                      Comprado el {formatDate(book.published_date)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
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
              onError={() => setProfileState((prev) => ({ ...prev, imageUrl: defaultProfileImage }))}
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
                  {profileState.isUpdating ? (
                    profileState.data.is_following ? "Dejando de seguir..." : "Siguiendo..."
                  ) : (
                    <>
                      {profileState.data.is_following ? <Heart size={16} /> : <Users size={16} />}
                      {profileState.data.is_following ? "Siguiendo" : "Seguir"}
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
                    <button className={styles.readMoreButton} onClick={() => setShowFullBio(!showFullBio)}>
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
        <button className={styles.statCard} onClick={() => setActiveTab("followers")}>
          <div className={styles.statValue}>{profileState.data?.follower_count || 0}</div>
          <div className={styles.statLabel}>
            <Users size={16} />
            Seguidores
          </div>
        </button>

        <button className={styles.statCard} onClick={() => setActiveTab("following")}>
          <div className={styles.statValue}>{profileState.data?.following_count || 0}</div>
          <div className={styles.statLabel}>
            <User size={16} />
            Siguiendo
          </div>
        </button>

        <button className={styles.statCard} onClick={() => setActiveTab("published")}>
          <div className={styles.statValue}>{publishedBooks.length}</div>
          <div className={styles.statLabel}>
            <Book size={16} />
            Mis Libros
          </div>
        </button>

        <button className={styles.statCard} onClick={() => setActiveTab("purchased")}>
          <div className={styles.statValue}>{purchasedBooks.length}</div>
          <div className={styles.statLabel}>
            <ShoppingCart size={16} />
            Comprados
          </div>
        </button>
      </div>

      <div className={styles.contentSection}>
        <div className={styles.contentHeader}>
          <button className={styles.createBookButton} onClick={() => setShowBookForm(!showBookForm)}>
            <PlusCircle size={18} />
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
                <Book size={18} />
                Publicar libro
              </button>
            </form>
            {bookError && <p className={styles.errorMessage}>{bookError}</p>}
            {bookSuccess && <p className={styles.successMessage}>{bookSuccess}</p>}
          </div>
        )}

        <div className={styles.booksContainer}>{renderContent()}</div>
      </div>
    </div>
  );
};

export default UserProfile;