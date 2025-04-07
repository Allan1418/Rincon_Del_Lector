"use client"

import { useState, useEffect } from "react"
import styles from "./LoadingScreen.module.css"

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const numBooks = 15

  useEffect(() => {
    const totalDuration = 2500
    const interval = 50
    const steps = totalDuration / interval
    const increment = 100 / steps

    let currentProgress = 0
    const progressInterval = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= 100) {
        clearInterval(progressInterval)
        setProgress(100)
      } else {
        setProgress(currentProgress)
      }
    }, interval)

    return () => clearInterval(progressInterval)
  }, [])

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => setIsVisible(false), 1000)
    }
  }, [progress])

const getBookOpacity = (index) => {
    const booksLoaded = Math.ceil((progress / 100) * numBooks);
    
    if (index < booksLoaded) {
        return 1;
    }
    
    if (index === booksLoaded) {
        const partialProgress = (progress / 100) * numBooks;
        const decimal = partialProgress - Math.floor(partialProgress);
        return decimal;
    }
    return 0;
};

  if (!isVisible) return null

  return (
    <div className={`${styles.loadingScreen} ${progress === 100 ? styles.fadeOut : ""}`}>
      <div className={styles.container}>
        <div className={styles.librarySign}>
          <span className={styles.signText}>Rincon Del Lector</span>
        </div>

        <div className={styles.bookshelfContainer}>
          <div className={styles.bookshelfTop}></div>
          <div className={styles.bookshelf}>
            <div className={styles.shelfTop}></div>
            <div className={styles.booksContainer}>
              {Array.from({ length: numBooks }).map((_, index) => (
                <div
                    key={index}
                    className={`${styles.book} ${styles[`bookType${index % 6 + 1}`]}`}
                    style={{ 
                        opacity: getBookOpacity(index),
                        animationDelay: `${index * 0.1}s`,
                        height: `${130 + (index % 3) * 10}px`, 
                        width: `${22 + (index % 4) * 3}px`     
                    }}
                >
                  <div className={styles.bookSpine}>
                    <div className={styles.bookTitle}></div>
                    <div className={styles.bookAuthor}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.shelfBottom}></div>
          </div>
          <div className={styles.bookshelfShadow}></div>
        </div>

        <div className={styles.loadingInfo}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
          </div>
          <div className={styles.loadingSubtext}>Rincon del Lector... {Math.round(progress)}%</div>
        </div>

        <div className={styles.libraryDecoration}>
          <div className={styles.decorationItem}></div>
          <div className={styles.decorationItem}></div>
          <div className={styles.decorationItem}></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
