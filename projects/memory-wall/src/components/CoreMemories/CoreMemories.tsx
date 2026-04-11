import React from 'react';
import type { MemoryOrb } from '@/types/memory';
import MemoryOrbComponent from '@/components/MemoryOrb/MemoryOrb';
import './CoreMemories.css';

interface CoreMemoriesProps {
  memories: MemoryOrb[];
  onSelect: (id: string) => void;
}

export const CoreMemories: React.FC<CoreMemoriesProps> = ({ memories, onSelect }) => {
  return (
    <div className="core-memories">
      <div className="core-title">
        <span className="core-icon">🔮</span>
        <h2>核心记忆</h2>
      </div>
      
      <div className="core-grid">
        {memories.map((orb) => (
          <MemoryOrbComponent
            key={orb.id}
            orb={orb}
            onClick={onSelect}
            size="core"
          />
        ))}
      </div>
    </div>
  );
};

export default CoreMemories;
