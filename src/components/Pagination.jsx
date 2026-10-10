import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="btn-outline"
        style={{ padding: '0.5rem 1rem', opacity: currentPage === 1 ? 0.5 : 1 }}
      >
        Previous
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={currentPage === i + 1 ? 'btn-primary' : 'btn-outline'}
          style={{ padding: '0.5rem 0.9rem', borderRadius: '8px' }}
        >
          {i + 1}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="btn-outline"
        style={{ padding: '0.5rem 1rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
