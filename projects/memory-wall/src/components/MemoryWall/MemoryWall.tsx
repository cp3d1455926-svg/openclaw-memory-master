import React, { useEffect } from 'react';
import { useMemoryStore, useFilteredMemories } from '@/hooks/useMemoryStore';
import MemoryShelf from '@/components/MemoryShelf/MemoryShelf';
import CoreMemories from '@/components/CoreMemories/CoreMemories';
import SearchBar from '@/components/SearchBar/SearchBar';
import MoodMode from '@/components/MoodMode/MoodMode';
import MemoryDetail from '@/components/MemoryDetail/MemoryDetail';
import './MemoryWall.css';

export const MemoryWall: React.FC = () => {
  const {
    shelves,
    coreMemories,
    selectedOrbId,
    isLoading,
    error,
    loadMemories,
    selectOrb,
  } = useMemoryStore();

  const filteredMemories = useFilteredMemories();

  // 初始加载
  useEffect(() => {
    loadMemories('all');
  }, []);

  // 加载状态
  if (isLoading) {
    return (
      <div className="memory-wall loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>加载记忆墙...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="memory-wall error">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={() => loadMemories()}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className="memory-wall">
      {/* 顶部控制栏 */}
      <div className="wall-header">
        <div className="wall-title">
          <h1>🧠 Memory Wall</h1>
          <p className="wall-subtitle">头脑特工队风格记忆墙</p>
        </div>
        
        <div className="wall-controls">
          <SearchBar />
          <MoodMode />
        </div>
      </div>

      {/* 核心记忆区 */}
      {coreMemories.length > 0 && (
        <CoreMemories memories={coreMemories} onSelect={selectOrb} />
      )}

      {/* 记忆架 */}
      <div className="wall-shelves">
        {shelves.map((shelf) => (
          <MemoryShelf
            key={shelf.id}
            shelf={shelf}
            memories={filteredMemories.filter((m) =>
              shelf.memories.some((sm) => sm.id === m.id)
            )}
            onSelect={selectOrb}
          />
        ))}
      </div>

      {/* 空状态 */}
      {filteredMemories.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔮</div>
          <h2>没有找到记忆</h2>
          <p>尝试调整搜索词或切换情绪模式</p>
        </div>
      )}

      {/* 记忆详情面板 */}
      {selectedOrbId && (
        <MemoryDetail
          memoryId={selectedOrbId}
          onClose={() => selectOrb(null)}
        />
      )}

      {/* 背景装饰 */}
      <div className="wall-background">
        <div className="gradient-orb top-right"></div>
        <div className="gradient-orb bottom-left"></div>
      </div>
    </div>
  );
};

export default MemoryWall;
