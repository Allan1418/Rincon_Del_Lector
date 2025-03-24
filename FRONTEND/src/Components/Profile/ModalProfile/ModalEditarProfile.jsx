import React, { useState, useEffect } from 'react';
import styles from './ModalEditarProfile.module.css';

function ModalEditarPerfil({ isOpen, onClose, userInfo, onSave }) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        about: ''
    });

    useEffect(() => {
        if (userInfo) {
            setFormData({
                first_name: userInfo.first_name || '',
                last_name: userInfo.last_name || '',
                about: userInfo.about || ''
            });
        }
    }, [userInfo]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSave(formData);
            onClose()
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Editar Información pública del perfil</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Nombre:
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
                    </label>

                    <label>
                        Apellido:
                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
                    </label>

                    <label>
                        Sobre mí:
                        <input name="about" value={formData.about} onChange={handleChange} maxLength="200" />
                    </label>

                    <div className={styles.buttonContainer}>
                        <button type="submit">Guardar</button>
                        <button type="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModalEditarPerfil;