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

// 折叠：精致的合上书本 + 飘带书签
export const ChevronDownIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* 柔和阴影 */}
      <filter id="bookShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
        <feOffset dx="0" dy="1" result="offsetblur"/>
        <feFlood floodColor={color} floodOpacity="0.15"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* 书本左侧厚度（书脊） */}
    <path
      d="M5 7 Q4.8 6.5 5.2 6.2 L8 4.8 Q8.3 4.6 8.6 4.8 L8.6 17.2 Q8.6 17.5 8.3 17.7 L5.2 19 Q4.8 19.2 4.8 18.7 L5 7 Z"
      fill={color}
      fillOpacity="0.15"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#bookShadow)"
    />

    {/* 书本主体（封面） */}
    <path
      d="M8.3 4.8 L17 7 Q17.5 7.2 17.5 7.7 L17.5 18.3 Q17.5 18.8 17 19 L8.3 17 Q8 16.9 8 16.5 L8 5.2 Q8 4.8 8.3 4.8 Z"
      fill={color}
      fillOpacity="0.08"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* 书脊细节线 */}
    <path
      d="M8.3 5.5 L8.3 16.8"
      stroke={color}
      strokeWidth="0.8"
      strokeOpacity="0.3"
      strokeLinecap="round"
    />

    {/* 封面装饰线 */}
    <path
      d="M10.5 9 L15 10 M10.5 11.5 L14 12.2"
      stroke={color}
      strokeWidth="0.8"
      strokeOpacity="0.25"
      strokeLinecap="round"
    />

    {/* 飘带书签 - 更优雅的形状 */}
    <path
      d="M13 6.8 L14.8 7.2 Q15.1 7.3 15.1 7.6 L15.1 12.5 Q15.1 12.9 14.7 13.1 L13.8 13.8 Q13.3 14.1 12.8 13.7 L12.2 13.2 Q12 12.9 12 12.5 L12.8 7.2 Q12.9 6.8 13 6.8 Z"
      fill={color}
      fillOpacity="0.3"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* 书签上的小圆点装饰 */}
    <circle
      cx="13.8"
      cy="9.5"
      r="0.6"
      fill={color}
      fillOpacity="0.4"
    />
  </svg>
);

// 展开：优雅的打开书本 + 立体感
export const ChevronUpIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* 书页阴影 */}
      <filter id="pageShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="0.8"/>
        <feOffset dx="0" dy="0.5" result="offsetblur"/>
        <feFlood floodColor={color} floodOpacity="0.12"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* 左侧书页 - 优雅弧度 */}
    <path
      d="M4 8.5 Q4 6.8 5.8 6.5 L10.5 6.5 Q11 6.5 11 7 L11 16.5 Q11 17.2 10.5 17.2 L5.8 17.2 Q4 17 4 15.2 L4 8.5 Z"
      fill={color}
      fillOpacity="0.08"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#pageShadow)"
    />

    {/* 右侧书页 - 优雅弧度 */}
    <path
      d="M13 6.5 L18.2 6.5 Q20 6.8 20 8.5 L20 15.2 Q20 17 18.2 17.2 L13 17.2 Q12.5 17.2 12.5 16.5 L12.5 7 Q12.5 6.5 13 6.5 Z"
      fill={color}
      fillOpacity="0.08"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#pageShadow)"
    />

    {/* 书脊中线 - 虚化效果 */}
    <path
      d="M11.75 6.8 L11.75 17"
      stroke={color}
      strokeWidth="1.2"
      strokeOpacity="0.25"
      strokeLinecap="round"
    />

    {/* 左页文字装饰 */}
    <g opacity="0.35">
      <path d="M6 9.5 L9 9.5" stroke={color} strokeWidth="0.9" strokeLinecap="round"/>
      <path d="M6 11.5 L8.5 11.5" stroke={color} strokeWidth="0.9" strokeLinecap="round"/>
      <path d="M6 13.5 L9 13.5" stroke={color} strokeWidth="0.9" strokeLinecap="round"/>
    </g>

    {/* 右页文字装饰 */}
    <g opacity="0.35">
      <path d="M15 9.5 L18 9.5" stroke={color} strokeWidth="0.9" strokeLinecap="round"/>
      <path d="M15.5 11.5 L18 11.5" stroke={color} strokeWidth="0.9" strokeLinecap="round"/>
      <path d="M15 13.5 L18 13.5" stroke={color} strokeWidth="0.9" strokeLinecap="round"/>
    </g>

    {/* 左侧书页厚度 */}
    <path
      d="M5.8 17.2 L10.5 17.8 Q11 18 11 17.5"
      fill="none"
      stroke={color}
      strokeWidth="0.8"
      strokeOpacity="0.2"
      strokeLinecap="round"
    />

    {/* 右侧书页厚度 */}
    <path
      d="M13 17.8 L18.2 17.2 Q19.5 17 19.8 15.8"
      fill="none"
      stroke={color}
      strokeWidth="0.8"
      strokeOpacity="0.2"
      strokeLinecap="round"
    />

    {/* 书页高光 */}
    <path
      d="M5.5 7.5 Q5 7.8 5 8.5 L5 14.5"
      stroke={color}
      strokeWidth="0.6"
      strokeOpacity="0.15"
      strokeLinecap="round"
    />
    <path
      d="M18.5 7.5 Q19 7.8 19 8.5 L19 14.5"
      stroke={color}
      strokeWidth="0.6"
      strokeOpacity="0.15"
      strokeLinecap="round"
    />
  </svg>
);

// 折叠状态图标 - 加号样式
export const PlusIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10 5V15M5 10H15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 展开状态图标 - 减号样式
export const MinusIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M5 10H15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);