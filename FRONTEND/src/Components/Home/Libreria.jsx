import { useState, useEffect } from "react";
import styles from "./Libreria.module.css";
import { getLibros } from "../../services/ProfileService"; // Assuming your service file is named ProfileService.js

function Libreria() {
  const [mostPurchasedBooks, setMostPurchasedBooks] = useState([]);
  const token = localStorage.getItem("Authorization");

  useEffect(() => {
    const fetchMostPurchasedBooks = async () => {
      try {
        const books = await getLibros(token, null, null, null, true); // Assuming this fetches purchased books
        if (books && books.results) {
          // Sort books by purchase count (assuming books have a 'purchase_count' or similar property)
          const sortedBooks = books.results.sort(
            (a, b) => (b.purchase_count || 0) - (a.purchase_count || 0)
          );
          // Take the top 3 most purchased books
          setMostPurchasedBooks(sortedBooks.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching most purchased books:", error);
      }
    };

    fetchMostPurchasedBooks();
  }, [token]);

  return (
    <div className={styles.libreriaContainer}>
      <div className={styles.libreriaHeader}>
        <span className={styles.headerIcon}>📚</span>
        <h3 className={styles.headerText}>Libros más comprados</h3>
      </div>

      <h1 className={styles.libreriaTitle}>Descubre los favoritos de nuestra comunidad</h1>

      <p className={styles.libreriaDescription}>
        Explora los libros que más han cautivado a nuestros lectores.
      </p>

      <div className={styles.booksGrid}>
        {mostPurchasedBooks.map((book) => (
          <div key={book.id} className={styles.bookItem}>
            <div className={styles.bookImageContainer}>
              <img src={book.coverImage || "/placeholder.svg"} alt={`Portada de ${book.title}`} className={styles.bookImage} />
              <button className={styles.bookButtonLeft}>←</button>
              <button className={styles.bookButtonRight}>☰</button>
            </div>
            <div className={styles.bookContent}>
              <p className={styles.bookGenre}>{book.genre || "Género Desconocido"}</p>
              <h3 className={styles.bookTitle}>{book.title}</h3>
              <p className={styles.bookAuthor}>{book.owner}</p>
              <p className={styles.bookDescription}>{book.synopsis}</p>
              <a href={`/book/${book.id}`} className={styles.readMore}>
                Leer más <span className={styles.arrowIcon}>→</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.exploreButtonContainer}>
        <button className={styles.exploreButton}>
          Explorar biblioteca completa <span className={styles.bookIcon}>📚</span>
        </button>
      </div>
    </div>
  );
}

export default Libreria;