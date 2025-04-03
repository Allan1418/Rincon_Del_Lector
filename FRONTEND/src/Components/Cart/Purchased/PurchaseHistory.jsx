"use client"

import { useState, useEffect } from "react"
import { getPurchaseHistory } from "../../../services/ProfileService"
import { useAuth } from "../../Context/AuthContext"
import styles from "./PurchaseHistory.module.css"
import { Link, useNavigate } from "react-router-dom" // Import useNavigate

const PurchaseHistory = () => {
  const { token, isLoading: authLoading } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate(); // initialize useNavigate

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) {
        return
      }

      setLoading(true)
      setError(null)
      try {
        const data = await getPurchaseHistory(token)
        if (data && data.results) {
          setHistory(data.results)
        } else {
          setError("No se recibieron datos o la estructura es incorrecta.")
        }
      } catch (err) {
        setError(err.message || "Error al obtener la historia de compras.")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [token])

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando datos de autenticación...</p>
      </div>
    )
  }

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando datos...</p>
      </div>
    )

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>!</div>
        <p>Error: {error}</p>
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📚</div>
        <p>No hay historial de compras disponible.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Purchase History</h2>
      <div className={styles.historyList}>
        {history.map((item, index) => (
          <Link key={index} to={`/libros/${item.id_libro}`} className={styles.historyCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.bookTitle}>{item.titulo_libro}</h3>
              <span className={styles.price}>${item.precio}</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Titulo:</span>
                <span className={styles.infoValue}>{item.titulo_libro}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Date:</span>
                <span className={styles.infoValue}>{formatDate(item.fecha)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

const formatDate = (dateString) => {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (e) {
    return dateString
  }
}

export default PurchaseHistory