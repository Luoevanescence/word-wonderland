import React from 'react';

// Excel 表格图标
export const ExcelIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 表格外框 */}
    <rect
      x="2"
      y="3"
      width="16"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
      fill={color}
      fillOpacity="0.08"
    />
    
    {/* 垂直分割线 */}
    <path
      d="M7 3V17M13 3V17"
      stroke={color}
      strokeWidth="1.2"
      strokeOpacity="0.6"
    />
    
    {/* 水平分割线 */}
    <path
      d="M2 7H18M2 11H18M2 14H18"
      stroke={color}
      strokeWidth="1.2"
      strokeOpacity="0.6"
    />
    
    {/* 表头强调 */}
    <rect
      x="2"
      y="3"
      width="16"
      height="4"
      fill={color}
      fillOpacity="0.15"
      rx="2"
    />
  </svg>
);

// JSON 图标（代码括号）
export const JSONIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 左花括号 */}
    <path
      d="M7 4 C5.5 4 5 5 5 6 L5 8 C5 9 4 9.5 3 9.5 C4 9.5 5 10 5 11 L5 13 C5 14 5.5 15 7 15"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    
    {/* 右花括号 */}
    <path
      d="M13 4 C14.5 4 15 5 15 6 L15 8 C15 9 16 9.5 17 9.5 C16 9.5 15 10 15 11 L15 13 C15 14 14.5 15 13 15"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    
    {/* 中间的点缀 */}
    <circle cx="10" cy="7" r="0.8" fill={color} />
    <circle cx="10" cy="10" r="0.8" fill={color} />
    <circle cx="10" cy="13" r="0.8" fill={color} />
  </svg>
);

// 模板/文档图标
export const TemplateIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 文档外框 */}
    <path
      d="M5 2 L12 2 L15 5 L15 18 L5 18 Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.08"
    />
    
    {/* 折角 */}
    <path
      d="M12 2 L12 5 L15 5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.15"
    />
    
    {/* 文档内容线条 */}
    <path
      d="M7 8 L13 8"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeOpacity="0.7"
    />
    <path
      d="M7 11 L13 11"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeOpacity="0.7"
    />
    <path
      d="M7 14 L11 14"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeOpacity="0.7"
    />
  </svg>
);

// 导入图标（向下箭头进入盒子）- 美化版
export const ImportIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* 柔和阴影 */}
      <filter id="importShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="0.8"/>
        <feOffset dx="0" dy="1" result="offsetblur"/>
        <feFlood floodColor={color} floodOpacity="0.15"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      {/* 渐变色 */}
      <linearGradient id="importGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
        <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
      </linearGradient>
    </defs>
    
    {/* 盒子底部 - 带圆角和渐变 */}
    <path
      d="M3.5 9 L3.5 15.5 C3.5 16.5 4 17 5 17 L15 17 C16 17 16.5 16.5 16.5 15.5 L16.5 9"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="url(#importGradient)"
      filter="url(#importShadow)"
    />
    
    {/* 箭头杆 - 优雅曲线 */}
    <path
      d="M10 2.5 L10 11.5"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    
    {/* 箭头头部 - 流畅弧线 */}
    <path
      d="M6.5 9 Q10 12.5 13.5 9"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* 装饰性小点 */}
    <circle cx="10" cy="13" r="1" fill={color} opacity="0.3"/>
  </svg>
);

// 导出图标（向上箭头从盒子出来）- 美化版
export const ExportIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* 柔和阴影 */}
      <filter id="exportShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="0.8"/>
        <feOffset dx="0" dy="1" result="offsetblur"/>
        <feFlood floodColor={color} floodOpacity="0.15"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      {/* 渐变色 */}
      <linearGradient id="exportGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
        <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
      </linearGradient>
    </defs>
    
    {/* 盒子底部 - 带圆角和渐变 */}
    <path
      d="M3.5 9 L3.5 15.5 C3.5 16.5 4 17 5 17 L15 17 C16 17 16.5 16.5 16.5 15.5 L16.5 9"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="url(#exportGradient)"
      filter="url(#exportShadow)"
    />
    
    {/* 箭头杆 - 优雅曲线 */}
    <path
      d="M10 12.5 L10 3.5"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    
    {/* 箭头头部 - 流畅弧线 */}
    <path
      d="M6.5 6 Q10 2.5 13.5 6"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* 装饰性光点 */}
    <circle cx="10" cy="5" r="0.8" fill={color} opacity="0.4"/>
  </svg>
);

// 下载图标
export const DownloadIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 底部托盘 */}
    <path
      d="M3 14 L3 16 C3 17 3.5 17.5 4.5 17.5 L15.5 17.5 C16.5 17.5 17 17 17 16 L17 14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* 箭头杆 */}
    <path
      d="M10 2.5 L10 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    
    {/* 箭头头部 */}
    <path
      d="M6 10 L10 14 L14 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 复选框图标（用于选中项）
export const CheckboxIcon = ({ className, color = 'currentColor', checked = false }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="3"
      y="3"
      width="14"
      height="14"
      rx="3"
      stroke={color}
      strokeWidth="1.5"
      fill={checked ? color : 'none'}
      fillOpacity={checked ? 0.15 : 0}
    />
    {checked && (
      <path
        d="M6 10 L9 13 L14 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

// 说明/剪贴板图标
export const InstructionIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 剪贴板背板 */}
    <rect
      x="4"
      y="3"
      width="12"
      height="15"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
      fill={color}
      fillOpacity="0.08"
    />
    
    {/* 顶部夹子 */}
    <path
      d="M7 2 L7 4 L13 4 L13 2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill={color}
      fillOpacity="0.15"
    />
    
    {/* 内容线条 */}
    <path
      d="M7 8 L13 8M7 11 L13 11M7 14 L10 14"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeOpacity="0.7"
    />
  </svg>
);

// 灯泡/提示图标
export const TipIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 灯泡主体 */}
    <path
      d="M10 3 C7.5 3 5.5 5 5.5 7.5 C5.5 9 6 10 7 11 L7 13 L13 13 L13 11 C14 10 14.5 9 14.5 7.5 C14.5 5 12.5 3 10 3 Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.12"
    />
    
    {/* 灯泡底座 */}
    <rect
      x="8"
      y="13"
      width="4"
      height="3"
      rx="1"
      stroke={color}
      strokeWidth="1.3"
      fill={color}
      fillOpacity="0.15"
    />
    
    {/* 高光 */}
    <path
      d="M8 6 L8.5 8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity="0.4"
    />
  </svg>
);

// 文件夹图标
export const FolderIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 文件夹标签 */}
    <path
      d="M3 6 L3 4 C3 3.5 3.3 3 4 3 L8 3 L9.5 5 L16 5 C16.7 5 17 5.3 17 6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.15"
    />
    
    {/* 文件夹主体 */}
    <rect
      x="2"
      y="6"
      width="16"
      height="10"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
      fill={color}
      fillOpacity="0.08"
    />
  </svg>
);

// 对勾/成功图标
export const CheckIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 圆形背景 */}
    <circle
      cx="10"
      cy="10"
      r="8"
      stroke={color}
      strokeWidth="1.5"
      fill={color}
      fillOpacity="0.12"
    />
    
    {/* 对勾 */}
    <path
      d="M6 10 L8.5 12.5 L14 7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 警告/感叹号图标
export const WarningIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 三角形外框 */}
    <path
      d="M10 2 L18 16 L2 16 Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.12"
    />
    
    {/* 感叹号 - 竖线 */}
    <path
      d="M10 7 L10 11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    
    {/* 感叹号 - 点 */}
    <circle
      cx="10"
      cy="13.5"
      r="0.8"
      fill={color}
    />
  </svg>
);

// 搜索图标 - 美化版
export const SearchIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* 玻璃质感渐变 */}
      <radialGradient id="glassGradient" cx="50%" cy="30%">
        <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
        <stop offset="70%" stopColor={color} stopOpacity="0.05"/>
        <stop offset="100%" stopColor={color} stopOpacity="0"/>
      </radialGradient>
      
      {/* 微妙阴影 */}
      <filter id="searchShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="0.6"/>
        <feOffset dx="0" dy="0.5" result="offsetblur"/>
        <feFlood floodColor={color} floodOpacity="0.2"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* 放大镜圆圈外环 */}
    <circle
      cx="8.5"
      cy="8.5"
      r="5.5"
      stroke={color}
      strokeWidth="2"
      fill="url(#glassGradient)"
      filter="url(#searchShadow)"
    />
    
    {/* 放大镜圆圈内环（高光） */}
    <circle
      cx="8.5"
      cy="8.5"
      r="4"
      stroke={color}
      strokeWidth="0.8"
      strokeOpacity="0.3"
      fill="none"
    />
    
    {/* 高光点 */}
    <circle
      cx="6.5"
      cy="6.5"
      r="1.5"
      fill={color}
      opacity="0.2"
    />
    
    {/* 放大镜手柄 - 渐变粗细 */}
    <path
      d="M12.5 12.5 L16.5 16.5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    
    {/* 手柄装饰线 */}
    <path
      d="M13 13 L16 16"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.3"
    />
  </svg>
);

// 下拉箭头图标 - 实心圆角版
export const ChevronDownSmallIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 1024 1024"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M836.899 399.237l-218.01 335.037c-47.506 73.007-166.272 73.007-213.778 0l-218.01-335.037C139.595 326.23 198.977 234.97 293.99 234.97h436.02c95.013 0 154.395 91.26 106.889 164.267z"
      fill={color}
    />
  </svg>
);

// 上拉箭头图标 - 实心圆角版
export const ChevronUpSmallIcon = ({ className, color = 'currentColor' }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 1024 1024"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M836.899 399.237l-218.01 335.037c-47.506 73.007-166.272 73.007-213.778 0l-218.01-335.037C139.595 326.23 198.977 234.97 293.99 234.97h436.02c95.013 0 154.395 91.26 106.889 164.267z"
      fill={color}
      transform="rotate(180 512 512)"
    />
  </svg>
);

