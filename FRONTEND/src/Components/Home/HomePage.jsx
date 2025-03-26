import React from 'react';
import styles from './Home.module.css';
import Libreria from './Libreria';
import LoadingScreen from '../Hooks/LoadingScreen';

function HomePage() {
  return (
    <div>
      <LoadingScreen />
      <div className={styles.bodyindex}>
        <div className={styles.homeContainer}>
          <div className={styles.heroSection}>
            <div className={styles.heroContent}>
              <h1>Tu espacio para descubrir, crear y compartir historias</h1>
            </div>
          </div>
        </div>
      </div>
      <Libreria />
    </div>
  );
}

export default HomePage;