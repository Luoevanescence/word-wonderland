import React from 'react';
import './Header.css';
import { ShineEffect } from './DecorativeElements';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <ShineEffect />
        <div className="header-decoration header-decoration-left"></div>
        <div className="header-decoration header-decoration-right"></div>
        <h1 className="title">
          <div className="logo-wrapper">
            <img src="/logo.svg" alt="Book Icon" className="logo-icon" />
            <div className="logo-glow"></div>
          </div>
          <span className="title-text">Word Wonderland</span>
        </h1>
        <p className="subtitle">探索和学习英语词汇的奇妙世界</p>
      </div>
    </header>
  );
}

export default Header;

