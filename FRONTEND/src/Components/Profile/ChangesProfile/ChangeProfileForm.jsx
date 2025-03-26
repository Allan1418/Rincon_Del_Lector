import React, { useState } from 'react';
import { changePassword, updateUserProfile } from '../../../services/ProfileService';
import { useUserData } from '../../Hooks/useUserData';
import styles from './ChangeProfileForm.module.css';

function ChangePasswordProfileForm() {
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

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
            console.error(err);
        }
    };

    return (
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
    );
}

function PersonalInfoProfileForm({ formData, setFormData, error, setError, successMessage, setSuccessMessage }) {
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

    return (
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
                <div className={styles.formGroup}>
                    <label className={styles.label}>Apellido</label>
                    <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Nombre</label>
                    <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className={styles.input}
                    />
                </div>
                <button type="submit" className={styles.primaryButton}>
                    Guardar Cambios
                </button>
            </form>
        </div>
    );
}

function AboutProfileForm({ formData, setFormData, error, setError, successMessage, setSuccessMessage }){
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

    return(
        <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Acerca de mi</h3>
            <form onSubmit={handleProfileSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Acerca de mi</label>
                    <textarea
                        type="text" rows="15" cols="2"
                        value={formData.about}
                        onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                        className={styles.input}
                    />
                </div>
                <button type="submit" className={styles.primaryButton}>
                    Guardar Cambios
                </button>
            </form>
        </div>
    )
}

function ChangeProfileForm() {
    const { profileData, isLoading, error: profileError } = useUserData();
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [currentForm, setCurrentForm] = useState('password');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        last_name: '',
        first_name: '',
        about: ''
    });

    React.useEffect(() => {
        if (profileData) {
            setFormData({
                username: profileData.username,
                email: profileData.email,
                last_name: profileData.last_name,
                first_name: profileData.first_name,
                about: profileData.about
            });
        }
    }, [profileData]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Configuración de Cuenta</h2>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}
            {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

            <div className={styles.containerButton}>
                <button className={styles.secondaryButton} onClick={() => setCurrentForm('password')}>Cambiar Contraseña</button>
                <button className={styles.secondaryButton} onClick={() => setCurrentForm('personalInfo')}>Información Personal</button>
                <button className={styles.secondaryButton} onClick={() => setCurrentForm('about')}>Acerca de mi</button>
            </div>

            <div className={styles.formContainer}>
                {currentForm === 'password' && <ChangePasswordProfileForm />}
                {currentForm === 'personalInfo' && <PersonalInfoProfileForm formData={formData} setFormData={setFormData} error={error} setError={setError} successMessage={successMessage} setSuccessMessage={setSuccessMessage}/>}
                {currentForm === 'about' && <AboutProfileForm formData={formData} setFormData={setFormData} error={error} setError={setError} successMessage={successMessage} setSuccessMessage={setSuccessMessage} />}
            </div>
        </div>
    );
}

export default ChangeProfileForm;