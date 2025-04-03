import styles from "./ErrorDisplay.module.css"

const formatErrorMessage = (error) => {
  if (!error) return "Error desconocido"

  if (typeof error === "string") return error

  if (error.detail) return error.detail

  if (error.message) {
    if (Array.isArray(error.message)) {
      return error.message.join(", ")
    }
    return error.message
  }

  if (typeof error === "object") {
    return Object.keys(error)
      .map((key) => {
        const messages = Array.isArray(error[key]) ? error[key].join(", ") : error[key]
        return `${key}: ${messages}`
      })
      .join("\n")
  }

  return "Error desconocido"
}

const ErrorDisplay = ({ error }) => {
  if (!error) return null

  return (
    <div className={styles.errorWrapper}>
      <div className={styles.errorContainer}>
        <div className={styles.errorHeader}>
          <div className={styles.errorIcon}>📚</div>
          <h3 className={styles.errorTitle}>¡Ups! Página no encontrada</h3>
        </div>
        <div className={styles.errorContent}>
          <p className={styles.errorMessage}>{formatErrorMessage(error)}</p>
          <p className={styles.errorHint}>
            Parece que esta página se ha perdido entre nuestros estantes. Por favor, intenta buscar de nuevo o regresa a
            nuestra biblioteca principal.
          </p>
        </div>
        <div className={styles.errorFooter}>
          <div className={styles.bookmarkLeft}></div>
          <div className={styles.bookmarkRight}></div>
        </div>
      </div>
    </div>
  )
}

export default ErrorDisplay

