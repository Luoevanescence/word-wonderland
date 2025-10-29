import React from 'react';
import { WaveLoader } from './DecorativeElements';
import './LoadingSpinner.css';

function LoadingSpinner({ size = 'medium', text = '加载中...', variant = 'ring' }) {
  if (variant === 'wave') {
    return (
      <div className={`loading-spinner loading-spinner-${size}`}>
        <WaveLoader visible={true} />
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className={`loading-spinner loading-spinner-${size}`}>
      <div className="spinner-ring">
        <div className="spinner-segment"></div>
        <div className="spinner-segment"></div>
        <div className="spinner-segment"></div>
        <div className="spinner-segment"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;

