import React, { useRef, useEffect, useState } from 'react';
import styles from './Modal.module.css';
import redditAlien from '../../../public/images/index.svg';
import { resetPassword } from '../../services/ProfileService';

const Modal = ({ isOpen, onClose }) => {
    const modalRef = useRef(null);
    const [resetEmail, setResetEmail] = useState('');
    const [isResetForm, setIsResetForm] = useState(true);
    const [isConfirmation, setIsConfirmation] = useState(false);
    const [resetErrorMessage, setResetErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    const handleResetEmailSubmit = async (e) => {
        e.preventDefault();
        try {
            await resetPassword(resetEmail);
            setIsConfirmation(true);
            setResetErrorMessage('');
        } catch (error) {
            console.error('Error al restablecer la contraseña:', error);
            setResetErrorMessage(error.message || 'Ocurrió un error al restablecer la contraseña.');
        }
    };

    const handleResetPasswordClick = () => {
        setIsResetForm(true);
    };

    const handleAcceptClick = () => {
        setIsConfirmation(false);
        setIsResetForm(true);
        setResetEmail('');
        setResetErrorMessage('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex="-1" ref={modalRef}>
                <div className={styles.modalHeader}>
                    <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar modal">&times;</button>
                </div>
                <div className={styles.modalBody}>
                    <img src={redditAlien} alt="Alien de Reddit" className={styles.modalImage} />
                    <h2 id="modal-title" className={styles.modalTitle}>
                        {isConfirmation ? "¡Contraseña enviada!" : isResetForm ? "Restablecer Contraseña" : "Revisa tu bandeja de entrada"}
                    </h2>
                    {isResetForm && !isConfirmation ? (
                        <form onSubmit={handleResetEmailSubmit} className={styles.modalForm}>
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                                className={styles.formInput}
                            />
                            <button type="submit" className={styles.modalButton}>Enviar enlace de restablecimiento</button>
                            {resetErrorMessage && <p className={styles.errorMessage}>{resetErrorMessage}</p>}
                        </form>
                    ) : isConfirmation ? (
                        <div>
                            <p className={styles.confirmationMessage}>Hemos enviado un enlace para cambiar tu contraseña a tu correo electrónico.</p>
                            <button onClick={handleAcceptClick} className={styles.modalButton}>Aceptar</button>
                        </div>
                    ) : (
                        <button onClick={handleResetPasswordClick} className={styles.modalButton}>Restablecer Contraseña</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;