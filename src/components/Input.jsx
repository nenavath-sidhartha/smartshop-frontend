import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input className={`form-control ${className}`} {...props} />
      {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{error}</span>}
    </div>
  );
};

export default Input;
