import React, { useState } from 'react';
import Header from './components/Header';
import CategorySelector from './components/CategorySelector';
import ContentDisplay from './components/ContentDisplay';
import Statistics from './components/Statistics';
import BottomNav from './components/BottomNav';
import { FloatingParticles, BackgroundPattern } from './components/DecorativeElements';
import './App.css';

function App() {
  const [activeCategory, setActiveCategory] = useState('words');
  const [count, setCount] = useState(10);
  const [activeTab, setActiveTab] = useState('home');

  return (
    <>
      <div className="app">
        {/* 背景装饰动画 */}
        <BackgroundPattern />
        <FloatingParticles />
        
        <Header />
        <div className="container">
          {activeTab === 'home' && (
            <>
              <Statistics />
              <CategorySelector 
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory}
              />
              <ContentDisplay 
                category={activeCategory}
                count={count}
                setCount={setCount}
              />
            </>
          )}
          {activeTab === 'learn' && (
            <div className="tab-content">
              <h2 className="tab-title">学习模式</h2>
              <p className="tab-description">选择学习内容开始练习</p>
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
          )}
          {activeTab === 'analytics' && (
            <div className="tab-content">
              <h2 className="tab-title">学习分析</h2>
              <Statistics />
              <div className="analytics-placeholder">
                <p>更多统计数据即将推出...</p>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="tab-content">
              <h2 className="tab-title">设置</h2>
              <div className="settings-placeholder">
                <p>设置选项即将推出...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 将导航栏移到 app 容器外部，避免被父容器样式影响 */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
}

export default App;

