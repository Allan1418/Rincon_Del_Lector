"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { confirmResetPassword } from "../../../services/ProfileService";
import styles from "./ResetPassword.module.css";
import { EyeIcon, EyeOffIcon } from "lucide-react"

function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  useEffect(() => {
    if (successMessage) {
      setIsRedirecting(true);
      const redirectTimer = setTimeout(() => {
        navigate("/authForm");
        window.location.reload();
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }
  }, [successMessage, navigate]);

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      await confirmResetPassword(uid, token, newPassword1, newPassword2);
      setSuccessMessage("¡Contraseña restablecida con éxito!");
      setNewPassword1("");
      setNewPassword2("");
      setIsLoading(false);
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      setErrorMessage(error.message || "Ocurrió un error al restablecer la contraseña.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Restablecer Contraseña</h1>
        <p className={styles.description}>
          Ingresa tu nueva contraseña para completar el proceso
        </p>

        <form onSubmit={handleResetPasswordSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword1" className={styles.label}>
              Nueva Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="newPassword1"
                type={showPassword1 ? "text" : "password"}
                placeholder="Nueva Contraseña"
                value={newPassword1}
                onChange={(e) => setNewPassword1(e.target.value)}
                required
                className={styles.input}
              />
              <button
                type="button"
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setShowPassword1(!showPassword1)}
              >
                {showPassword1 ? <EyeOffIcon size={18} />:<EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="newPassword2" className={styles.label}>
              Confirmar Nueva Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="newPassword2"
                type={showPassword2 ? "text" : "password"}
                placeholder="Confirmar Nueva Contraseña"
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
                required
                className={styles.input}
              />
              <button
                type="button"
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setShowPassword2(!showPassword2)}
              >
                {showPassword2 ? <EyeOffIcon size={18} />:<EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isLoading || isRedirecting}
          >
            {isLoading ? (
              <span className={styles.buttonContent}>
                <span className={styles.spinner}></span>
                Procesando...
              </span>
            ) : isRedirecting ? (
              <span className={styles.buttonContent}>
                <span className={styles.spinner}></span>
                Redirigiendo...
              </span>
            ) : (
              "Restablecer Contraseña"
            )}
          </button>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          {successMessage && (
            <div className={styles.successContainer}>
              <p className={styles.success}>{successMessage}</p>
              <p className={styles.redirectMessage}>
                Redirigiendo en 2 segundos...
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;