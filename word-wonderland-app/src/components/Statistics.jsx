import React, { useState, useEffect } from 'react';
import './Statistics.css';
import { StackIcon, ClockIcon, CycleCalendarIcon, FireIcon } from './icons/Icons';

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
          <StackIcon color="currentColor" />
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
          <ClockIcon color="currentColor" />
        </div>
        <div className="stat-content">
          <div className="stat-label">今日学习</div>
          <div className="stat-value">{stats.todayLearned}</div>
          <div className="stat-subtitle">每日平均 {stats.weeklyAverage}</div>
        </div>
      </div>

      <div className="stat-card stat-card-accent">
        <div className="stat-icon">
          <CycleCalendarIcon color="currentColor" />
        </div>
        <div className="stat-content">
          <div className="stat-label">连续天数</div>
          <div className="stat-value">{stats.streak} 天</div>
          <div className="stat-subtitle">
            继续保持 <FireIcon color="#F59E0B" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;

