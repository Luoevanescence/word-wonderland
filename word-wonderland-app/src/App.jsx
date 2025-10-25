import React, { useState } from 'react';
import Header from './components/Header';
import CategorySelector from './components/CategorySelector';
import ContentDisplay from './components/ContentDisplay';
import './App.css';

function App() {
  const [activeCategory, setActiveCategory] = useState('words');
  const [count, setCount] = useState(10);

  return (
    <div className="app">
      <Header />
      <div className="container">
        <CategorySelector 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory}
        />
        <ContentDisplay 
          category={activeCategory}
          count={count}
          setCount={setCount}
        />
      </div>
    </div>
  );
}

export default App;

