import React, { useState, useEffect } from 'react';
import './Statistics.css';

function Statistics() {
  const [stats, setStats] = useState({
    totalWords: 0,
    todayLearned: 0,
    weeklyAverage: 0,
    streak: 0
  });

  useEffect(() => {
    // 从 localStorage 获取统计数据
    const savedStats = localStorage.getItem('learningStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    } else {
      // 初始化默认数据
      const initialStats = {
        totalWords: 156,
        todayLearned: 12,
        weeklyAverage: 45,
        streak: 7
      };
      setStats(initialStats);
      localStorage.setItem('learningStats', JSON.stringify(initialStats));
    }
  }, []);

  return (
    <div className="statistics-container">
      <div className="stat-card stat-card-primary">
        <div className="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="stat-content">
          <div className="stat-label">总学习量</div>
          <div className="stat-value">{stats.totalWords}</div>
          <div className="stat-trend">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>+12%</span>
          </div>
        </div>
      </div>

      <div className="stat-card stat-card-secondary">
        <div className="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="stat-content">
          <div className="stat-label">今日学习</div>
          <div className="stat-value">{stats.todayLearned}</div>
          <div className="stat-subtitle">每日平均 {stats.weeklyAverage}</div>
        </div>
      </div>

      <div className="stat-card stat-card-accent">
        <div className="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="stat-content">
          <div className="stat-label">连续天数</div>
          <div className="stat-value">{stats.streak} 天</div>
          <div className="stat-subtitle">继续保持 🔥</div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;

