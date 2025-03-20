// Components/ModalEditarPerfil/ModalEditarPerfil.jsx
import React, { useState } from 'react';
import styles from './ModalEditarPerfil.module.css';

function ModalEditarPerfil({ isOpen, onClose, userInfo, onSave }) {
  const [formData, setFormData] = useState({ ...userInfo });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Editar Perfil</h2>
        <form>
          <label>
            Nombre:
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
          </label>
          <label>
            Bio:
            <input type="text" name="bio" value={formData.bio} onChange={handleChange} />
          </label>
          <label>
            Email:
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </label>
          {/* Agrega más campos según tu información de usuario */}
          <div className={styles.buttonContainer}>
            <button type="button" onClick={handleSave}>Guardar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalEditarPerfil;