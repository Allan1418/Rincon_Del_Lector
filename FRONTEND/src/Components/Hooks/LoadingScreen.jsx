import { useState, useEffect } from 'react';
import styles from './LoadingScreen.module.css';

const LoadingScreen = () => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const numBooks = 10; 

    useEffect(() => {
        const totalDuration = 2000;
        const interval = 50;
        const steps = totalDuration / interval;
        const increment = 100 / steps;

        let currentProgress = 0;
        const progressInterval = setInterval(() => {
            currentProgress += increment;
            if (currentProgress >= 100) {
                clearInterval(progressInterval);
                setProgress(100);
            } else {
                setProgress(currentProgress);
            }
        }, interval);

        return () => clearInterval(progressInterval);
    }, []);

    useEffect(() => {
        if (progress === 100) {
            setTimeout(() => setIsVisible(false), 1000);
        }
    }, [progress]);

    const getBookOpacity = (index) => {
        const booksLoaded = Math.ceil((progress / 100) * numBooks);
        return index < booksLoaded ? 1 : 0.2;
    };

    if (!isVisible) return null;

    return (
      <div className={`${styles.loadingScreen} ${progress === 100 ? styles.fadeOut : ''}`}>
          <div className={styles.bookshelf}>
              {Array.from({ length: 10 }).map((_, index) => ( 
                  <div
                      key={index}
                      className={styles.book}
                      style={{ opacity: getBookOpacity(index) }}
                  ></div>
              ))}
              <div className={styles.loadingText}>
                  Rincon Del Lector...
              </div>
          </div>
      </div>
  );
};

export default LoadingScreen;