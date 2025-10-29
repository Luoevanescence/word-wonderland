import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="title">
          <img src="/logo.svg" alt="Book Icon" className="logo-icon" />
          Word Wonderland
        </h1>
        <p className="subtitle">探索和学习英语词汇</p>
      </div>
    </header>
  );
}

export default Header;

