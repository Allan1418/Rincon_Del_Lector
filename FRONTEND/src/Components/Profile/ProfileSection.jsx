import React, { useState } from 'react';
import styles from "./ProfileSection.module.css";
import { FiEdit } from "react-icons/fi";
import ModalEditarProfile from './ModalProfile/ModalEditarProfile';
import { updateUserProfile } from '../../services/ProfileService';
import { useUserData } from '../Hooks/useUserData';

export default function ProfileSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { profileData, isLoading, error } = useUserData();

  if (isLoading) {
    return <div>Cargando perfil...</div>;
  }

  if (error) {
    return <div>Error al cargar el perfil: {error.message}</div>;
  }

  const handleSaveModal = (formData) => {
    const token = localStorage.getItem('Authorization');
    if (!token) return Promise.reject('No hay token');

    return updateUserProfile(token, formData)
      .then(data => {
        setIsModalOpen(false);
        return data;
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        throw error;
      });
  };

  const handleEditProfileClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.profileSection}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarWrapper}>
                <img src={profileData.image} alt='' className={styles.avatar} />
                <button className={styles.avatarEdit}>
                  <FiEdit className={styles.editIcon} />
                </button>
              </div>
              <div className={styles.profileActions}>
                <a href={`/${profileData.username}/changed`} > <button className={styles.editProfile}> Cambiar datos Personales</button> </a>
                <button className={styles.followButton}>Seguir</button>
              </div>
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.nameSection}>
                <h1 className={styles.name}>{profileData.username}</h1>
                <span className={styles.verifiedBadge}>✓ Verificado</span>
                <button className={styles.editProfile} onClick={handleEditProfileClick}>
                  <FiEdit /> Editar perfil
                </button>
              </div>
              <p className={styles.bio}>{profileData.about}</p>
              <div className={styles.metaInfo}>
                <p className={styles.website}> Mi Correo: <a>{profileData.email}</a></p>
                <p className={styles.website}> Mi nombre es: {profileData.first_name} {profileData.last_name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalEditarProfile
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userInfo={profileData}
        onSave={handleSaveModal}
      />
    </div>
  );
}