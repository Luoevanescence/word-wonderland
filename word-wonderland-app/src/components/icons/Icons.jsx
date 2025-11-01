export const WordsIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4" ry="4" fill="currentColor" className="ico-bg" />
    <path d="M7 15L9 9L12 15L15 9L17 15" fill="currentColor" />
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
    <path d="M12 7L6 10l6 3 6-3-6-3zM6 14l6 3 6-3M6 17l6 3 6-3" stroke="currentColor" />
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
    <rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="2" />
    <circle cx="8" cy="8" r="1.5" fill={color} />
    <circle cx="16" cy="16" r="1.5" fill={color} />
    <circle cx="8" cy="16" r="1.5" fill={color} />
    <circle cx="16" cy="8" r="1.5" fill={color} />
    <circle cx="12" cy="12" r="1.5" fill={color} />
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




// 合上书本 + 三角书签（莫兰迪灰调立体风）

export const ChevronDownIcon = ({
  className,
  bookColor = 'currentColor',   // 主体/书脊/压痕等
  bookmarkColor = 'currentColor'  // 三角书签
}) => (
  <svg
    className={className}
    width="24"
    height="30"
    viewBox="0 0 24 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 底部悬浮阴影 */}
    <rect x="3" y="22.2" width="18" height="1.2" rx="0.6" fill={bookColor} opacity="0.2" filter="blur(0.6px)" />
    {/* 书本主体 */}
    <rect x="3" y="3" width="18" height="19.2" rx="1.8" fill={bookColor} opacity="0.15" />
    {/* 书页顶部压痕 */}
    <line x1="3.6" y1="3.6" x2="20.4" y2="3.6" stroke={bookColor} opacity="0.1" strokeWidth="0.3" />
    {/* 书脊 */}
    <rect x="3" y="3" width="2.4" height="19.2" fill={bookColor} opacity="0.25" />
    {/* 装订线 */}
    <line x1="5.4" y1="4.2" x2="5.4" y2="21" stroke="#fff" strokeWidth="0.3" />
    {/* 装订钉 */}
    <circle cx="4.2" cy="6" r="0.3" fill={bookColor} opacity="0.55" />
    <circle cx="4.2" cy="19.2" r="0.3" fill={bookColor} opacity="0.55" />
    {/* 三角书签 */}
    <path d="M21 7.2L18 12L21 16.8Z" fill={bookmarkColor} opacity="0.7" stroke="#fff" strokeWidth="0.6" />
    {/* 书签嵌入阴影 */}
    {/* <line x1="18" y1="8.4" x2="18" y2="14.4" stroke={bookmarkColor} opacity="0.45" strokeWidth="0.3" strokeDasharray="0.3 0.3" /> */}
  </svg>
);

// 半开书本（左侧单页微开 8°）
export const ChevronUpIcon = ({
  className,
  bookColor = 'currentColor',   // 书脊、阴影、页码等
  pageColor = 'currentColor',    // 左侧翻开页
  bookmarkColor = 'currentColor' // 三角书签
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 底部基础阴影 */}
    <path d="M4.8 18.7Q14.4 19.2 19.2 18.2" stroke={bookColor} strokeWidth="0.5" opacity="0.36" filter="blur(0.3px)" />

    {/* 右侧贴合书页（底层） */}
    <rect x="3.8" y="2.4" width="10.6" height="15.4" rx="1" fill={bookColor} opacity="0.30" />

    {/* 页码标记 */}
    {/* <circle cx="13.4" cy="3.8" r="0.18" fill={bookColor} opacity="0.55" /> */}
    {/* <text x="12.5" y="4.8" fontSize="0.8" fill={bookColor} opacity="0.55">1</text> */}

    {/* 书脊 */}
    <rect x="3.8" y="2.4" width="1.9" height="15.4" fill={bookColor} opacity="0.5" />

    {/* 书脊装订线 */}
    <line x1="4.8" y1="3.4" x2="4.8" y2="16.8" stroke={bookmarkColor} strokeWidth="0.3" strokeDasharray="0.6 0.6" opacity="0.7" />

    {/* 左侧展开书页（顶层） */}
    <path d="M5.8 2.4Q14.4 3.4 16.8 3.8Q16.3 18.2 4.8 16.8Z" fill={pageColor} opacity="0.75" />

    {/* 叠压阴影 */}
    <path d="M5.8 2.4Q14.4 3.4 16.8 3.8" stroke="#fff" strokeWidth="0.3" opacity="1" fill="none" />

    {/* 卷翘边缘阴影 */}
    <path d="M16.8 3.8Q16.3 18.2 4.8 16.8" stroke="#fff" strokeWidth="0.4" opacity="1" fill="none" />

    {/* 纸张厚度线 */}
    <line x1="4.8" y1="16.8" x2="16.3" y2="18.2" stroke={bookColor} opacity="0.7" strokeWidth="0.6" />
    {/* <line
      x1="4.8"
      y1="16.8"
      x2="14.3"  // 从16.3缩短到12.3，长度减少约25%
      y2="17.6"  // 微调终点y坐标，保持自然倾斜角度
      stroke={bookColor}
      opacity="0.35"
      strokeWidth="0.6"
    /> */}
    {/* 内页纹理 */}
    <line x1="8.6" y1="4.8" x2="13.4" y2="5.8" stroke="#fff" opacity="1" strokeWidth="0.3" />
    <line x1="8.6" y1="6.7" x2="13.4" y2="7.7" stroke="#fff" opacity="1" strokeWidth="0.3" />
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

// 标签图标
export const TagIcon = ({ className, color = '#10B981' }) => {
  // 根据主色生成浅色版本（左侧深色，右侧浅色）
  // 如果是品牌绿色，使用预设的浅绿色
  // 否则简单处理（可以后续优化为更智能的颜色计算）
  const lightColor = color === '#10B981' ? '#34D399' : 
                     color === '#059669' ? '#10B981' : 
                     color; // 默认保持原色或使用传入的颜色
  
  return (
    <svg
      className={className}
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
    >
      <path
        d="M335.04 686.52l336.7 126.35c45.59 17.11 94.22-16.59 94.22-65.28V288.67c0-44-35.67-79.67-79.67-79.67H348.7c-44 0-79.67 35.67-79.67 79.67v302.57c0 42.41 26.3 80.38 66.01 95.28z"
        fill={color}
      />
      <path
        d="M699.96 686.52l-336.7 126.35c-45.59 17.11-94.22-16.59-94.22-65.28V288.67c0-44 35.67-79.67 79.67-79.67h337.61c44 0 79.67 35.67 79.67 79.67v302.57c0 42.41-26.3 80.38-66.01 95.28z"
        fill={lightColor}
      />
      <path
        d="M417.91 292m0 34.41l0 136.18q0 34.41-34.41 34.41l0.01 0q-34.41 0-34.41-34.41l0-136.18q0-34.41 34.41-34.41l-0.01 0q34.41 0 34.41 34.41Z"
        fill="#FFFFFF"
      />
    </svg>
  );
};

// 层叠图标（总学习量）
export const StackIcon = ({ className, color = 'currentColor' }) => (
  <svg 
    className={className} 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 2L2 7L12 12L22 7L12 2Z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M2 17L12 22L22 17" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M2 12L12 17L22 12" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// 时钟图标（今日学习）
export const ClockIcon = ({ className, color = 'currentColor' }) => (
  <svg 
    className={className} 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth="2"
    />
    <path 
      d="M12 6V12L16 14" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);

// 星星图标（连续天数）
export const StarIcon = ({ className, color = 'currentColor' }) => (
  <svg 
    className={className} 
    width="24" 
    height="24" 
    viewBox="0 0 1024 1024" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 左上角第一个小星星 - 放大 */}
    <g transform="translate(100, 100) scale(0.45)">
      <path 
        d="M313.991837 914.285714c-20.37551 0-40.228571-6.269388-56.946939-18.808163-30.302041-21.942857-44.930612-58.514286-38.661225-95.085714l24.032654-141.061225c3.134694-18.285714-3.134694-36.571429-16.195919-49.110204L123.297959 509.910204c-26.644898-26.122449-36.04898-64.261224-24.555102-99.787755 11.493878-35.526531 41.795918-61.126531 78.889796-66.35102l141.583674-20.375511c18.285714-2.612245 33.959184-14.106122 41.795918-30.30204l63.216326-128.522449C440.946939 130.612245 474.383673 109.714286 512 109.714286s71.053061 20.897959 87.24898 54.334694L662.987755 292.571429c8.359184 16.195918 24.032653 27.689796 41.795918 30.30204l141.583674 20.375511c37.093878 5.22449 67.395918 30.82449 78.889796 66.35102 11.493878 35.526531 2.089796 73.665306-24.555102 99.787755l-102.4 99.787755c-13.061224 12.538776-19.330612 31.346939-16.195919 49.110204l24.032654 141.061225c6.269388 37.093878-8.359184 73.142857-38.661225 95.085714-30.302041 21.942857-69.485714 24.555102-102.4 7.314286L538.122449 836.440816c-16.195918-8.359184-35.526531-8.359184-51.722449 0l-126.955102 66.87347c-14.628571 7.314286-30.302041 10.971429-45.453061 10.971428z" 
        fill={color}
      />
    </g>
    {/* 左上角第二个小星星 - 放大 */}
    <g transform="translate(60, 60) scale(0.4)">
      <path 
        d="M313.991837 914.285714c-20.37551 0-40.228571-6.269388-56.946939-18.808163-30.302041-21.942857-44.930612-58.514286-38.661225-95.085714l24.032654-141.061225c3.134694-18.285714-3.134694-36.571429-16.195919-49.110204L123.297959 509.910204c-26.644898-26.122449-36.04898-64.261224-24.555102-99.787755 11.493878-35.526531 41.795918-61.126531 78.889796-66.35102l141.583674-20.375511c18.285714-2.612245 33.959184-14.106122 41.795918-30.30204l63.216326-128.522449C440.946939 130.612245 474.383673 109.714286 512 109.714286s71.053061 20.897959 87.24898 54.334694L662.987755 292.571429c8.359184 16.195918 24.032653 27.689796 41.795918 30.30204l141.583674 20.375511c37.093878 5.22449 67.395918 30.82449 78.889796 66.35102 11.493878 35.526531 2.089796 73.665306-24.555102 99.787755l-102.4 99.787755c-13.061224 12.538776-19.330612 31.346939-16.195919 49.110204l24.032654 141.061225c6.269388 37.093878-8.359184 73.142857-38.661225 95.085714-30.302041 21.942857-69.485714 24.555102-102.4 7.314286L538.122449 836.440816c-16.195918-8.359184-35.526531-8.359184-51.722449 0l-126.955102 66.87347c-14.628571 7.314286-30.302041 10.971429-45.453061 10.971428z" 
        fill={color}
      />
    </g>
    {/* 左上角第三个小星星 - 放大 */}
    <g transform="translate(140, 60) scale(0.38)">
      <path 
        d="M313.991837 914.285714c-20.37551 0-40.228571-6.269388-56.946939-18.808163-30.302041-21.942857-44.930612-58.514286-38.661225-95.085714l24.032654-141.061225c3.134694-18.285714-3.134694-36.571429-16.195919-49.110204L123.297959 509.910204c-26.644898-26.122449-36.04898-64.261224-24.555102-99.787755 11.493878-35.526531 41.795918-61.126531 78.889796-66.35102l141.583674-20.375511c18.285714-2.612245 33.959184-14.106122 41.795918-30.30204l63.216326-128.522449C440.946939 130.612245 474.383673 109.714286 512 109.714286s71.053061 20.897959 87.24898 54.334694L662.987755 292.571429c8.359184 16.195918 24.032653 27.689796 41.795918 30.30204l141.583674 20.375511c37.093878 5.22449 67.395918 30.82449 78.889796 66.35102 11.493878 35.526531 2.089796 73.665306-24.555102 99.787755l-102.4 99.787755c-13.061224 12.538776-19.330612 31.346939-16.195919 49.110204l24.032654 141.061225c6.269388 37.093878-8.359184 73.142857-38.661225 95.085714-30.302041 21.942857-69.485714 24.555102-102.4 7.314286L538.122449 836.440816c-16.195918-8.359184-35.526531-8.359184-51.722449 0l-126.955102 66.87347c-14.628571 7.314286-30.302041 10.971429-45.453061 10.971428z" 
        fill={color}
      />
    </g>
    {/* 主星星 - 缩小并移到右下角 */}
    <g transform="translate(750, 750) scale(0.65)">
      <path 
        d="M313.991837 914.285714c-20.37551 0-40.228571-6.269388-56.946939-18.808163-30.302041-21.942857-44.930612-58.514286-38.661225-95.085714l24.032654-141.061225c3.134694-18.285714-3.134694-36.571429-16.195919-49.110204L123.297959 509.910204c-26.644898-26.122449-36.04898-64.261224-24.555102-99.787755 11.493878-35.526531 41.795918-61.126531 78.889796-66.35102l141.583674-20.375511c18.285714-2.612245 33.959184-14.106122 41.795918-30.30204l63.216326-128.522449C440.946939 130.612245 474.383673 109.714286 512 109.714286s71.053061 20.897959 87.24898 54.334694L662.987755 292.571429c8.359184 16.195918 24.032653 27.689796 41.795918 30.30204l141.583674 20.375511c37.093878 5.22449 67.395918 30.82449 78.889796 66.35102 11.493878 35.526531 2.089796 73.665306-24.555102 99.787755l-102.4 99.787755c-13.061224 12.538776-19.330612 31.346939-16.195919 49.110204l24.032654 141.061225c6.269388 37.093878-8.359184 73.142857-38.661225 95.085714-30.302041 21.942857-69.485714 24.555102-102.4 7.314286L538.122449 836.440816c-16.195918-8.359184-35.526531-8.359184-51.722449 0l-126.955102 66.87347c-14.628571 7.314286-30.302041 10.971429-45.453061 10.971428z" 
        fill={color}
      />
    </g>
  </svg>
);

// 火焰图标
export const FireIcon = ({ className, color = '#F59E0B' }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
    >
      <path 
        d="M794.624 258.048c-4.096 6.144-6.144 14.336-10.24 20.48-24.576 45.056-59.392 69.632-104.448 61.44-10.24-2.048-20.48-6.144-30.72-14.336-28.672-20.48-57.344-61.44-86.016-118.784-14.336-26.624-26.624-55.296-38.912-86.016-2.048-6.144-4.096-10.24-6.144-16.384-45.056 28.672-83.968 63.488-112.64 102.4-30.72 38.912-51.2 79.872-67.584 124.928-6.144 18.432-24.576 77.824-28.672 86.016-2.048 2.048-2.048 6.144-6.144 8.192-14.336 16.384-30.72 26.624-49.152 26.624-26.624 0-49.152-18.432-71.68-47.104-2.048-4.096-6.144-6.144-8.192-10.24-20.48 47.104-30.72 96.256-30.72 145.408-2.048 137.216 71.68 266.24 194.56 335.872 131.072 73.728 292.864 59.392 409.6-28.672 8.192-6.144 22.528-4.096 28.672 4.096 6.144 8.192 4.096 22.528-4.096 28.672-131.072 98.304-309.248 112.64-454.656 32.768-135.168-75.776-217.088-219.136-215.04-370.688 0-67.584 18.432-135.168 53.248-196.608l18.432-32.768 18.432 32.768c2.048 2.048 4.096 6.144 6.144 12.288 6.144 8.192 12.288 18.432 18.432 24.576 16.384 20.48 30.72 32.768 40.96 32.768 4.096 0 8.192-2.048 14.336-8.192 0 0 0-2.048 2.048-2.048 2.048-6.144 20.48-61.44 28.672-81.92 18.432-49.152 40.96-94.208 73.728-137.216 36.864-49.152 86.016-90.112 145.408-124.928l20.48-12.288 8.192 22.528c0 2.048 2.048 6.144 4.096 10.24 4.096 8.192 6.144 16.384 10.24 26.624 12.288 28.672 24.576 55.296 36.864 81.92 26.624 51.2 51.2 88.064 73.728 102.4 6.144 4.096 10.24 6.144 14.336 6.144 22.528 4.096 43.008-10.24 61.44-40.96 6.144-10.24 10.24-22.528 14.336-32.768 2.048-6.144 4.096-12.288 4.096-14.336l10.24-36.864 24.576 28.672c2.048 2.048 4.096 4.096 6.144 8.192 4.096 6.144 10.24 12.288 14.336 20.48 16.384 22.528 30.72 47.104 45.056 73.728 43.008 77.824 67.584 159.744 67.584 239.616 0 71.68-16.384 143.36-53.248 208.896-6.144 10.24-18.432 14.336-28.672 8.192-10.24-6.144-14.336-18.432-8.192-28.672 32.768-57.344 49.152-122.88 47.104-188.416 0-73.728-22.528-149.504-61.44-221.184-10.24-22.528-24.576-45.056-38.912-65.536z" 
        fill={color}
      />
    </svg>
  );
};

