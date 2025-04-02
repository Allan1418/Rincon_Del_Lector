import React, { useState, useEffect, useCallback } from "react";
import styles from "./Libreria.module.css";
import { getLibros, getBookImageUrl } from "../../services/ProfileService";
import { Link } from "react-router-dom";

function Libreria() {
    const [otherUsersMostSoldBooks, setOtherUsersMostSoldBooks] = useState([]);

    const fetchOtherUsersMostSoldBooks = useCallback(async () => {
        try {
            const response = await getLibros(null, null, "most_purchased", null, null, null, null);

            if (response.error) {
                console.error(`Error al cargar los libros: ${response.error.message || "Error desconocido"}`);
            } else if (response.results && response.results.length > 0) {
                const books = response.results.slice(0, 3);
                setOtherUsersMostSoldBooks(books);
            } else {
                setOtherUsersMostSoldBooks([]);
            }
        } catch (err) {
            console.error(`Error al cargar los libros: ${err.message}`);
        }
    }, []);

    useEffect(() => {
        fetchOtherUsersMostSoldBooks();
    }, [fetchOtherUsersMostSoldBooks]);

    return (
        <div className={styles.libreriaContainer}>
          <div className={styles.libreriaHeader}>
            <span className={styles.headerIcon} aria-hidden="true">
              📚
            </span>
            <h2 className={styles.headerText}>Libros más vendidos de otros usuarios</h2>
          </div>

          <h1 className={styles.libreriaTitle}>Descubre los libros más populares de nuestra comunidad</h1>
          <p className={styles.libreriaDescription}>
            Explora los libros más vendidos por otros miembros de nuestra comunidad.
          </p>

          {otherUsersMostSoldBooks.length === 0 ? (
            <div className={styles.noBooks}>
              <span className={styles.noBooksIcon} aria-hidden="true">
                📖
              </span>
              <p>No se encontraron libros disponibles en este momento</p>
            </div>
          ) : (
            <>
              <div className={styles.booksGrid}>
                {otherUsersMostSoldBooks.map((book) => (
                  <Link
                    to={`/libros/${book.id}`}
                    key={book.id}
                    className={styles.bookLink}
                    aria-label={`Ver detalles de ${book.title || "Libro sin título"}`}
                  >
                    <article className={styles.bookItem}>
                      {book.is_bestseller && <span className={styles.bookBadge}>Más vendido</span>}
                      <div className={styles.bookCover}>
                        <img
                          src={getBookImageUrl(book.id) || "/placeholder.svg"}
                          alt={`Portada de ${book.title || "Libro sin título"}`}
                          className={styles.bookImage}
                          loading="lazy"
                        />
                        {book.price && <div className={styles.priceTag}>{book.price} €</div>}
                      </div>
                      <div className={styles.bookContent}>
                        <h3 className={styles.cardTitle}>{book.title || "Título no disponible"}</h3>
                        <p className={styles.cardAuthor}>Creador: {book.owner || "Desconocido"}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              <div className={styles.exploreButtonContainer}>
                <Link to="/search" className={styles.exploreButton}>
                  Explorar biblioteca completa
                  <span className={styles.bookIcon} aria-hidden="true">
                    📚
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>
    );
}

export default Libreria;