import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-outline';
  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
