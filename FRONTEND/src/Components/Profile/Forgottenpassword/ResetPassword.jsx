"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"
import { confirmResetPassword } from "../../../services/ProfileService"
import styles from "./ResetPassword.module.css"
import LoadingScreen from "../../Hooks/LoadingScreen"

function ResetPassword() {
  const { uid, token } = useParams()
  const [newPassword1, setNewPassword1] = useState("")
  const [newPassword2, setNewPassword2] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    setIsLoading(true)
    try {
      await confirmResetPassword(uid, token, newPassword1, newPassword2)
      setSuccessMessage("¡Contraseña restablecida con éxito!")
      setNewPassword1("")
      setNewPassword2("")
      setIsLoading(false)
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error)
      setErrorMessage(error.message || "Ocurrió un error al restablecer la contraseña.")
      setIsLoading(false)
    }
  }

  if (isLoading && !errorMessage && !successMessage) {
    return <LoadingScreen />
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Restablecer Contraseña</h1>
        <p className={styles.description}>Ingresa tu nueva contraseña para completar el proceso</p>

        <form onSubmit={handleResetPasswordSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword1" className={styles.label}>
              Nueva Contraseña
            </label>
            <input
              id="newPassword1"
              type="password"
              placeholder="Nueva Contraseña"
              value={newPassword1}
              onChange={(e) => setNewPassword1(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="newPassword2" className={styles.label}>
              Confirmar Nueva Contraseña
            </label>
            <input
              id="newPassword2"
              type="password"
              placeholder="Confirmar Nueva Contraseña"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.button}>
            {isLoading ? (
              <span className={styles.buttonContent}>
                <span className={styles.spinner}></span>
                Procesando...
              </span>
            ) : (
              "Restablecer Contraseña"
            )}
          </button>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}
        </form>
      </div>
    </div>
  )
}

export default ResetPassword

