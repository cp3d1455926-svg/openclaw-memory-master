import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MemoryShelf, MemoryOrb } from '@/types/memory';
import MemoryOrb from '@/components/MemoryOrb/MemoryOrb';
import './MemoryShelf.css';

interface MemoryShelfProps {
  shelf: MemoryShelf;
  memories: MemoryOrb[];
  onSelect: (id: string) => void;
}

export const MemoryShelf: React.FC<MemoryShelfProps> = ({
  shelf,
  memories,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(shelf.isExpanded);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 只显示前 20 个，避免渲染过多
  const displayMemories = isExpanded ? memories : memories.slice(0, 20);
  const hasMore = memories.length > 20;

  return (
    <div className="memory-shelf">
      {/* 架子标题 */}
      <div className="shelf-header" onClick={toggleExpand}>
        <div className="shelf-title">
          <h2>{shelf.label}</h2>
          <span className="shelf-count">{memories.length} 个记忆</span>
        </div>
        
        <div className="shelf-actions">
          <button className="expand-btn">
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* 记忆球网格 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="shelf-grid"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {displayMemories.map((orb, index) => (
              <motion.div
                key={orb.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.3,
                }}
              >
                <MemoryOrb
                  orb={orb}
                  onClick={onSelect}
                  size={orb.isCore ? 'core' : 'medium'}
                />
              </motion.div>
            ))}

            {/* 加载更多提示 */}
            {hasMore && (
              <motion.div
                className="load-more"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p>还有 {memories.length - 20} 个记忆...</p>
                <button onClick={() => setIsExpanded(true)}>
                  展开全部
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 收起状态预览 */}
      {!isExpanded && memories.length > 0 && (
        <div className="shelf-preview">
          {memories.slice(0, 5).map((orb) => (
            <MemoryOrb
              key={orb.id}
              orb={orb}
              onClick={onSelect}
              size="small"
            />
          ))}
          {memories.length > 5 && (
            <div className="preview-more">+{memories.length - 5}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemoryShelf;
