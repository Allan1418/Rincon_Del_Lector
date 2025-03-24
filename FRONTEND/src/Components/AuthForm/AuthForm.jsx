import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AuthForm.module.css';
import { handleLogin, handleRegister } from '../../services/ProfileService'; // Importa desde ProfileService
import { AuthContext } from '../Context/AuthContext';

function AuthForm() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const toggleMode = () => {
    setIsSignUpMode(prevMode => !prevMode);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleRegister(username, email, password, password2);
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      setUsername('');
      setEmail('');
      setPassword('');
      setPassword2('');
      setIsSignUpMode(false);
    } catch (error) {
      console.error('Error en registro:', error);
      if (error.message) alert(error.message);
      if (error.username) alert(error.username[0]);
      if (error.email) alert(error.email[0]);
      if (error.password1) alert(error.password1[0]);
      if (error.password2) alert(error.password2[0]);
      if (error.non_field_errors) alert(error.non_field_errors[0]);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const responseData = await handleLogin(loginEmail, loginPassword);
      
      const token = `Token ${responseData.key}`;
      const username = responseData.user;
      
      login(token, username);
      
      alert('¡Bienvenido!');
      navigate('/');
      
    } catch (error) {
      let errorMessage = "Credenciales inválidas";
      if (error.non_field_errors) errorMessage = error.non_field_errors[0];
      if (error.detail) errorMessage = error.detail;
      alert(errorMessage);
    }
  };


  return (
    <div className={styles.bodyForm}>
      <div className={`${styles.container} ${isSignUpMode ? styles.rightPanelActive : ''}`}>
        
        {/* Formulario de Registro */}
        <div className={`${styles.formContainer} ${styles.registerContainer} ${isSignUpMode ? styles.active : ''}`}>
          <form className={styles.form} onSubmit={handleRegisterSubmit}>
            <h1>Registrar.</h1>
            <input
              className={styles.input}
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              className={styles.input}
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input 
              className={styles.input}
              type="password"
              placeholder="Confirmar Contraseña"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
            <button className={styles.button} type="submit">Registrar</button>
          </form>
        </div>

        {/* Formulario de Login */}
        <div className={`${styles.formContainer} ${styles.loginContainer} ${!isSignUpMode ? styles.active : ''}`}>
          <form className={styles.form} onSubmit={handleLoginSubmit}>
            <h1>Inicia sesión.</h1>
            <input 
              className={styles.input} 
              type="text"
              placeholder="Correo o nombre de usuario"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)} 
              required
            />
            <input 
              className={styles.input} 
              type="password" 
              placeholder="Contraseña"
              value={loginPassword} 
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <button className={styles.button}>Acceso</button>
          </form>
        </div>

        {/* Overlay */}
        <div className={styles.overlayContainer}>
          <div className={styles.overlay}>
            <div className={`${styles.overlayPanel} ${styles.overlayLeft} ${!isSignUpMode ? styles.active : ''}`}>
              <h1 className={styles.title}>Hola <br /> amigo</h1>
              <p className={styles.title2}>¡Bienvenido de nuevo! Inicia sesión con tus datos personales aquí.</p>
              <button className={`${styles.button} ${styles.ghost}`} onClick={toggleMode}>
                Acceso
                <i className="lni lni-arrow-left login"></i>
              </button>
            </div>
            <div className={`${styles.overlayPanel} ${styles.overlayRight} ${isSignUpMode ? styles.active : ''}`}>
              <h1 className={styles.title}>Empieza tu <br /> viaje ahora</h1>
              <p className={styles.title2}>Si aún no tienes una cuenta, únete a nosotros y comienza tu viaje.</p>
              <button className={`${styles.button} ${styles.ghost}`} onClick={toggleMode}>
                Registrar
                <i className="lni lni-arrow-right register"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;