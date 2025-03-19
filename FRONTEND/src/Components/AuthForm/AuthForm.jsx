import React, { useState } from 'react';
import styles from './AuthForm.module.css'

function AuthForm() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const toggleMode = () => setIsSignUpMode(!isSignUpMode);

  return (
    <div className={styles.bodyForm}>
      <div className={`${styles.container} ${isSignUpMode ? styles.rightPanelActive : ''}`}>
        {/* Formulario de Registro */}
        <div className={`${styles.formContainer} ${styles.registerContainer} ${isSignUpMode ? styles.active : ''}`}>
          <form className={styles.form}>
            <h1>Registrar.</h1>
            <input className={styles.input} type="text" placeholder="Nombre Usuario" />
            <input className={styles.input} type="email" placeholder="Gmail" />
            <input className={styles.input} type="password" placeholder="Contraseña" />
            <button className={styles.button}>Registrar</button>
            <span>or use your account</span>
            <div className={styles.socialContainer}>
              <a href="#" className={styles.socialLink}><i className="lni lni-facebook-fill"></i></a>
              <a href="#" className={styles.socialLink}><i className="lni lni-google"></i></a>
              <a href="#" className={styles.socialLink}><i className="lni lni-linkedin-original"></i></a>
            </div>
          </form>
        </div>

        {/* Formulario de Login */}
        <div className={`${styles.formContainer} ${styles.loginContainer} ${!isSignUpMode ? styles.active : ''}`}>
          <form className={styles.form}>
            <h1>Inicia sesión.</h1>
            <input className={styles.input} type="email" placeholder="Gmail" />
            <input className={styles.input} type="password" placeholder="Contraseña" />
            <div className={styles.content}>
              <div className={styles.checkbox}>
                <input type="checkbox" name="checkbox" id="checkbox" />
                <label htmlFor="checkbox">Recordar</label>
              </div>
              <div className={styles.passLink}>
                <a href="#">¿Olvidaste tu contraseña?</a>
              </div>
            </div>
            <button className={styles.button}>Acceso</button>
            <span>or use your account</span>
            <div className={styles.socialContainer}>
              <a href="#" className={styles.socialLink}><i className="lni lni-facebook-fill"></i></a>
              <a href="#" className={styles.socialLink}><i className="lni lni-google"></i></a>
              <a href="#" className={styles.socialLink}><i className="lni lni-linkedin-original"></i></a>
            </div>
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