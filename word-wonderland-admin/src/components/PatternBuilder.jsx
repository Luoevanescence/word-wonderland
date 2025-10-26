import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './PatternBuilder.css';

/**
 * 句型构建器组件 - 支持拖拽排序
 * @param {Array} components - 可用的成分列表
 * @param {Array} patterns - 可用的句型列表
 * @param {Array} selectedItems - 已选择的项目
 * @param {Function} onChange - 选择变化回调
 * @param {String} currentPatternId - 当前编辑的句型ID（避免循环引用）
 */
function PatternBuilder({ components, patterns, selectedItems = [], onChange, currentPatternId }) {
  const [availableComponents, setAvailableComponents] = useState([]);
  const [availablePatterns, setAvailablePatterns] = useState([]);

  useEffect(() => {
    setAvailableComponents(components || []);
    // 过滤掉当前正在编辑的句型，避免循环引用
    setAvailablePatterns((patterns || []).filter(p => p.id !== currentPatternId));
  }, [components, patterns, currentPatternId]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(selectedItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const addComponent = (component) => {
    const newItem = {
      type: 'component',
      id: component.id,
      name: component.name
    };
    onChange([...selectedItems, newItem]);
  };

  const addPattern = (pattern) => {
    const newItem = {
      type: 'pattern',
      id: pattern.id,
      name: pattern.pattern
    };
    onChange([...selectedItems, newItem]);
  };

  const removeItem = (index) => {
    const items = selectedItems.filter((_, i) => i !== index);
    onChange(items);
  };

  const generatePatternName = () => {
    return selectedItems.map(item => item.name).join(' + ');
  };

  return (
    <div className="pattern-builder">
      <div className="builder-section">
        <h4>可用成分</h4>
        <div className="available-items">
          {availableComponents.length === 0 ? (
            <p className="empty-hint">暂无可用成分</p>
          ) : (
            availableComponents.map(comp => (
              <button
                key={comp.id}
                className="item-chip component-chip"
                onClick={() => addComponent(comp)}
                type="button"
              >
                + {comp.name}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="builder-section">
        <h4>可用句型</h4>
        <div className="available-items">
          {availablePatterns.length === 0 ? (
            <p className="empty-hint">暂无可用句型</p>
          ) : (
            availablePatterns.map(pattern => (
              <button
                key={pattern.id}
                className="item-chip pattern-chip"
                onClick={() => addPattern(pattern)}
                type="button"
              >
                + {pattern.pattern}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="builder-section">
        <h4>已选择的组成部分 {selectedItems.length > 0 && `(${selectedItems.length})`}</h4>
        <div className="generated-pattern">
          <strong>生成的句型：</strong>
          <span>{generatePatternName() || '（请添加成分或句型）'}</span>
        </div>
        
        {selectedItems.length === 0 ? (
          <p className="empty-hint">请从上方添加成分或句型</p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="selected-items">
              {(provided) => (
                <div
                  className="selected-items"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {selectedItems.map((item, index) => (
                    <Draggable key={`${item.type}-${item.id}-${index}`} draggableId={`${item.type}-${item.id}-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`selected-item ${item.type}-item ${snapshot.isDragging ? 'dragging' : ''}`}
                        >
                          <span className="drag-handle">⋮⋮</span>
                          <span className="item-type-badge">{item.type === 'component' ? '成分' : '句型'}</span>
                          <span className="item-name">{item.name}</span>
                          <button
                            className="remove-btn"
                            onClick={() => removeItem(index)}
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}

export default PatternBuilder;

