import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AuthForm.module.css';
import { handleLogin, handleRegister } from '../../services/ProfileService';
import { AuthContext } from '../Context/AuthContext';
import Modal from './Modal';

function AuthForm() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [isSignUpMode, setIsSignUpMode] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [errorMessage, setErrorMessage] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const toggleMode = () => {
        setIsSignUpMode(prevMode => !prevMode);
        setErrorMessage('');
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            await handleRegister(username, email, password, password2);
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            setIsSignUpMode(false);
            setErrorMessage('');
        } catch (error) {
            console.error('Error en registro:', error);

            let message = "Error al registrar el usuario.";

            if (typeof error === 'object' && error !== null) {
                const errorKeys = Object.keys(error);
                if (errorKeys.length > 0) {
                    const firstKey = errorKeys[0];
                    const firstError = error[firstKey];
                    message = Array.isArray(firstError) ? firstError[0] : firstError;
                }
            } else if (typeof error === 'string') {
                message = error;
            }

            setErrorMessage(message);
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
            setErrorMessage('');
        } catch (error) {
            console.error('Error en login:', error);
            let message = "Credenciales inválidas.";

            if (error.non_field_errors) message = error.non_field_errors[0];
            else if (error.detail) message = error.detail;

            setErrorMessage(message);
        }
    };

    const handlePasswordReset = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <div className={styles.bodyForm}>
            <div className={`${styles.container} ${isSignUpMode ? styles.rightPanelActive : ''}`}>
                <div className={`${styles.formContainer} ${styles.registerContainer} ${isSignUpMode ? styles.active : ''}`}>
                    <form className={styles.form} onSubmit={handleRegisterSubmit}>
                        <h1>Registrar.</h1>
                        <input className={styles.input}
                        type="text"
                        placeholder="Nombre de usuario" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} 
                        required />

                        <input className={styles.input}
                        type="email" 
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required />

                        <input className={styles.input}
                        type="password"
                         placeholder="Contraseña"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         required />

                        <input className={styles.input}
                        type="password"
                        placeholder="Confirmar Contraseña" 
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required />
                        
                        <button className={styles.button} type="submit">Registrar</button>
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    </form>
                </div>

                <div className={`${styles.formContainer} ${styles.loginContainer} ${!isSignUpMode ? styles.active : ''}`}>
                    <form className={styles.form} onSubmit={handleLoginSubmit}>
                        <h1>Inicia sesión.</h1>
                        <input className={styles.input} type="text" placeholder="Correo o nombre de usuario" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                        <input className={styles.input} type="password" placeholder="Contraseña" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                        <button className={styles.button}>Acceso</button>
                        <a href="#" className={styles.link} onClick={handlePasswordReset}>
                            Olvidé mi contraseña
                        </a>
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    </form>
                </div>

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
            <Modal isOpen={modalIsOpen} onClose={closeModal} />
        </div>
    );
}

export default AuthForm;