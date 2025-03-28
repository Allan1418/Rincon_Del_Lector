import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getUserByUsername, followUser, unfollowUser } from '../../services/ProfileService';
import styles from './ProfileSection.module.css';
import ErrorDisplay from '../Hooks/ErrorDisplay';
import LoadingScreen from '../Hooks/LoadingScreen';
import { AuthContext } from '../Context/AuthContext';


const ProfileSection = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
    const { isAuthenticated} = useContext(AuthContext);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('Authorization');
        const data = await getUserByUsername(username, token);
        setProfileData(data);
      } catch (err) {
        setError(err.message || 'Ocurrió un error al cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username]);

  const handleFollow = useCallback(async () => {
    const token = localStorage.getItem('Authorization');
    if (!token) {
      setError('🔒 Debes iniciar sesión para realizar esta acción.');
      return;
    }

    setIsUpdating(true);
    try {
      if (profileData.is_following) {
        await unfollowUser(username, token);
      } else {
        await followUser(username, token);
      }
      const updatedData = await getUserByUsername(username, token);
      setProfileData(updatedData);
      setIsUpdating(false);
    } catch (err) {
      console.error('💥 Error en acción de seguir/dejar de seguir:', err);
      setError(err.message || 'Error al procesar la solicitud');
      setIsUpdating(false);
    }
  }, [profileData, username]);

  if (loading) return <LoadingScreen/>;

  return (
    <div className={styles.profileContainer}>
      {error && <ErrorDisplay error={error} />}
      <div className={styles.header}>
        <h1>{profileData.username}</h1>
            <button
            className={`${styles.followButton} ${profileData.is_following ? styles.following : ''}`}
            onClick={handleFollow}
            disabled={isUpdating}
            >
            {isUpdating ? '🔄 Procesando...' : (profileData.is_following ? '✅ Dejar de seguir' : '👥 Seguir')}
            </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{profileData.follower_count}</span>
          <span>Seguidores</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{profileData.following_count}</span>
          <span>Siguiendo</span>
        </div>
      </div>

      {profileData.about && (
        <div className={styles.bio}>
          <h3>📖 Biografía</h3>
          <p>{profileData.about}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;