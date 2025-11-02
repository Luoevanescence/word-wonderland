import React, { useMemo, useState, useEffect } from 'react';
import './MultiSelect.css';

/**
 * MultiSelect - checkbox-based multi selection with search
 * props:
 * - options: Array<{ value: string, label: string }>
 * - value: string[]
 * - onChange: (next: string[]) => void
 * - placeholder?: string
 * - disabled?: boolean
 */
export default function MultiSelect({ options, value, onChange, placeholder = '搜索…', disabled = false }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => { if (disabled) setQuery(''); }, [disabled]);

  const filtered = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return options;
    return options.filter(o => (o.label || '').toLowerCase().includes(s));
  }, [options, query]);

  const allValues = useMemo(() => options.map(o => o.value), [options]);
  const allSelected = value.length > 0 && allValues.every(v => value.includes(v));

  const toggle = (v) => {
    if (value.includes(v)) onChange(value.filter(x => x !== v));
    else onChange([...value, v]);
  };

  const selectAll = () => onChange(Array.from(new Set([...value, ...allValues])));
  const clearAll = () => onChange([]);

  // close dropdown when clicking outside
  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest('.multi-select')) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="multi-select" aria-disabled={disabled} onClick={() => !disabled && setOpen(true)}>
      <div className="multi-select__control">
        {value.map(v => {
          const opt = options.find(o => o.value === v);
          if (!opt) return null;
          return (
            <span key={v} className="multi-select__chip">
              {opt.label}
              <button type="button" className="multi-select__chip-remove" onClick={(e)=>{e.stopPropagation(); toggle(v);}}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </span>
          );
        })}
        <input
          className="multi-select__input"
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
      {open && (
        <div className="multi-select__menu">
          <div className="multi-select__header">
            <input
              className="multi-select__search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
            />
            <div className="multi-select__actions">
              <button type="button" className="multi-select__btn" onClick={(e)=>{e.stopPropagation();selectAll();}} disabled={disabled || allSelected}>全选</button>
              <button type="button" className="multi-select__btn" onClick={(e)=>{e.stopPropagation();clearAll();}} disabled={disabled || value.length === 0}>清空</button>
            </div>
          </div>
          <div className="multi-select__list">
            {filtered.length === 0 ? (
              <div className="multi-select__empty">没有匹配项</div>
            ) : (
              filtered.map((o) => (
                <div key={o.value} className="multi-select__item" onClick={(e)=>{e.stopPropagation(); toggle(o.value);}}>
                  <span className="multi-select__item-code">{o.code || ''}</span>
                  <span className="multi-select__item-label">{o.label}</span>
                  {value.includes(o.value) && <span className="multi-select__tick">✓</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


