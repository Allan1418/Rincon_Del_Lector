"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getLibroById, getBookImageUrl, downloadBookEpub } from "../../services/ProfileService"
import LoadingScreen from "../Hooks/LoadingScreen"
import ErrorDisplay from "../Hooks/ErrorDisplay"
import { Book, Calendar, BadgeCent , User, ArrowLeft, BookOpen, Download, Edit } from "lucide-react"
import styles from "./BookDetails.module.css"

const BookDetails = () => {
    const { bookId } = useParams()
    const navigate = useNavigate()
    const [book, setBook] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [downloadLoading, setDownloadLoading] = useState(false)
    const [downloadError, setDownloadError] = useState(null)

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const bookData = await getLibroById(bookId)
                setBook(bookData)
            } catch (err) {
                setError(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBook()
    }, [bookId])

    const handleDownloadEpub = async () => {
        setDownloadLoading(true)
        setDownloadError(null)

        try {
            const response = await downloadBookEpub(bookId, token)

            const contentType = response.headers.get("content-type")
            if (!contentType?.includes("epub")) {
                throw new Error("El archivo no es un EPUB válido")
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${book.title.replace(/\s+/g, "_")}.epub`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            setDownloadError(err.message)
        } finally {
            setDownloadLoading(false)
        }
    }

    if (isLoading) return <LoadingScreen />
    if (error) return <ErrorDisplay error={error} />

    return (
        <div className={styles.bookDetailsContainer}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
                <span>Volver</span>
            </button>

            <div className={styles.bookHeader}>
                <div className={styles.coverContainer}>
                    <img
                        src={getBookImageUrl(bookId) || "/placeholder.svg"}
                        alt={`Portada de ${book.title}`}
                        className={styles.bookCover}
                    />
                </div>

                <div className={styles.mainContent}>
                    <h1 className={styles.bookTitle}>
                        <BookOpen className={styles.titleIcon} />
                        <span>{book.title}</span>
                    </h1>

                    <div className={styles.metaGrid}>
                        <button
                            onClick={() => navigate(`/user/${book.owner}`)}
                            className={styles.metaCard}
                        >
                            <div className={styles.metaItem}>
                                <User className={styles.metaIcon} />
                                <div>
                                    <div className={styles.metaLabel}>Propietario</div>
                                    <div className={styles.ownerLink}>
                                        <div className={styles.metaValue}>{book.owner}</div>
                                    </div>
                                </div>
                            </div>
                        </button>

                        <div className={styles.metaCard}>
                            <div className={styles.metaItem}>
                                <Calendar className={styles.metaIcon} />
                                <div>
                                    <div className={styles.metaLabel}>Fecha de publicación</div>
                                    <div className={styles.metaValue}>{new Date(book.published_date).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actionRow}>
                        <div className={styles.priceBadge}>
                            <BadgeCent  size={20} />
                            <span>{book.price}</span>
                        </div>

                        <button className={styles.editButton} onClick={() => navigate(`/edit-book/${bookId}`)}>
                            <Edit size={18} />
                            <span>Editar</span>
                        </button>
                    </div>

                    <div className={styles.downloadSection}>
                        <button className={styles.downloadButton} onClick={handleDownloadEpub} disabled={downloadLoading}>
                            {downloadLoading ? (
                                <>
                                    <div className={styles.spinner} />
                                    <span>Descargando...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={20} />
                                    <span>Descargar EPUB</span>
                                </>
                            )}
                        </button>
                        {downloadError && (
                            <div className={styles.downloadError}>
                                {downloadError}
                                {downloadError.includes("denegado") && (
                                    <Link to="/soporte" className={styles.contactLink}>
                                        Contactar soporte
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.synopsisSection}>
                <h2 className={styles.sectionTitle}>
                    <Book className={styles.sectionIcon} />
                    <span>Sinopsis</span>
                </h2>
                <p className={styles.synopsisText}>{book.synopsis || "Este libro no tiene sinopsis disponible."}</p>
            </div>
        </div>
    )
}

export default BookDetails