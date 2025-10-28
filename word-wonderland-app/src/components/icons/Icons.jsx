export const WordsIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4" ry="4" fill="currentColor" className="ico-bg" />
        <path d="M7 15L9 9L12 15L15 9L17 15" fill="currentColor"  />
    </svg>
);

export const PhrasesIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        
        <rect x="4" y="4" width="18" height="18" rx="4" ry="4" fill="currentColor" className="ico-bg" strokeDasharray="0" />
        <path d="M9 9h6M9 13h4M9 17h2" stroke="currentColor" />
        <circle cx="17" cy="17" r="3" fill="currentColor" className="ico-fg" />
    </svg>
);

export const SentencesIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="18" height="16" rx="3" ry="3" fill="currentColor" className="ico-bg" />
        <path d="M7 9h10M7 13h8m-8 4h4" />
    </svg>
);

export const PatternsIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4" ry="4" fill="currentColor" className="ico-bg" />
        <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" />
    </svg>
);

export const TopicsIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* 外框：与 PatternsIcon 完全一致的大小 & 圆角 */}
        {/* <rect x="3" y="3" width="18" height="18" rx="4" ry="4" fill="currentColor" className="ico-bg" /> */}
        {/* 小一号的山川/层级路径 */}
        <path d="M12 7L6 10l6 3 6-3-6-3zM6 14l6 3 6-3M6 17l6 3 6-3" stroke="currentColor"  />
    </svg>
);

export const RefreshIcon = ({ className, spinning = false, color = '#667eea' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={spinning ? { animation: 'spin 1s linear infinite' } : {}}
  >
    {/* 去掉了中间的圆圈路径 */}
    <path
      d="M12 2v4m0 12v4M4.22 4.22l2.83 2.83m8.9 8.9l2.83 2.83M2 12h4m12 0h4M4.22 19.78l2.83-2.83m8.9-8.9l2.83-2.83"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </svg>
);


export const DiceIcon = ({ className, color = '#f59e0b' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="2"/>
    <circle cx="8" cy="8" r="1.5" fill={color}/>
    <circle cx="16" cy="16" r="1.5" fill={color}/>
    <circle cx="8" cy="16" r="1.5" fill={color}/>
    <circle cx="16" cy="8" r="1.5" fill={color}/>
    <circle cx="12" cy="12" r="1.5" fill={color}/>
  </svg>
);
import React, { useMemo } from 'react';
export const HintStrip = ({ stripClass }) => {
  // 每个实例生成独立渐变 ID，避免多条冲突
  const gradId = useMemo(() => `grad-${Math.random().toString(36).slice(2, 9)}`, []);

  return (
    <svg
      width="6"
      height="40"
      viewBox="0 0 6 40"
      className={stripClass}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--strip-start, #FAD15A)" />
          <stop offset="100%" stopColor="var(--strip-end, #F59E0B)" />
        </linearGradient>
      </defs>

      {/* 书签形状：上方圆角，下方斜切 */}
      <path
        d="M0 0
           L6 0
           L6 32
           L3 36
           L0 32
           Z"
        fill={`url(#${gradId})`}
      />
    </svg>
  );
};