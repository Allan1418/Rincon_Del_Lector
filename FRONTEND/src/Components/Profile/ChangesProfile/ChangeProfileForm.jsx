import React, { useState } from 'react';
import { changePassword, updateUserProfile } from '../../../services/ProfileService';
import { useUserData } from '../../Hooks/useUserData';
import styles from './ChangeProfileForm.module.css';

function ChangePasswordProfileForm() {
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const { profileData, isLoading, error: profileError } = useUserData();

    const [formData, setFormData] = useState({
        username: '',
        email: ''
    });

    React.useEffect(() => {
        if (profileData) {
            setFormData({
                username: profileData.username || '',
                email: profileData.email || ''
            });
        }
    }, [profileData]);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (newPassword1 !== newPassword2) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        const token = localStorage.getItem('Authorization');
        if (!token) {
            setError('No estás autenticado.');
            return;
        }

        try {
            await changePassword(newPassword1, newPassword2, token);
            setSuccessMessage('Contraseña cambiada con éxito.');
            setNewPassword1('');
            setNewPassword2('');
        } catch (err) {
            setError(err.message || 'Error al cambiar la contraseña.');
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            const token = localStorage.getItem('Authorization');
            await updateUserProfile(token, formData);
            setSuccessMessage('Perfil actualizado con éxito!');
        } catch (err) {
            setError(err.message || 'Error al actualizar el perfil');
        }
    };

    if (isLoading) {
        return <div className={styles.loading}>Cargando...</div>;
    }

    if (profileError) {
        return <div className={styles.error}>Error cargando perfil: {profileError}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Configuración de Cuenta</h2>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}
            {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

            <div className={styles.formContainer}>
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Seguridad</h3>
                    <form onSubmit={handlePasswordSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nueva Contraseña</label>
                            <input
                                type="password"
                                value={newPassword1}
                                onChange={(e) => setNewPassword1(e.target.value)}
                                className={styles.input}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Confirmar Contraseña</label>
                            <input
                                type="password"
                                value={newPassword2}
                                onChange={(e) => setNewPassword2(e.target.value)}
                                className={styles.input}
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" className={styles.primaryButton}>
                            Actualizar Contraseña
                        </button>
                    </form>
                </div>

                <div className={styles.separator}></div>

                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Datos Personales</h3>
                    <form onSubmit={handleProfileSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nombre de Usuario</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Correo Electrónico</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={styles.input}
                            />
                        </div>
                        <button type="submit" className={styles.secondaryButton}>
                            Guardar Cambios
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChangePasswordProfileForm;