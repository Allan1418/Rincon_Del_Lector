"use client"

import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { createBook } from "../../../services/ProfileService"
import { AuthContext } from "../../Context/AuthContext"
import styles from "./CreateBookForm.module.css"

const CreateBookForm = () => {
  const { token, user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [bookData, setBookData] = useState({
    title: "",
    synopsis: "",
    price: "",
  })
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookData((prev) => ({
      ...prev,
      [name]: name === "price" ? value.replace(/[^0-9.]/g, "") : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!bookData.title.trim() || !bookData.synopsis.trim() || !bookData.price) {
        throw new Error("Todos los campos son requeridos")
      }

      const numericPrice = Number(bookData.price)
      if (isNaN(numericPrice) || numericPrice < 0) {
        throw new Error("Precio debe ser un número positivo")
      }

      await createBook(
        {
          title: bookData.title,
          synopsis: bookData.synopsis,
          price: numericPrice,
        },
        token,
      )

      setSuccessMessage("¡Libro creado exitosamente!")
      setTimeout(() => navigate(`/user/${user.username}`), 2000)
    } catch (error) {
      let errorMessage = "Error del servidor"

      if (error.message.includes("<!DOCTYPE")) {
        errorMessage = "Error interno del servidor. Contacte al administrador."
      } else {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.createBookContainer}>
      <div className={styles.headerContainer}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <h1 className={styles.title}>Publicar Nuevo Libro</h1>
      </div>

      {successMessage && (
        <div className={styles.successMessage}>
          <div className={styles.checkmark}>✓</div>
          {successMessage}
        </div>
      )}

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Título del Libro *</label>
          <input
            type="text"
            name="title"
            className={styles.input}
            value={bookData.title}
            onChange={handleInputChange}
            required
            minLength="3"
            placeholder="Título del libro"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Sinopsis *</label>
          <textarea
            name="synopsis"
            className={styles.textarea}
            value={bookData.synopsis}
            onChange={handleInputChange}
            rows="6"
            required
            minLength="50"
            placeholder="Escribe una descripción detallada..."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Precio (USD) *</label>
          <div className={styles.priceInput}>
            <span className={styles.currency}>₡</span>
            <input
              type="text"
              name="price"
              className={styles.input}
              value={bookData.price}
              onChange={handleInputChange}
              placeholder=" Ej: 1000"
              pattern="^\d+(\.\d{1,2})?$"
              required
            />
          </div>
        </div>

        <div className={styles.formFooter}>
          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                Publicando...
              </>
            ) : (
              "Publicar Libro"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateBookForm

