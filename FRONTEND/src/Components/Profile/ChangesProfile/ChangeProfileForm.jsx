
import React, { useState, useEffect } from 'react';
import { changePassword, updateUserProfile } from '../../../services/ProfileService';
import { useUserData } from '../../Hooks/useUserData';
import styles from './ChangeProfileForm.module.css';
import { CheckCircle, AlertCircle, Settings, Lock, User, FileText } from 'lucide-react';

function ChangeProfileForm() {
  const { profileData, isLoading } = useUserData();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentForm, setCurrentForm] = useState('password');
  const [personalInfoData, setPersonalInfoData] = useState({
    username: '',
    email: '',
    last_name: '',
    first_name: ''
  });
  const [aboutData, setAboutData] = useState({
    about: ''
  });
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

  useEffect(() => {
    if (profileData) {
      setPersonalInfoData({
        username: profileData.username || '',
        email: profileData.email || '',
        last_name: profileData.last_name || '',
        first_name: profileData.first_name || ''
      });
      setAboutData({
        about: profileData.about || ''
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
      window.location.reload();
      setNewPassword1('');
      setNewPassword2('');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error(err);
    }
  };

  const handlePersonalInfoSubmit = async () => {
    setError(null);
    setSuccessMessage(null);
    const token = localStorage.getItem('Authorization');
    
    if (!token) {
      setError('No estás autenticado.');
      return;
    }
    
    try {
      await updateUserProfile(token, personalInfoData);
      setSuccessMessage('Información personal actualizada con éxito!');
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Error al actualizar información personal');
    }
  };

  const handleAboutSubmit = async () => {
    setError(null);
    setSuccessMessage(null);
    const token = localStorage.getItem('Authorization');
    
    if (!token) {
      setError('No estás autenticado.');
      return;
    }
    
    try {
      await updateUserProfile(token, aboutData);
      setSuccessMessage('Acerca de mí actualizado con éxito!');
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Error al actualizar Acerca de mí');
    }
  };

  const renderPasswordForm = () => (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.iconContainer}>
          <Lock className={styles.sectionIcon} />
        </div>
        <h3 className={styles.sectionTitle}>Seguridad</h3>
      </div>
      
      <form onSubmit={handlePasswordSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="new-password">
            Nueva Contraseña
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword1}
            onChange={(e) => setNewPassword1(e.target.value)}
            className={styles.input}
            placeholder="••••••••"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="confirm-password">
            Confirmar Contraseña
          </label>
          <input
            id="confirm-password"
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

  const getErrorMessage = (error) => {
    if (error instanceof Error) return error.message;
    if (error.detail) return error.detail;
    if (error.non_field_errors) return error.non_field_errors.join(' ');
    
    let messages = [];
    for (const key in error) {
      if (Array.isArray(error[key])) {
        messages.push(...error[key].map(msg => msg.replace(`${key}: `, ''))); // Elimina el nombre del campo
      } else if (typeof error[key] === 'string') {
        messages.push(error[key].replace(`${key}: `, ''));
      }
    }
    return messages.join('. ') || 'Error desconocido';
  };

  const renderPersonalInfoForm = () => (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.iconContainer}>
          <User className={styles.sectionIcon} />
        </div>
        <h3 className={styles.sectionTitle}>Datos Personales</h3>
      </div>
      
      <div className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="username">
              Nombre de Usuario
            </label>
            <input
              id="username"
              type="text"
              value={personalInfoData.username}
              onChange={(e) => setPersonalInfoData({ ...personalInfoData, username: e.target.value })}
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={personalInfoData.email}
              onChange={(e) => setPersonalInfoData({ ...personalInfoData, email: e.target.value })}
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="first-name">
              Nombre
            </label>
            <input
              id="first-name"
              type="text"
              value={personalInfoData.first_name}
              onChange={(e) => setPersonalInfoData({ ...personalInfoData, first_name: e.target.value })}
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="last-name">
              Apellido
            </label>
            <input
              id="last-name"
              type="text"
              value={personalInfoData.last_name}
              onChange={(e) => setPersonalInfoData({ ...personalInfoData, last_name: e.target.value })}
              className={styles.input}
            />
          </div>
        </div>
        
        <button 
          type="button" 
          onClick={handlePersonalInfoSubmit} 
          className={styles.primaryButton}
        >
          Guardar Información Personal
        </button>
      </div>
    </div>
  );

  const renderAboutForm = () => (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.iconContainer}>
          <FileText className={styles.sectionIcon} />
        </div>
        <h3 className={styles.sectionTitle}>Acerca de mi</h3>
      </div>
      
      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="about">
            Cuéntanos sobre ti
          </label>
          <textarea
            id="about"
            value={aboutData.about}
            onChange={(e) => setAboutData({ ...aboutData, about: e.target.value })}
            className={styles.aboutTextarea}
            placeholder="Comparte información sobre ti, tus intereses, experiencia..."
            rows={10}
          />
        </div>
        
        <button 
          type="button" 
          onClick={handleAboutSubmit} 
          className={styles.primaryButton}
        >
          Guardar Acerca de mí
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconContainer}>
              <Settings className={styles.headerIcon} />
            </div>
            <h2 className={styles.title}>Configuración de Cuenta</h2>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle className={styles.alertIcon} />
            <span>{error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className={styles.successMessage}>
            <CheckCircle className={styles.alertIcon} />
            <span>{successMessage}</span>
          </div>
        )}

        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabButton} ${currentForm === 'password' ? styles.activeTab : ''}`} 
            onClick={() => setCurrentForm('password')}
          >
            Cambiar Contraseña
          </button>
          <button 
            className={`${styles.tabButton} ${currentForm === 'personalInfo' ? styles.activeTab : ''}`} 
            onClick={() => setCurrentForm('personalInfo')}
          >
            Información Personal
          </button>
          <button 
            className={`${styles.tabButton} ${currentForm === 'about' ? styles.activeTab : ''}`} 
            onClick={() => setCurrentForm('about')}
          >
            Acerca de mi
          </button>
        </div>

        <div className={styles.formContainer}>
          {currentForm === 'password' && renderPasswordForm()}
          {currentForm === 'personalInfo' && renderPersonalInfoForm()}
          {currentForm === 'about' && renderAboutForm()}
        </div>
      </div>
    </div>
  );
}

export default ChangeProfileForm;
