import styles from "./Libreria.module.css"

function Libreria() {
  return (
    <div className={styles.libreriaContainer}>
      
      {/* Encabezado */}
      <div className={styles.libreriaHeader}>
        <span className={styles.headerIcon}>📚</span>
        <h3 className={styles.headerText}>Libros destacados</h3>
      </div>

      {/* Título principal */}
      <h1 className={styles.libreriaTitle}>Descubre mundos a través de las páginas</h1>

      {/* Descripción */}
      <p className={styles.libreriaDescription}>
        Explora nuestra colección cuidadosamente seleccionada de obras que han cautivado a lectores de todo el mundo.
      </p>

      {/* Grid de libros */}
      <div className={styles.booksGrid}>
        {/* Libro 1 */}
        <div className={styles.bookItem}>
          <div className={styles.bookImageContainer}>
            <div className={styles.bookImage}></div>
            <button className={styles.bookButtonLeft}>←</button>
            <button className={styles.bookButtonRight}>☰</button>
          </div>
          <div className={styles.bookContent}>
            <p className={styles.bookGenre}>Género 1</p>
            <h3 className={styles.bookTitle}>Título del libro 1</h3>
            <p className={styles.bookAuthor}>Autor del libro 1</p>
            <p className={styles.bookDescription}>Descripción breve del libro 1.</p>
            <a href="#" className={styles.readMore}>
              Leer más <span className={styles.arrowIcon}>→</span>
            </a>
          </div>
        </div>

        {/* Libro 2 */}
        <div className={styles.bookItem}>
          <div className={styles.bookImageContainer}>
            <div className={styles.bookImage}></div>
            <button className={styles.bookButtonLeft}>←</button>
            <button className={styles.bookButtonRight}>☰</button>
          </div>
          <div className={styles.bookContent}>
            <p className={styles.bookGenre}>Género 2</p>
            <h3 className={styles.bookTitle}>Título del libro 2</h3>
            <p className={styles.bookAuthor}>Autor del libro 2</p>
            <p className={styles.bookDescription}>Descripción breve del libro 2.</p>
            <a href="#" className={styles.readMore}>
              Leer más <span className={styles.arrowIcon}>→</span>
            </a>
          </div>
        </div>

        {/* Libro 3 */}
        <div className={styles.bookItem}>
          <div className={styles.bookImageContainer}>
            <div className={styles.bookImage}></div>
            <button className={styles.bookButtonLeft}>←</button>
            <button className={styles.bookButtonRight}>☰</button>
          </div>
          <div className={styles.bookContent}>
            <p className={styles.bookGenre}>Género 3</p>
            <h3 className={styles.bookTitle}>Título del libro 3</h3>
            <p className={styles.bookAuthor}>Autor del libro 3</p>
            <p className={styles.bookDescription}>Descripción breve del libro 3.</p>
            <a href="#" className={styles.readMore}>
              Leer más <span className={styles.arrowIcon}>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Botón de explorar */}
      <div className={styles.exploreButtonContainer}>
        <button className={styles.exploreButton}>
          Explorar biblioteca completa <span className={styles.bookIcon}>📚</span>
        </button>
      </div>
    </div>
  )
}

export default Libreria

