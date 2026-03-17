import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  fullScreen = false,
  text = null,
  className = ''
}) => {
  const spinnerClasses = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${color}`,
    fullScreen ? 'loading-spinner--fullscreen' : '',
    className
  ].filter(Boolean).join(' ');

  const Spinner = () => (
    <div className={spinnerClasses}>
      <div className="spinner-ring">
        <div className="spinner-core"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <Spinner />
      </div>
    );
  }

  return <Spinner />;
};

export default LoadingSpinner;