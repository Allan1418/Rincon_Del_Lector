// ErrorDisplay.js
import React from 'react';
import styles from './ErrorDisplay.module.css';

const formatErrorMessage = (error) => {
  if (!error) return 'Error desconocido';
  
  if (typeof error === 'string') return error;
  
  if (error.detail) return error.detail;
  
  if (error.message) {
    if (Array.isArray(error.message)) {
      return error.message.join(', ');
    }
    return error.message;
  }
  
  if (typeof error === 'object') {
    return Object.keys(error).map(key => {
      const messages = Array.isArray(error[key]) ? error[key].join(', ') : error[key];
      return `${key}: ${messages}`;
    }).join('\n');
  }

  return 'Error desconocido';
};

const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>⚠️</div>
      <div className={styles.errorMessage}>
        {formatErrorMessage(error)}
      </div>
    </div>
  );
};

export default ErrorDisplay;