// 循环箭头 + 日历页融合图标
export const CycleCalendarIcon = ({ className, color = 'currentColor' }) => {
  return (
    <svg 
      className={className} 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 日历页 - 简化设计 */}
      <rect x="6" y="6" width="12" height="14" rx="1.5" stroke={color} strokeWidth="1.5" fill="none"/>
      {/* 日历页顶部 */}
      <rect x="6" y="6" width="12" height="3" rx="1.5" fill={color} opacity="0.12"/>
      <line x1="6" y1="9" x2="18" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      {/* 简化的日期网格 - 只保留必要的线条 */}
      <line x1="9" y1="12" x2="9" y2="18" stroke={color} strokeWidth="1" opacity="0.4"/>
      <line x1="15" y1="12" x2="15" y2="18" stroke={color} strokeWidth="1" opacity="0.4"/>
      <line x1="6" y1="14.5" x2="18" y2="14.5" stroke={color} strokeWidth="1" opacity="0.4"/>
      
      {/* 循环箭头 - 简化设计，使用更流畅的弧线 */}
      <path
        d="M18 3C16.5 2 14.5 2 12 2C9 2 6.5 4 5.5 6.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M5 2v2.5h2.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M6 21C7.5 22 9.5 22 12 22C15 22 17.5 20 18.5 17.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M19 22v-2.5h-2.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
};