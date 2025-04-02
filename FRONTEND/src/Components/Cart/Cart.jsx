"use client"

import { useState, useEffect, useRef } from "react"
import styles from "./Cart.module.css"
import { getCarrito, removeFromCart, purchaseCart } from "../../services/ProfileService" // Import missing functions

const Cart = () => {
  const [token, setToken] = useState(localStorage.getItem("Authorization"))
  const [carrito, setCarrito] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [notification, setNotification] = useState(null)
  const [animateItems, setAnimateItems] = useState({})

  // Refs for interactive elements
  const totalContainerRef = useRef(null)
  const titleRef = useRef(null)

  const fetchCarritoData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCarrito(token)
      console.log("Datos del carrito:", data)
      setCarrito(data)

      // Initialize animation states for each item
      if (data && data.libros) {
        const animationStates = {}
        data.libros.forEach((libro) => {
          animationStates[libro.id] = false
        })
        setAnimateItems(animationStates)
      }
    } catch (err) {
      setError(err.message || "Error al cargar el carrito")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchCarritoData()
    } else {
      setLoading(false)
      setError("Token de autenticación no disponible")
    }
  }, [token])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Add hover effect to total container
  useEffect(() => {
    const handleScroll = () => {
      if (totalContainerRef.current) {
        const rect = totalContainerRef.current.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0

        if (isVisible) {
          totalContainerRef.current.style.transform = "translateY(-5px)"
          totalContainerRef.current.style.boxShadow = "var(--shadow-lg)"
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Interactive hover effect for items
  const handleItemHover = (libroId, isHovering) => {
    setAnimateItems((prev) => ({
      ...prev,
      [libroId]: isHovering,
    }))
  }

  const handleRemoveFromCart = async (libroId, libroTitle) => {
    if (confirmAction === `remove-${libroId}`) {
      try {
        setIsProcessing(true)
        await removeFromCart(token, libroId)

        // Add a visual effect before removing
        setAnimateItems((prev) => ({
          ...prev,
          [libroId]: "removing",
        }))

        // Wait for animation
        setTimeout(async () => {
          setNotification({
            type: "success",
            message: `"${libroTitle}" ha sido eliminado del carrito`,
          })
          await fetchCarritoData() // Actualiza el carrito después de la eliminación
        }, 300)
      } catch (err) {
        setNotification({
          type: "error",
          message: err.message || "Error al eliminar el libro del carrito",
        })
      } finally {
        setIsProcessing(false)
        setConfirmAction(null)
      }
    } else {
      setConfirmAction(`remove-${libroId}`)
    }
  }

  const handlePurchaseCart = async () => {
    if (!carrito || carrito.libros.length === 0) return

    if (confirmAction === "purchase") {
      try {
        setIsProcessing(true)

        // Add visual feedback during processing
        if (totalContainerRef.current) {
          totalContainerRef.current.classList.add(styles.processing)
        }

        await purchaseCart(token)

        setNotification({
          type: "success",
          message: "¡Compra realizada con éxito!",
        })

        // Add a small delay for better UX
        setTimeout(() => {
          fetchCarritoData()
          if (totalContainerRef.current) {
            totalContainerRef.current.classList.remove(styles.processing)
          }
        }, 500)
      } catch (err) {
        setNotification({
          type: "error",
          message: err.message || "Error al procesar la compra",
        })
        if (totalContainerRef.current) {
          totalContainerRef.current.classList.remove(styles.processing)
        }
      } finally {
        setIsProcessing(false)
        setConfirmAction(null)
      }
    } else {
      setConfirmAction("purchase")

      // Add a subtle animation to the total container
      if (totalContainerRef.current) {
        totalContainerRef.current.style.transform = "scale(1.03)"
        setTimeout(() => {
          if (totalContainerRef.current) {
            totalContainerRef.current.style.transform = ""
          }
        }, 300)
      }
    }
  }

  const cancelAction = () => {
    setConfirmAction(null)
  }

  if (loading) {
    return (
      <div className={styles.carritoContainer}>
        <h2 className={styles.title} ref={titleRef}>
          Mi Carrito
        </h2>
        <div className={styles.skeletonContainer}>
          {[1, 2, 3].map((item) => (
            <div key={item} className={styles.skeletonItem}>
              <div className={styles.skeletonTitle}></div>
              <div className={styles.skeletonDetail}></div>
              <div className={styles.skeletonDetail}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.carritoContainer}>
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>{notification.message}</div>
      )}

      <h2 className={styles.title} ref={titleRef}>
        Mi Carrito
      </h2>

      {error ? (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>!</div>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.retryButton} onClick={fetchCarritoData}>
            Reintentar
          </button>
        </div>
      ) : !carrito || carrito.libros.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>🛒</div>
          <p className={styles.emptyMessage}>Tu carrito está vacío</p>
          <p className={styles.emptySubMessage}>¡Agrega algunos libros para comenzar!</p>
        </div>
      ) : (
        <div className={styles.cartContent}>
          <div className={styles.itemsContainer}>
            <ul className={styles.itemsList}>
              {carrito.libros.map((libro) => (
                <li
                  key={libro.id}
                  className={`${styles.libroItem} ${animateItems[libro.id] === "removing" ? styles.removing : ""}`}
                  onMouseEnter={() => handleItemHover(libro.id, true)}
                  onMouseLeave={() => handleItemHover(libro.id, false)}
                >
                  <div className={styles.libroInfo}>
                    <h3 className={styles.libroTitle}>{libro.title}</h3>
                    <p className={styles.libroDetail}>
                      <span className={styles.detailLabel}>Autor:</span> {libro.owner}
                    </p>
                    <p className={styles.libroDetail}>
                      <span className={styles.detailLabel}>Precio:</span>{" "}
                      <span className={styles.price}>${libro.price}</span>
                    </p>
                  </div>
                  {confirmAction === `remove-${libro.id}` ? (
                    <div className={styles.confirmActions}>
                      <p className={styles.confirmText}>¿Eliminar este libro?</p>
                      <div className={styles.confirmButtons}>
                        <button
                          className={`${styles.confirmButton} ${styles.confirmYes}`}
                          onClick={() => handleRemoveFromCart(libro.id, libro.title)}
                          disabled={isProcessing}
                        >
                          Sí
                        </button>
                        <button
                          className={`${styles.confirmButton} ${styles.confirmNo}`}
                          onClick={cancelAction}
                          disabled={isProcessing}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveFromCart(libro.id, libro.title)}
                      disabled={isProcessing || confirmAction !== null}
                      aria-label={`Quitar ${libro.title} del carrito`}
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.totalContainer} ref={totalContainerRef}>
            <div className={styles.totalInfo}>
              <p className={styles.subtotalLabel}>Subtotal:</p>
              <p className={styles.subtotalValue}>${carrito.total}</p>
              <p className={styles.totalLabel}>Total:</p>
              <p className={styles.total}>${carrito.total}</p>
            </div>

            {confirmAction === "purchase" ? (
              <div className={styles.purchaseConfirm}>
                <p className={styles.confirmPurchaseText}>¿Confirmar tu compra?</p>
                <div className={styles.confirmPurchaseButtons}>
                  <button
                    className={`${styles.confirmButton} ${styles.confirmYes}`}
                    onClick={handlePurchaseCart}
                    disabled={isProcessing}
                  >
                    Confirmar
                  </button>
                  <button
                    className={`${styles.confirmButton} ${styles.confirmNo}`}
                    onClick={cancelAction}
                    disabled={isProcessing}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                className={styles.purchaseButton}
                onClick={handlePurchaseCart}
                disabled={isProcessing || confirmAction !== null}
              >
                {isProcessing ? (
                  <span className={styles.processingText}>
                    <span className={styles.loadingDot}></span>
                    <span className={styles.loadingDot}></span>
                    <span className={styles.loadingDot}></span>
                  </span>
                ) : (
                  "Comprar Ahora"
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart

