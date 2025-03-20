import React, { useState } from 'react';
import styles from "./ProfileSection.module.css";
import { FiEdit, FiBook, FiInfo, FiBookOpen, FiPlus, FiHeart } from "react-icons/fi";
import ModalEditarPerfil from '../ModalPerfil/ModalEditarPerfil'; // Importa el Modal

const BookCard = ({ book, type, onDetails, onRead, onEdit }) => (
  <div className={styles.bookCard}>
    <img
      src={book.cover || "/placeholder-book.jpg"}
      alt={`Portada de ${book.title}`}
      className={styles.bookCover}
    />
    <div className={styles.bookInfo}>
      <h3 className={styles.bookTitle}>{book.title}</h3>
      <p className={styles.bookAuthor}>{book.author}</p>
      <div className={styles.bookActions}>
        <button className={styles.actionButton} onClick={() => onDetails(book.id)}>
          <FiInfo /> Detalles
        </button>
        <button className={styles.actionButton} onClick={() => onRead(book.id)}>
          <FiBookOpen /> Leer
        </button>
        {type === 'published' && (
          <button className={styles.editButton} onClick={() => onEdit(book.id)}>
            <FiEdit /> Editar
          </button>
        )}
        {type === 'favorites' && (
          <button className={styles.favButton} onClick={() => onRemoveFavorite(book.id)}>
            <FiHeart /> Quitar
          </button>
        )}
      </div>
    </div>
  </div>
);

const BooksSection = ({ title, type, books, onAdd, onDetails, onRead, onEdit }) => (
  <div className={styles.section}>
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>
        <FiBook className={styles.titleIcon} />
        {title}
      </h2>
      {type === 'published' && (
        <button className={styles.newBookButton} onClick={onAdd}>
          <FiPlus /> Nuevo libro
        </button>
      )}
    </div>
    <div className={styles.booksGrid}>
      {books?.length > 0 ? (
        books.map(book => (
          <BookCard
            key={book.id}
            book={book}
            type={type}
            onDetails={onDetails}
            onRead={onRead}
            onEdit={onEdit}
          />
        ))
      ) : (
        <div className={styles.emptyState}>
          <p>
            {type === 'purchased' && 'No hay libros comprados aún'}
            {type === 'published' && 'Aún no has publicado libros'}
            {type === 'favorites' && 'No tienes libros favoritos'}
          </p>
          {type === 'published' && (
            <button className={styles.newBookButton} onClick={onAdd}>
              <FiPlus /> Publica tu primer libro
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);

export default function ProfileSection({ userData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Mi nombre',
    bio: 'about me',
    email: 'mi correo',
    // Agrega aquí otros campos que necesites editar
  });

  const placeholderData = {
    purchasedBooks: [],
    publishedBooks: [],
    favoriteBooks: []
  };

  const handleBookDetails = (bookId) => {
    console.log('Ver detalles del libro:', bookId);
    // Navegar a /libros/${bookId}
  };

  const handleReadBook = (bookId) => {
    console.log('Leer libro:', bookId);
    // Abrir lector con libroId
  };

  const handleEditBook = (bookId) => {
    console.log('Editar libro:', bookId);
    // Navegar a /editor/${bookId}
  };

  const handleAddBook = () => {
    console.log('Agregar nuevo libro');
    // Navegar a página de creación
  };

  const handleEditProfileClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveModal = (formData) => {
    setProfileData(formData);
    setIsModalOpen(false);
    // Aquí puedes guardar los datos actualizados en tu backend si es necesario
  };

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.profileSection}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarWrapper}>
                <img
                  src=""
                  alt="Mi foto de perfil"
                  className={styles.avatar}
                />
                <button className={styles.avatarEdit}>
                  <FiEdit className={styles.editIcon} />
                </button>
              </div>
              <div className={styles.profileActions}>
                <button className={styles.followButton}>Seguir</button>
              </div>
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.nameSection}>
                <h1 className={styles.name}>{profileData.name}</h1>
                <span className={styles.verifiedBadge}>✓ Verificado</span>
                <button className={styles.editProfile} onClick={handleEditProfileClick}>
                  <FiEdit /> Editar perfil
                </button>
              </div>
              <p className={styles.bio}>{profileData.bio}</p>
              <div className={styles.metaInfo}>
                <a href="#" className={styles.website}>{profileData.email}</a>
                <span className={styles.joined}>{profileData.memberSince}</span>
              </div>
            </div>
          </div>
          <BooksSection
            title="Libros Comprados"
            type="purchased"
            books={userData?.purchasedBooks || placeholderData.purchasedBooks}
            onDetails={handleBookDetails}
            onRead={handleReadBook}
          />
          <BooksSection
            title="Mis Libros"
            type="published"
            books={userData?.publishedBooks || placeholderData.publishedBooks}
            onAdd={handleAddBook}
            onDetails={handleBookDetails}
            onRead={handleReadBook}
            onEdit={handleEditBook}
          />
          <BooksSection
            title="Libros Favoritos"
            type="favorites"
            books={userData?.favoriteBooks || placeholderData.favoriteBooks}
            onDetails={handleBookDetails}
            onRead={handleReadBook}
          />
        </div>
      </div>
      <ModalEditarPerfil
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userInfo={profileData}
        onSave={handleSaveModal}
      />
    </div>
  );
}