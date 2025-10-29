import React from 'react';
import { ShineEffect } from './DecorativeElements';
import './LiquidButton.css';

function LiquidButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = '',
  icon = null,
  withShine = true
}) {
  return (
    <button 
      className={`liquid-button liquid-button-${variant} ${className} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="liquid-button-bg"></span>
      {withShine && <ShineEffect />}
      <span className="liquid-button-content">
        {icon && <span className="liquid-button-icon">{icon}</span>}
        {children}
      </span>
    </button>
  );
}

export default LiquidButton;

