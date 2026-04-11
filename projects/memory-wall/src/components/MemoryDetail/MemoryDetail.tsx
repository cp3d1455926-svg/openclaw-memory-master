import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { MEMORY_TYPE_COLORS } from '@/types/memory';
import './MemoryDetail.css';

interface MemoryDetailProps {
  memoryId: string;
  onClose: () => void;
}

export const MemoryDetail: React.FC<MemoryDetailProps> = ({ memoryId, onClose }) => {
  const { orbs } = useMemoryStore();
  const memory = orbs.find((o) => o.id === memoryId);

  if (!memory) {
    return null;
  }

  const color = MEMORY_TYPE_COLORS[memory.type];

  return (
    <motion.div
      className="memory-detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="memory-detail-panel"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ borderTopColor: color }}
      >
        {/* 头部 */}
        <div className="detail-header">
          <div className="detail-title">
            <div
              className="type-badge"
              style={{ backgroundColor: color }}
            >
              {getOrbTypeName(memory.type)}
            </div>
            {memory.isCore && <span className="core-badge">⭐ 核心记忆</span>}
            {memory.isCompressed && <span className="compressed-badge">💤 已压缩</span>}
          </div>
          
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="detail-content">
          <div className="content-section">
            <h3>记忆内容</h3>
            <p className="memory-text">
              {memory.fullContent || memory.content}
            </p>
          </div>

          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">创建时间</span>
              <span className="meta-value">{new Date(memory.timestamp).toLocaleString('zh-CN')}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">访问次数</span>
              <span className="meta-value">{memory.accessCount} 次</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">重要性</span>
              <span className="meta-value">{(memory.importance * 100).toFixed(0)}%</span>
            </div>
            {memory.compressionRatio && (
              <div className="meta-item">
                <span className="meta-label">压缩率</span>
                <span className="meta-value">{(memory.compressionRatio * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>

          {memory.tags && memory.tags.length > 0 && (
            <div className="tags-section">
              <h3>标签</h3>
              <div className="tags-list">
                {memory.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="detail-actions">
          <button className="action-btn secondary">
            编辑
          </button>
          <button className="action-btn secondary">
            导出
          </button>
          {!memory.isCore && (
            <button className="action-btn primary">
              设为核心记忆
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MemoryDetail;
