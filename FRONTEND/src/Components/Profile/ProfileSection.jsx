import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserByUsername,
  getProfileImage,
  followUser,
  unfollowUser,
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
import { FaUserCircle } from 'react-icons/fa'; // Import the user circle icon

const UserProfile = () => {
  const { username } = useParams();
  const { userData, isAuthenticated, token } = useContext(AuthContext);
  const [profileState, setProfileState] = useState({
    data: null,
    imageUrl: null,
    isLoading: true,
    error: null,
    isUpdating: false,
  });

  const [activeTab, setActiveTab] = useState("published");
  const [publishedBooks, setPublishedBooks] = useState([]);
  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [showFullBio, setShowFullBio] = useState(false);
  const navigate = useNavigate();

  const fetchUserProfile = async (signal) => {
    setProfileState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await getUserByUsername(username, token, { signal });
      setProfileState((prev) => ({
        ...prev,
        data,
        imageUrl: data.image_name ? getProfileImage(data.image_name) : null, // No default image
      }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        setProfileState((prev) => ({ ...prev, error: err }));
      }
    } finally {
      setProfileState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const fetchPublishedBooks = async (page = 1, signal) => {
    try {
      const response = await getLibros(
        token,
        username,
        "-published_date",
        null,
        page,
        null,
        null,
        { signal }
      );

      setPublishedBooks(prev => page === 1
        ? response.results || []
        : [...prev, ...(response.results || [])]
      );

      return response.next;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Error fetching published books:", err);
      }
      return false;
    }
  };

  const fetchPurchasedBooks = async (page = 1, signal) => {
    try {
      const response = await getLibros(
        token,
        null,
        null,
        null,
        page,
        true,
        null,
        { signal }
      );

      setPurchasedBooks(prev => page === 1
        ? response.results || []
        : [...prev, ...(response.results || [])]
      );

      return response.next;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Error fetching purchased books:", err);
      }
      return false;
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

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const loadData = async () => {
        try {
            await fetchUserProfile(signal);
            await fetchPublishedBooks(1, signal);
            if (userData?.username === username) {
                await fetchPurchasedBooks(1, signal);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("Error loading data:", err);
            }
        }
    };

    loadData();

    return () => {
        abortController.abort();
    };
}, [username, token, userData?.username]);

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
    const imageUrl = user.image_name ? getProfileImage(user.image_name) : null;

    return (
      <div className={styles.userCard} onClick={() => navigate(`/user/${user.username}`)}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Perfil de ${user.username}`}
            className={styles.userImage}
          />
        ) : (
          <div className={styles.avatarFallback}>
            <FaUserCircle className={styles.fallbackIcon} />
            <span className={styles.avatarInitial}>{user.username.charAt(0).toUpperCase()}</span>
          </div>
        )}

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
                    {book.owner}
                  </p>
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

  const isOwnProfile = userData?.username === profileState.data?.username;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.headerBackground}></div>
        <div className={styles.profileContent}>
          <div className={styles.profileImageWrapper}>
            {/* Lógica para la imagen grande */}
            {profileState.imageUrl ? (
              <img
                src={profileState.imageUrl}
                alt={`Imagen de perfil de ${profileState.data?.username}`}
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.avatarFallback}>
                <FaUserCircle className={styles.fallbackIcon} />
                <span className={styles.avatarInitial}>{profileState.data?.username.charAt(0).toUpperCase()}</span>
              </div>
            )}
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

              {!isOwnProfile && (
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
        <button className={styles.statCard} onClick={() => setActiveTab("followers")} disabled={!isOwnProfile}>
          <div className={styles.statValue}>{profileState.data?.follower_count || 0}</div>
          <div className={styles.statLabel}>
            <Users size={16} />
            Seguidores
          </div>
        </button>

        <button className={styles.statCard} onClick={() => setActiveTab("following")} disabled={!isOwnProfile}>
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
        {isOwnProfile && (
          <button className={styles.statCard} onClick={() => setActiveTab("purchased")} disabled={!isOwnProfile}>
            <div className={styles.statValue}>{purchasedBooks.length}</div>
            <div className={styles.statLabel}>
              <ShoppingCart size={16} />
              Comprados
            </div>
          </button>
        )}
      </div>

      <div className={styles.contentSection}>
        <div className={styles.contentHeader}>
          {isOwnProfile && (
            <button className={styles.createBookButton} onClick={() => navigate(`/user/${profileState.data?.username}/crearLibro`)}>
              <PlusCircle size={18} />
              Publicar libro
            </button>
          )}
        </div>
        <div className={styles.booksContainer}>{renderContent()}</div>
      </div>
    </div>
  );
};

export default UserProfile;