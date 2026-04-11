import React from 'react';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import type { MoodMode } from '@/types/memory';
import { MOOD_MODE_CONFIG } from '@/types/memory';
import './MoodMode.css';

export const MoodMode: React.FC = () => {
  const { moodMode, setMoodMode } = useMemoryStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentMode = MOOD_MODE_CONFIG[moodMode];

  const handleSelect = (mode: MoodMode) => {
    setMoodMode(mode);
    setIsOpen(false);
  };

  return (
    <div className="mood-mode">
      <button
        className="mood-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={currentMode.description}
      >
        <span className="mood-icon">{currentMode.icon}</span>
        <span className="mood-label">{currentMode.label}</span>
      </button>

      {isOpen && (
        <div className="mood-dropdown">
          {(Object.keys(MOOD_MODE_CONFIG) as MoodMode[]).map((mode) => {
            const config = MOOD_MODE_CONFIG[mode];
            const isActive = mode === moodMode;

            return (
              <button
                key={mode}
                className={`mood-option ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(mode)}
              >
                <span className="option-icon">{config.icon}</span>
                <div className="option-info">
                  <span className="option-label">{config.label}</span>
                  <span className="option-desc">{config.description}</span>
                </div>
                {isActive && <span className="active-indicator">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MoodMode;
