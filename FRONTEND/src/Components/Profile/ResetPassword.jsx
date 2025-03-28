import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { confirmResetPassword } from '../../services/ProfileService';
import styles from './ResetPassword.module.css';
import LoadingScreen from '../Hooks/LoadingScreen';

function ResetPassword() {
  const { uid, token } = useParams();
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await confirmResetPassword(uid, token, newPassword1, newPassword2);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
      setErrorMessage(error.message || 'Ocurrió un error al restablecer la contraseña.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Restablecer Contraseña</h1>
      <form onSubmit={handleResetPasswordSubmit} className={styles.form}>
        <input
          type="password"
          placeholder="Nueva Contraseña"
          value={newPassword1}
          onChange={(e) => setNewPassword1(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Confirmar Nueva Contraseña"
          value={newPassword2}
          onChange={(e) => setNewPassword2(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Restablecer Contraseña
        </button>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </form>
    </div>
  );
}

export default ResetPassword;