import React from 'react';

const ErrorMessage = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <div style={{
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#b91c1c',
      padding: '1.25rem',
      borderRadius: '10px',
      margin: '1.5rem 0',
      textAlign: 'center'
    }}>
      <p style={{ fontWeight: 600, marginBottom: onRetry ? '0.75rem' : '0' }}>⚠️ {message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
