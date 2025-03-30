"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getLibroById, getBookImageUrl, downloadBookEpub } from "../../services/ProfileService";
import LoadingScreen from "../Hooks/LoadingScreen";
import ErrorDisplay from "../Hooks/ErrorDisplay";
import { Book, Clock, Calendar, DollarSign, User, ArrowLeft, BookOpen, Download } from 'lucide-react';
import styles from "./BookDetails.module.css";

const BookDetails = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [downloadError, setDownloadError] = useState(null);
    const token = localStorage.getItem("Authorization");

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const bookData = await getLibroById(bookId, token);
                setBook(bookData);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBook();
    }, [bookId, token]);

    const handleDownloadEpub = async () => {
        setDownloadLoading(true);
        setDownloadError(null);

        try {
            const response = await downloadBookEpub(bookId, token);

            const contentType = response.headers.get('content-type');
            if (!contentType?.includes('epub')) {
                throw new Error('El archivo no es un EPUB válido');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${book.title.replace(/\s+/g, '_')}.epub`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            setDownloadError(err.message);
        } finally {
            setDownloadLoading(false);
        }
    };

    if (isLoading) return <LoadingScreen />;
    if (error) return <ErrorDisplay error={error} />;

    return (
        <div className={styles.bookDetailsContainer}>
            <button
                className={styles.backButton}
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={20} />
                Volver
            </button>

            <div className={styles.bookHeader}>
                <img
                    src={getBookImageUrl(bookId) || "/placeholder.svg"}
                    alt={`Portada de ${book.title}`}
                    className={styles.bookCover}
                />

                <div className={styles.mainContent}>
                    <h1 className={styles.bookTitle}>
                        <BookOpen size={28} />
                        {book.title}
                    </h1>

                    <div className={styles.downloadSection}>
                        <button
                            className={styles.downloadButton}
                            onClick={handleDownloadEpub}
                            disabled={downloadLoading}
                        >
                            {downloadLoading ? (
                                <>
                                    <div className={styles.spinner} />
                                    Descargando...
                                </>
                            ) : (
                                <>
                                    <Download size={20} />
                                    Descargar EPUB
                                </>
                            )}
                        </button>
                        {downloadError && (
                            <div className={styles.downloadError}>
                                {downloadError}
                                {downloadError.includes('denegado') && (
                                    <Link to="/soporte" className={styles.contactLink}>
                                        Contactar soporte
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={styles.metaGrid}>
                        <div className={styles.metaCard}>
                            <div className={styles.metaItem}>
                                <User size={20} />
                                <div className={styles.metaLabel}>Propietario</div>
                                <Link to={`/user/${book.owner}`} >
                                    <div className={styles.metaValue}>{book.owner}</div>
                                </Link>
                            </div>
                        </div>

                        <div className={styles.metaCard}>
                            <div className={styles.metaItem}>
                                <Calendar size={20} />
                                <div>
                                    <div className={styles.metaLabel}>Fecha de publicación</div>
                                    <div className={styles.metaValue}>
                                        {new Date(book.published_date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.priceBadge}>
                        <DollarSign size={24} />
                        {book.price}
                    </div>
                </div>
            </div>

            <div className={styles.synopsisSection}>
                <h2 className={styles.sectionTitle}>
                    <Book size={24} />
                    Sinopsis
                </h2>
                <p className={styles.synopsisText}>
                    {book.synopsis || 'Este libro no tiene sinopsis disponible.'}
                </p>
            </div>
        </div>
    );
};

export default BookDetails;