"use client"

import { useState, useEffect } from "react"
import { getOwnerEarnings } from "../../../services/ProfileService"
import { useAuth } from "../../Context/AuthContext"
import styles from "./OwnerEarningsView.module.css"
import EarningsChart from "./EarningsChart"

const OwnerEarningsView = () => {
  const { token, isLoading: authLoading } = useAuth()
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!token) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await getOwnerEarnings(token)
        setEarnings(response)
      } catch (err) {
        setError(err.message || "Error al obtener las ganancias del propietario.")
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [token])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getMonthName = (monthNumber) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    return months[monthNumber - 1]
  }

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando datos de autenticación...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando datos de ganancias...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>!</div>
        <h3>Error al cargar los datos</h3>
        <p>{error}</p>
        <button className={styles.retryButton} onClick={() => window.location.reload()}>
          Intentar de nuevo
        </button>
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>📊</div>
        <h3>Sin datos disponibles</h3>
        <p>No hay información de ganancias para mostrar en este momento.</p>
        <button className={styles.refreshButton} onClick={() => window.location.reload()}>
          Refrescar
        </button>
      </div>
    )
  }

  const earningsByYear = {}
  if (earnings?.monthly_earnings) {
    earnings.monthly_earnings.forEach((item) => {
      if (!earningsByYear[item.year]) {
        earningsByYear[item.year] = []
      }
      earningsByYear[item.year].push(item)
    })
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ganancias del Propietario</h1>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === "overview" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Resumen
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "monthly" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("monthly")}
          >
            Detalle Mensual
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "chart" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("chart")}
          >
            Gráfica
          </button>
        </div>
      </header>

      {activeTab === "overview" && (
        <div className={styles.overviewSection}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h2>Ganancias Totales</h2>
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.totalAmount}>{formatCurrency(earnings?.total_earnings || 0)}</div>
              <div className={styles.summaryFooter}>
                <span>Actualizado al {new Date().toLocaleDateString("es-CR")}</span>
              </div>
            </div>
          </div>

          <div className={styles.statsGrid}>
            {Object.keys(earningsByYear).length > 0 ? (
              Object.keys(earningsByYear)
                .sort((a, b) => b - a)
                .map((year) => {
                  const yearTotal = earningsByYear[year].reduce(
                    (accumulator, currentMonth) => accumulator + (Number(currentMonth.total) || 0),
                    0,
                  )

                  return (
                    <div key={year} className={styles.statCard}>
                      <div className={styles.statYear}>{year}</div>
                      <div className={styles.statAmount}>{formatCurrency(yearTotal)}</div>
                      <div className={styles.statLabel}>Total anual</div>
                    </div>
                  )
                })
            ) : (
              <p>No hay datos disponibles para mostrar.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "monthly" && (
        <div className={styles.monthlySection}>
          <div className={styles.noEarningsMessage}>
            <h2>No tienes ninguna ganancia en los últimos meses</h2>
          </div>
          {Object.keys(earningsByYear).length > 0 &&
            Object.keys(earningsByYear)
              .sort((a, b) => b - a)
              .map((year) => (
                <div key={year} className={styles.yearSection}>
                  <h2 className={styles.yearTitle}>{year}</h2>
                  <div className={styles.monthsGrid}>
                    {earningsByYear[year]
                      .sort((a, b) => b.month - a.month)
                      .map((item, index) => (
                        <div key={index} className={styles.monthCard}>
                          <div className={styles.monthName}>{getMonthName(item.month)}</div>
                          <div className={styles.monthAmount}>{formatCurrency(item.total)}</div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
        </div>
      )}

      {activeTab === "chart" && (
        <div className={styles.chartSection}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h2>Evolución de Ganancias Mensuales</h2>
            </div>
            <div className={styles.chartContent}>¿
              <EarningsChart earningsData={earnings} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerEarningsView

