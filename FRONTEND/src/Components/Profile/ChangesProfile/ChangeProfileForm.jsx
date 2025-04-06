"use client"

import { useState, useEffect } from "react"
import {
  changePassword,
  updateUserProfile,
  getProfileImage,
  uploadProfileImage,
} from "../../../services/ProfileService"
import { useUserData } from "../../Hooks/useUserData"
import styles from "./ChangeProfileForm.module.css"
import {
  CheckCircle,
  AlertCircle,
  Settings,
  Lock,
  User,
  FileText,
  Camera,
  Save,
  Eye,
  EyeOff,
  Mail,
  UserCircle,
  Edit,
} from "lucide-react"

function ChangeProfileForm() {
  const { profileData, isLoading } = useUserData()
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [currentForm, setCurrentForm] = useState("password")
  const [personalInfoData, setPersonalInfoData] = useState({
    username: "",
    email: "",
    last_name: "",
    first_name: "",
  })
  const [aboutData, setAboutData] = useState({
    about: "",
  })
  const [newPassword1, setNewPassword1] = useState("")
  const [newPassword2, setNewPassword2] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (profileData) {
      setPersonalInfoData({
        username: profileData.username || "",
        email: profileData.email || "",
        last_name: profileData.last_name || "",
        first_name: profileData.first_name || "",
      })
      setAboutData({
        about: profileData.about || "",
      })
    }
  }, [profileData])

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (newPassword1 !== newPassword2) {
      setError("Las contraseñas no coinciden.")
      return
    }

    const token = localStorage.getItem("Authorization")
    if (!token) {
      setError("No estás autenticado.")
      return
    }

    try {
      await changePassword(newPassword1, newPassword2, token)
      setSuccessMessage("Contraseña cambiada con éxito.")
      window.location.reload()
      setNewPassword1("")
      setNewPassword2("")
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      console.error(err)
    }
  }

  const handlePersonalInfoSubmit = async () => {
    setError(null)
    setSuccessMessage(null)
    const token = localStorage.getItem("Authorization")

    if (!token) {
      setError("No estás autenticado.")
      return
    }

    try {
      if (selectedFile) {
        await uploadProfileImage(selectedFile, token)
      }
      await updateUserProfile(token, personalInfoData)
      setSuccessMessage("Información personal y foto de perfil actualizadas con éxito!")

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err) {
      setError(err.message || "Error al actualizar información personal o la foto de perfil")
    }
  }

  const handleAboutSubmit = async () => {
    setError(null)
    setSuccessMessage(null)
    const token = localStorage.getItem("Authorization")

    if (!token) {
      setError("No estás autenticado.")
      return
    }

    try {
      await updateUserProfile(token, aboutData)
      setSuccessMessage("Acerca de mí actualizado con éxito!")
      window.location.reload()
    } catch (err) {
      setError(err.message || "Error al actualizar Acerca de mí")
    }
  }

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const getErrorMessage = (error) => {
    if (error instanceof Error) return error.message
    if (error.detail) return error.detail
    if (error.non_field_errors) return error.non_field_errors.join(" ")

    const messages = []
    for (const key in error) {
      if (Array.isArray(error[key])) {
        messages.push(...error[key].map((msg) => msg.replace(`${key}: `, "")))
      } else if (typeof error[key] === "string") {
        messages.push(error[key].replace(`${key}: `, ""))
      }
    }
    return messages.join(". ") || "Error desconocido"
  }

  const renderPasswordForm = () => (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.iconContainer}>
          <Lock className={styles.sectionIcon} />
        </div>
        <h3 className={styles.sectionTitle}>Seguridad</h3>
      </div>

      <form onSubmit={handlePasswordSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="new-password">
            <Lock size={16} className={styles.inputIcon} />
            Nueva Contraseña
          </label>
          <div className={styles.passwordInputWrapper}>
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={newPassword1}
              onChange={(e) => setNewPassword1(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="confirm-password">
            <Lock size={16} className={styles.inputIcon} />
            Confirmar Contraseña
          </label>
          <div className={styles.passwordInputWrapper}>
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className={styles.primaryButton}>
          <Save size={18} className={styles.buttonIcon} />
          Actualizar Contraseña
        </button>
      </form>
    </div>
  )

  const renderPersonalInfoForm = () => (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.iconContainer}>
          <UserCircle className={styles.sectionIcon} />
        </div>
        <h3 className={styles.sectionTitle}>Datos Personales</h3>
      </div>

      <div className={styles.profileImageContainer}>
        <div className={styles.profileImageWrapper}>
          <img
            src={selectedFile ? URL.createObjectURL(selectedFile) : getProfileImage(profileData?.image_name)}
            alt="Foto de perfil"
            className={styles.profileImage}
            onError={(e) => {
              e.target.src = "/default-profile.png"
            }}
          />
          <button
            className={styles.editImageOverlay}
            onClick={() => document.getElementById("profile-image-upload").click()}
            aria-label="Cambiar foto de perfil"
          >
            <Camera size={28} />
            <span>Cambiar foto</span>
          </button>
        </div>
        <input
          type="file"
          id="profile-image-upload"
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleProfileImageUpload}
        />
      </div>

      <div className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="username">
              <User size={16} className={styles.inputIcon} />
              Nombre de Usuario
            </label>
            <input
              id="username"
              type="text"
              value={personalInfoData.username}
              onChange={(e) => setPersonalInfoData({ ...personalInfoData, username: e.target.value })}
              className={styles.input}
              placeholder="Tu nombre de usuario"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              <Mail size={16} className={styles.inputIcon} />
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={personalInfoData.email}
              onChange={(e) => setPersonalInfoData({ ...personalInfoData, email: e.target.value })}
              className={styles.input}
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="first-name">
              <User size={16} className={styles.inputIcon} />
              Nombre
            </label>
            <input
              id="first-name"
              type="text"
              value={personalInfoData.first_name}
              onChange={(e) => setPersonalInfoData({ ...personalInfoData, first_name: e.target.value })}
              className={styles.input}
              placeholder="Tu nombre"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="last-name">
              <User size={16} className={styles.inputIcon} />
              Apellido
            </label>
            <input
              id="last-name"
              type="text"
              value={personalInfoData.last_name}
              onChange={(e) => setPersonalInfoData({ ...personalInfoData, last_name: e.target.value })}
              className={styles.input}
              placeholder="Tu apellido"
            />
          </div>
        </div>

        <button type="button" onClick={handlePersonalInfoSubmit} className={styles.primaryButton}>
          <Save size={18} className={styles.buttonIcon} />
          Guardar Información Personal
        </button>
      </div>
    </div>
  )

  const renderAboutForm = () => (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.iconContainer}>
          <FileText className={styles.sectionIcon} />
        </div>
        <h3 className={styles.sectionTitle}>Acerca de mi</h3>
      </div>

      <div className={styles.form}>
        <div className={styles.aboutFormContainer}>
          <div className={styles.aboutHeader}>
            <label className={styles.label} htmlFor="about">
              <Edit size={16} className={styles.inputIcon} />
              Cuéntanos sobre ti
            </label>
            <span className={styles.aboutHint}>
              Comparte tus intereses, experiencia y lo que te hace único. Esta información será visible en tu perfil
              público.
            </span>
          </div>

          <textarea
            id="about"
            value={aboutData.about}
            onChange={(e) => setAboutData({ ...aboutData, about: e.target.value })}
            className={styles.aboutTextarea}
            placeholder="Me apasiona la tecnología y el desarrollo web. En mi tiempo libre disfruto de..."
            rows={15}
          />

          <div className={styles.aboutFooter}>
            <span className={styles.characterCount}>{aboutData.about ? aboutData.about.length : 0} caracteres</span>
            <button type="button" onClick={handleAboutSubmit} className={styles.primaryButton}>
              <Save size={18} className={styles.buttonIcon} />
              Guardar Acerca de mí
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconContainer}>
              <Settings className={styles.headerIcon} />
            </div>
            <h2 className={styles.title}>Configuración de Cuenta</h2>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle className={styles.alertIcon} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className={styles.successMessage}>
            <CheckCircle className={styles.alertIcon} />
            <span>{successMessage}</span>
          </div>
        )}

        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabButton} ${currentForm === "password" ? styles.activeTab : ""}`}
            onClick={() => setCurrentForm("password")}
          >
            <Lock size={18} className={styles.tabIcon} />
            <span>Cambiar Contraseña</span>
          </button>
          <button
            className={`${styles.tabButton} ${currentForm === "personalInfo" ? styles.activeTab : ""}`}
            onClick={() => setCurrentForm("personalInfo")}
          >
            <User size={18} className={styles.tabIcon} />
            <span>Información Personal</span>
          </button>
          <button
            className={`${styles.tabButton} ${currentForm === "about" ? styles.activeTab : ""}`}
            onClick={() => setCurrentForm("about")}
          >
            <FileText size={18} className={styles.tabIcon} />
            <span>Acerca de mi</span>
          </button>
        </div>

        <div className={styles.formContainer}>
          {currentForm === "password" && renderPasswordForm()}
          {currentForm === "personalInfo" && renderPersonalInfoForm()}
          {currentForm === "about" && renderAboutForm()}
        </div>
      </div>
    </div>
  )
}

export default ChangeProfileForm

