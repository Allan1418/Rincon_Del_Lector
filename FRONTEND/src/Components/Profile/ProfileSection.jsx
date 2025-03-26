import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from "./ProfileSection.module.css";
import { FiEdit } from "react-icons/fi";
import { getUserByUsername } from '../../services/ProfileService';
import LoadingScreen from '../Hooks/LoadingScreen';

export default function ProfileSection() {
    const { username } = useParams();
    const [profileData, setProfileData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUserByUsername(username);
                setProfileData(data);
                setLoading(false);
            } catch (err) {
                console.error('Error obteniendo perfil:', err);
                setError(err.message || 'Error al cargar el perfil');
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    if (loading) return <LoadingScreen />;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.profileSection}>
                        <div className={styles.profileHeader}>
                            <div className={styles.avatarWrapper}>
                                <img 
                                    src={profileData.image || '/default-avatar.png'} 
                                    alt='Avatar' 
                                    className={styles.avatar} 
                                />
                                <button className={styles.avatarEdit}>
                                    <FiEdit className={styles.editIcon} />
                                </button>
                            </div>
                            <div className={styles.profileActions}>
                                <button className={styles.followButton}>Seguir</button>
                            </div>
                        </div>
                        <div className={styles.profileInfo}>
                            <div className={styles.nameSection}>
                                <h1 className={styles.name}>{profileData.username}</h1>
                                <span className={styles.verifiedBadge}>✓ Verificado</span>
                            </div>
                            <p className={styles.bio}>{profileData.about || 'Sin descripción'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}