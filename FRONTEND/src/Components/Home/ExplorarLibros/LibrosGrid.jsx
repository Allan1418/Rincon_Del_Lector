import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLibros, getBookImageUrl } from '../../../services/ProfileService';
import styles from './LibrosGrid.module.css';

const LibrosGrid = ({ token }) => {
  const [sections, setSections] = useState({
    mostPurchased: [],
    newest: [],
    cheapest: [],
    popular: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const sectionsConfig = [
    {
      title: "Más Vendidos",
      ordering: 'most_purchased',
      key: 'mostPurchased'
    },
    {
      title: "Novedades",
      ordering: '-published_date',
      key: 'newest'
    },
    {
      title: "Gratis",
      ordering: 'price',
      key: 'cheapest'
    }
  ];

  useEffect(() => {
    const fetchAllSections = async () => {
      try {
        const promises = sectionsConfig.map(async (section) => {
          const data = await getLibros(token, null, section.ordering, null, 1, null, null, 8);
          return { key: section.key, data: data.results };
        });

        const results = await Promise.all(promises);
        const newSections = results.reduce((acc, curr) => {
          acc[curr.key] = curr.data;
          return acc;
        }, {});

        setSections(newSections);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error cargando libros');
        setLoading(false);
      }
    };

    fetchAllSections();
  }, [token]);

  const handleCardClick = (bookId) => {
    navigate(`/libros/${bookId}`);
  };

  if (loading) return (
    <div className={styles.loadingContainer}>
      {[...Array(4)].map((_, sectionIndex) => (
        <div key={`skeleton-section-${sectionIndex}`} className={styles.section}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.row}>
            {[...Array(8)].map((_, cardIndex) => (
              <div key={`skeleton-card-${sectionIndex}-${cardIndex}`} className={styles.card}>
                <div className={`${styles.imageContainer} ${styles.skeletonImage}`}></div>
                <div className={styles.skeletonText}></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
  
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      {sectionsConfig.map((section) => (
        <div key={section.key} className={styles.section}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          <div className={styles.row}>
            {sections[section.key].map((book) => (
              <div
                key={book.id}
                className={styles.card}
                onClick={() => handleCardClick(book.id)}
              >
                <div className={styles.imageContainer}>
                  <img
                    src={book.has_image ? getBookImageUrl(book.id) : null}
                    alt={book.title}
                    className={`${styles.image} ${!book.has_image ? styles.noImage : ''}`}
                    loading="lazy"
                  />
                  <div className={styles.overlay}>
                    <p className={styles.price}>${book.price}</p>
                    <button className={styles.viewButton}>Ver detalles</button>
                  </div>
                </div>
                <h3 className={styles.title}>{book.title}</h3>
              </div>
            ))}
          </div>
          <div className={styles.scrollIndicator}>
            <div className={styles.scrollLine}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LibrosGrid;