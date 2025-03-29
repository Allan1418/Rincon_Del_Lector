"use client"

import { useState, useEffect, useContext } from "react"
import { useParams } from "react-router-dom"
import { getUserByUsername, getProfileImage, followUser, unfollowUser } from "../../services/ProfileService"
import styles from "./ProfileSection.module.css"
import ErrorDisplay from "../Hooks/ErrorDisplay"
import LoadingScreen from "../Hooks/LoadingScreen"
import { AuthContext } from "../Context/AuthContext"

const defaultProfileImage = "/images/index.svg"

const UserProfile = () => {
  const { username } = useParams()
  const { isAuthenticated, user } = useContext(AuthContext)
  const [profileState, setProfileState] = useState({
    data: null,
    imageUrl: defaultProfileImage,
    isLoading: true,
    error: null,
    isUpdating: false,
  })
  const token = localStorage.getItem("Authorization")

  useEffect(() => {
    fetchUserProfile()
  }, [username, token])

  const fetchUserProfile = async () => {
    setProfileState((prevState) => ({ ...prevState, isLoading: true, error: null }))
    try {
      const data = await getUserByUsername(username, token)
      setProfileState((prevState) => ({
        ...prevState,
        data,
        imageUrl: data.image_name ? getProfileImage(data.image_name) : defaultProfileImage,
      }))
    } catch (err) {
      setProfileState((prevState) => ({ ...prevState, error: err }))
    } finally {
      setProfileState((prevState) => ({ ...prevState, isLoading: false }))
    }
  }

  const handleFollow = async () => {
    if (!isAuthenticated) {
      alert("🔒 Debes iniciar sesión para realizar esta acción.")
      return
    }

    setProfileState((prevState) => ({ ...prevState, isUpdating: true }))
    try {
      if (profileState.data.is_following) {
        await unfollowUser(username, token)
      } else {
        await followUser(username, token)
      }
      await fetchUserProfile()
    } catch (err) {
      alert("❌ Error al procesar la solicitud.")
      console.error("💥 Error al seguir/dejar de seguir:", err)
    } finally {
      setProfileState((prevState) => ({ ...prevState, isUpdating: false }))
    }
  }

  if (profileState.isLoading) return <LoadingScreen />
  if (profileState.error) return <ErrorDisplay error={profileState.error} />

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.profileImageContainer}>
          <img
            src={profileState.imageUrl}
            alt={`Imagen de perfil de ${profileState.data?.username}`}
            className={styles.profileImage}
            onError={() => setProfileState((prevState) => ({ ...prevState, imageUrl: defaultProfileImage }))}
          />
        </div>
        <h1 className={styles.username}>{profileState.data?.username}</h1>

        {isAuthenticated && user?.username !== username && (
          <button
            className={`${styles.followButton} ${profileState.data.is_following ? styles.following : ""}`}
            onClick={handleFollow}
            disabled={profileState.isUpdating}
          >
            {profileState.isUpdating
              ? profileState.data.is_following ? "🔄 Dejando de seguir..." : "🔄 Siguiendo..."
              : profileState.data.is_following ? "✅ Dejar de seguir" : "👥 Seguir"}
          </button>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{profileState.data?.follower_count || 0}</span>
          <span className={styles.statLabel}>Seguidores</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{profileState.data?.following_count || 0}</span>
          <span className={styles.statLabel}>Siguiendo</span>
        </div>
      </div>

      {profileState.data?.about && (
        <div className={styles.bio}>
          <h3>📖 Biografía</h3>
          <p>{profileState.data.about}</p>
        </div>
      )}
    </div>
  )
}

export default UserProfile