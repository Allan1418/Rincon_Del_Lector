"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./AuthForm.module.css"
import { handleLogin, handleRegister } from "../../services/ProfileService"
import { AuthContext } from "../Context/AuthContext"
import Modal from "./Modal"
import { EyeIcon, EyeOffIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react"

function AuthForm() {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const [isSignUpMode, setIsSignUpMode] = useState(true)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Clear messages when switching modes
  useEffect(() => {
    setErrorMessage(null)
    setSuccessMessage(null)
  }, [isSignUpMode])

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    setPasswordStrength(strength)
  }, [password])

  const toggleMode = () => {
    setIsSignUpMode((prevMode) => !prevMode)
    // Reset form fields when toggling
    if (isSignUpMode) {
      setUsername("")
      setEmail("")
      setPassword("")
      setPassword2("")
    } else {
      setLoginEmail("")
      setLoginPassword("")
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      await handleRegister(username, email, password, password2)
      setSuccessMessage("Registro exitoso. Ahora puedes iniciar sesión.")

      // Auto switch to login after successful registration
      setTimeout(() => {
        setIsSignUpMode(false)
        setSuccessMessage(null)
      }, 2000)
    } catch (error) {
      console.error("Error en registro:", error)

      let message = "Error al registrar el usuario."

      if (typeof error === "object" && error !== null) {
        const errorKeys = Object.keys(error)
        if (errorKeys.length > 0) {
          const firstKey = errorKeys[0]
          const firstError = error[firstKey]
          message = Array.isArray(firstError) ? firstError[0] : firstError
        }
      } else if (typeof error === "string") {
        message = error
      }

      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const responseData = await handleLogin(loginEmail, loginPassword)
      const token = `Token ${responseData.key}`
      const username = responseData.user
      login(token, username)

      setSuccessMessage("¡Bienvenido!")

      // Redirect after successful login with a slight delay for better UX
      setTimeout(() => {
        navigate("/")
      }, 1000)
    } catch (error) {
      console.error("Error en login:", error)
      let message = "Credenciales inválidas."

      if (error.non_field_errors) message = error.non_field_errors[0]
      else if (error.detail) message = error.detail

      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = (e) => {
    e.preventDefault()
    setModalIsOpen(true)
  }

  const closeModal = () => {
    setModalIsOpen(false)
  }

  // Password strength indicator
  const renderPasswordStrength = () => {
    if (!password) return null

    const strengthLabels = ["Débil", "Regular", "Buena", "Fuerte"]
    const strengthColors = ["#ff4d4d", "#ffaa00", "#2ecc71", "#27ae60"]

    return (
      <div className={styles.passwordStrength}>
        <div className={styles.strengthBars}>
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className={styles.strengthBar}
              style={{
                backgroundColor: index < passwordStrength ? strengthColors[passwordStrength - 1] : "#e0e0e0",
                width: "25%",
              }}
            />
          ))}
        </div>
        <span style={{ color: strengthColors[passwordStrength - 1] || "#666" }}>
          {password ? strengthLabels[passwordStrength - 1] || "Débil" : ""}
        </span>
      </div>
    )
  }

  return (
    <div className={styles.bodyForm}>
      <div className={`${styles.container} ${isSignUpMode ? styles.rightPanelActive : ""}`}>
        <div className={`${styles.formContainer} ${styles.registerContainer}`}>
          <form className={styles.form} onSubmit={handleRegisterSubmit}>
            <h1>Registrar</h1>

            {successMessage && (
              <div className={styles.successMessage}>
                <CheckCircleIcon size={18} />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className={styles.errorMessage}>
                <AlertCircleIcon size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                aria-label="Nombre de usuario"
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Correo electrónico"
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Contraseña"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>

            {renderPasswordStrength()}

            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar Contraseña"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                aria-label="Confirmar contraseña"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"
                }
              >
                {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>

            <button
              className={`${styles.button} ${isLoading ? styles.loading : ""}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : "Registrar"}
            </button>
          </form>
        </div>

        <div className={`${styles.formContainer} ${styles.loginContainer}`}>
          <form className={styles.form} onSubmit={handleLoginSubmit}>
            <h1>Inicia sesión</h1>

            {successMessage && (
              <div className={styles.successMessage}>
                <CheckCircleIcon size={18} />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className={styles.errorMessage}>
                <AlertCircleIcon size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type="text"
                placeholder="Correo o nombre de usuario"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                aria-label="Correo o nombre de usuario"
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type={showLoginPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                aria-label="Contraseña"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                aria-label={showLoginPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showLoginPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>

            <button className={`${styles.button} ${isLoading ? styles.loading : ""}`} disabled={isLoading}>
              {isLoading ? "Procesando..." : "Acceso"}
            </button>

            <a href="#" className={styles.link} onClick={handlePasswordReset}>
              Olvidé mi contraseña
            </a>
          </form>
        </div>

        <div className={styles.overlayContainer}>
          <div className={styles.overlay}>
            <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
              <h1 className={styles.title}>
                Hola <br /> amigo
              </h1>
              <p className={styles.title2}>¡Bienvenido de nuevo! Inicia sesión con tus datos personales aquí.</p>
              <button
                className={`${styles.button} ${styles.ghost}`}
                onClick={toggleMode}
                type="button"
                aria-label="Cambiar a inicio de sesión"
              >
                Acceso
                <i className="lni lni-arrow-left login"></i>
              </button>
            </div>
            <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
              <h1 className={styles.title}>
                Empieza tu <br /> viaje ahora
              </h1>
              <p className={styles.title2}>Si aún no tienes una cuenta, únete a nosotros y comienza tu viaje.</p>
              <button
                className={`${styles.button} ${styles.ghost}`}
                onClick={toggleMode}
                type="button"
                aria-label="Cambiar a registro"
              >
                Registrar
                <i className="lni lni-arrow-right register"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={modalIsOpen} onClose={closeModal} />
    </div>
  )
}

export default AuthForm

