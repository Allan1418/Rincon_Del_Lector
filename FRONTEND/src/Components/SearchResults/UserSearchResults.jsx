import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import styles from './UserSearchResults.module.css'; // Importa el CSS Module

const UserSearchResults = () => {
  const location = useLocation();
  const searchResults = location.state?.results || [];
  const searchTerm = location.state?.searchQuery || '';
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getAnimationDelay = (index) => {
    return { animationDelay: `${index * 0.05}s` };
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchHeader}>
        <h1 className={styles.title}>Búsqueda de Usuarios</h1>
        {searchTerm && (
          <p className={styles.searchQuery}>
            Resultados para <span className={styles.highlight}>"{searchTerm}"</span>
          </p>
        )}
      </div>

      {isLoading && (
        <div className={styles.resultsGrid}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className={`${styles.userCard} ${styles.skeleton}`}>
              <div className={styles.avatarSkeleton}></div>
              <div className={styles.infoSkeleton}>
                <div className={styles.nameSkeleton}></div>
                <div className={styles.subSkeleton}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && searchResults.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No se encontraron usuarios</h3>
          <p className={styles.emptyDescription}>
            No pudimos encontrar usuarios que coincidan con tu búsqueda.
            Intenta con otros términos o revisa la ortografía.
          </p>
        </div>
      )}

      {!isLoading && searchResults.length > 0 && (
        <div className={styles.resultsGrid}>
          {searchResults.map((user, index) => (
            <Link
              to={`/user/${user.username}`}
              key={user.username}
              className={`${styles.userCard} ${styles.fadeIn}`}
              style={getAnimationDelay(index)}
            >
              <img
                src={user.image || "/placeholder.svg"}
                alt={user.username}
                className={styles.avatar}
              />
              <div className={styles.userInfo}>
                <h3 className={styles.userInfoH3}>{user.username}</h3>
                <span className={styles.viewProfile}>Ver perfil</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearchResults;