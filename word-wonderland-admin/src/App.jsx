import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Words from './pages/Words';
import Phrases from './pages/Phrases';
import Sentences from './pages/Sentences';
import Patterns from './pages/Patterns';
import Topics from './pages/Topics';
import PartsOfSpeech from './pages/PartsOfSpeech';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <Router>
      <div className="app">
        <button 
          className="mobile-menu-btn" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="菜单"
        >
          ☰
        </button>
        
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="logo">
            <h2>
              <img src="/logo.svg" alt="Word Wonderland Logo" className="logo-icon" />
              Word Wonderland
            </h2>
            <p>管理员后台</p>
          </div>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end onClick={closeSidebar}>单词</NavLink>
            </li>
            <li>
              <NavLink to="/parts-of-speech" onClick={closeSidebar}>词性</NavLink>
            </li>
            <li>
              <NavLink to="/phrases" onClick={closeSidebar}>短语</NavLink>
            </li>
            <li>
              <NavLink to="/sentences" onClick={closeSidebar}>句子</NavLink>
            </li>
            <li>
              <NavLink to="/patterns" onClick={closeSidebar}>句型</NavLink>
            </li>
            <li>
              <NavLink to="/topics" onClick={closeSidebar}>主题</NavLink>
            </li>
          </ul>
        </nav>
        
        {sidebarOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Words />} />
            <Route path="/parts-of-speech" element={<PartsOfSpeech />} />
            <Route path="/phrases" element={<Phrases />} />
            <Route path="/sentences" element={<Sentences />} />
            <Route path="/patterns" element={<Patterns />} />
            <Route path="/topics" element={<Topics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

