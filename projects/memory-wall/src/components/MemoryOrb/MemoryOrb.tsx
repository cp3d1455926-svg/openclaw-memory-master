import React from 'react';
import { motion } from 'framer-motion';
import type { MemoryOrb } from '@/types/memory';
import { MEMORY_TYPE_COLORS, EMOTION_COLORS, DEFAULT_ORB_SIZE } from '@/types/memory';
import './MemoryOrb.css';

interface MemoryOrbProps {
  orb: MemoryOrb;
  isSelected?: boolean;
  onClick?: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
  size?: 'small' | 'medium' | 'large' | 'core';
}

export const MemoryOrb: React.FC<MemoryOrbProps> = ({
  orb,
  isSelected = false,
  onClick,
  onContextMenu,
  size = 'medium',
}) => {
  // 计算颜色
  const getColor = () => {
    if (orb.emotion && orb.emotionIntensity && orb.emotionIntensity > 0.5) {
      return EMOTION_COLORS[orb.emotion];
    }
    return MEMORY_TYPE_COLORS[orb.type];
  };

  // 计算尺寸
  const getSize = () => {
    if (size === 'core') return DEFAULT_ORB_SIZE.baseSize * DEFAULT_ORB_SIZE.coreMultiplier;
    if (size === 'large') return DEFAULT_ORB_SIZE.baseSize * 1.3;
    if (size === 'small') return DEFAULT_ORB_SIZE.baseSize * 0.6;
    
    // 根据重要性计算尺寸
    const baseSize = DEFAULT_ORB_SIZE.baseSize;
    if (orb.importance >= DEFAULT_ORB_SIZE.importanceSteps.high) {
      return baseSize * 1.3;
    } else if (orb.importance >= DEFAULT_ORB_SIZE.importanceSteps.medium) {
      return baseSize;
    } else if (orb.importance >= DEFAULT_ORB_SIZE.importanceSteps.low) {
      return baseSize * 0.7;
    }
    return baseSize * 0.5;
  };

  const orbSize = getSize();
  const color = getColor();

  // 计算亮度
  const getOpacity = () => {
    if (orb.isCompressed) return 0.3;
    if (orb.importance < DEFAULT_ORB_SIZE.importanceSteps.low) return 0.5;
    return 0.7 + orb.importance * 0.3;
  };

  // 是否显示脉动动画
  const shouldPulse = orb.isCore || orb.importance > 0.8 || orb.accessCount > 10;

  const handleClick = () => {
    if (onClick) onClick(orb.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onContextMenu) onContextMenu(e, orb.id);
  };

  return (
    <motion.div
      className={`memory-orb ${isSelected ? 'selected' : ''} ${orb.isCompressed ? 'compressed' : ''}`}
      style={{
        width: orbSize,
        height: orbSize,
        backgroundColor: color,
        opacity: getOpacity(),
        boxShadow: orb.isCore || orb.importance > 0.8 
          ? `0 0 ${orbSize * 0.5}px ${color}` 
          : 'none',
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      whileHover={{ scale: 1.15, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      animate={shouldPulse ? {
        scale: [1, 1.1, 1],
        opacity: [getOpacity(), getOpacity() * 0.9, getOpacity()],
      } : {
        opacity: getOpacity(),
        scale: 1,
      }}
      transition={{
        duration: shouldPulse ? 2 : 0.2,
        repeat: shouldPulse ? Infinity : 0,
        ease: 'easeInOut',
      }}
      initial={{ opacity: 0, scale: 0 }}
    >
      {/* 核心记忆标识 */}
      {orb.isCore && (
        <div className="core-indicator">⭐</div>
      )}

      {/* 压缩标识 */}
      {orb.isCompressed && (
        <div className="compressed-indicator">💤</div>
      )}

      {/* 悬停预览 */}
      <div className="orb-preview">
        <div className="orb-preview-content">
          <div className="orb-type">{getOrbTypeName(orb.type)}</div>
          <div className="orb-content">{orb.content.slice(0, 100)}...</div>
          <div className="orb-meta">
            <span>{formatTime(orb.timestamp)}</span>
            <span>访问 {orb.accessCount} 次</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 辅助函数
function getOrbTypeName(type: string): string {
  const names: Record<string, string> = {
    episodic: '情景记忆',
    semantic: '语义记忆',
    procedural: '程序记忆',
    persona: '人设记忆',
  };
  return names[type] || type;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  if (diff < hour) {
    return '刚刚';
  } else if (diff < 2 * hour) {
    return '1 小时前';
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < 2 * day) {
    return '昨天';
  } else {
    return `${Math.floor(diff / day)}天前`;
  }
}

export default MemoryOrb;
