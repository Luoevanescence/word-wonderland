import React from 'react';
import './DecorativeElements.css';

// 浮动粒子效果 - 来自 uiverse.io/gharsh11032000/tasty-frog-49
export function FloatingParticles() {
  return (
    <div className="floating-particles">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="particle" style={{ '--i': i }}></div>
      ))}
    </div>
  );
}

// 波浪加载器 - 来自 uiverse.io/milley69/chilly-swan-51
export function WaveLoader({ visible = false }) {
  if (!visible) return null;
  
  return (
    <div className="wave-loader">
      <div className="wave-circle"></div>
      <div className="wave-circle"></div>
      <div className="wave-circle"></div>
    </div>
  );
}

// 闪光按钮效果 - 来自 uiverse.io/vinodjangid07/bitter-eagle-34
export function ShineEffect() {
  return (
    <div className="shine-effect"></div>
  );
}

// 装饰性背景图案
export function BackgroundPattern() {
  return (
    <div className="background-pattern">
      <div className="pattern-circle pattern-1"></div>
      <div className="pattern-circle pattern-2"></div>
      <div className="pattern-circle pattern-3"></div>
    </div>
  );
}

// 统计卡片装饰
export function StatsDecoration({ count, label }) {
  return (
    <div className="stats-decoration">
      <div className="stats-number">{count}</div>
      <div className="stats-label">{label}</div>
      <div className="stats-glow"></div>
    </div>
  );
}

