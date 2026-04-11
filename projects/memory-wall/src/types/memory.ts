// 记忆类型
export type MemoryType = 'episodic' | 'semantic' | 'procedural' | 'persona';

// 情感类型
export type EmotionType = 'joy' | 'sadness' | 'fear' | 'anger' | 'disgust';

// 时间范围
export type TimeRange = 'today' | 'week' | 'month' | 'all';

// 情绪模式
export type MoodMode = 'normal' | 'joy' | 'sadness' | 'anxiety';

// 记忆球
export interface MemoryOrb {
  // 基础信息
  id: string;
  content: string;           // 记忆内容 (摘要)
  fullContent?: string;      // 完整内容 (可选)
  
  // 分类
  type: MemoryType;          // episodic | semantic | procedural | persona
  subtype?: string;          // 子分类
  
  // 时间
  timestamp: number;         // 创建时间戳
  lastAccessed?: number;     // 最后访问时间
  
  // 重要性
  importance: number;        // 0-1, 控制大小/亮度
  isCore: boolean;           // 是否核心记忆
  
  // 状态
  isCompressed: boolean;     // 是否压缩
  compressionRatio?: number; // 压缩率 (0-1)
  accessCount: number;       // 访问次数
  
  // 情感
  emotion?: EmotionType;     // joy | sadness | fear | anger | disgust
  emotionIntensity?: number; // 0-1
  
  // 关联
  relatedIds: string[];      // 关联记忆 ID
  tags?: string[];           // 标签
  
  // 元数据
  source: string;            // 来源 (对话/文件/任务)
  metadata?: Record<string, any>;
}

// 记忆架
export interface MemoryShelf {
  id: string;
  label: string;             // "今天", "本周", "本月", "更早"
  timeRange: {
    start: number;
    end: number;
  };
  memories: MemoryOrb[];
  isExpanded: boolean;       // 是否展开
}

// 墙状态
export interface WallState {
  // 数据
  orbs: MemoryOrb[];
  shelves: MemoryShelf[];
  coreMemories: MemoryOrb[];
  
  // 视图
  selectedOrbId: string | null;
  searchQuery: string;
  currentTimeRange: TimeRange;
  moodMode: MoodMode;
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // 操作
  loadMemories: (range?: TimeRange) => Promise<void>;
  selectOrb: (id: string) => void;
  search: (query: string) => void;
  setMoodMode: (mode: MoodMode) => void;
  accessOrb: (id: string) => void;
  toggleShelf: (shelfId: string) => void;
  setCoreMemory: (id: string, isCore: boolean) => Promise<void>;
}

// 统计信息
export interface WallStats {
  total: number;
  today: number;
  compressed: number;
  byType: Record<MemoryType, number>;
  byEmotion: Record<EmotionType, number>;
}

// API 响应
export interface WallResponse {
  orbs: MemoryOrb[];
  shelves: MemoryShelf[];
  coreMemories: MemoryOrb[];
}

export interface SearchResponse {
  results: MemoryOrb[];
  total: number;
}

// 记忆球尺寸配置
export interface OrbSizeConfig {
  baseSize: number;          // 基础尺寸 (px)
  coreMultiplier: number;    // 核心记忆倍率
  importanceSteps: {
    high: number;            // 高重要性阈值
    medium: number;          // 中重要性阈值
    low: number;             // 低重要性阈值
  };
}

// 默认配置
export const DEFAULT_ORB_SIZE: OrbSizeConfig = {
  baseSize: 45,
  coreMultiplier: 1.8,
  importanceSteps: {
    high: 0.7,
    medium: 0.4,
    low: 0.2,
  },
};

// 记忆类型颜色映射
export const MEMORY_TYPE_COLORS: Record<MemoryType, string> = {
  episodic: '#3B82F6',      // 蓝色 - 忧忧
  semantic: '#FBBF24',      // 金色 - 乐乐
  procedural: '#10B981',    // 绿色 - 怕怕
  persona: '#8B5CF6',       // 紫色 - 怒怒
};

// 情感颜色映射
export const EMOTION_COLORS: Record<EmotionType, string> = {
  joy: '#FBBF24',
  sadness: '#3B82F6',
  fear: '#10B981',
  anger: '#EF4444',
  disgust: '#84CC16',
};

// 情绪模式配置
export const MOOD_MODE_CONFIG: Record<MoodMode, {
  label: string;
  description: string;
  icon: string;
  filter?: (orb: MemoryOrb) => boolean;
}> = {
  normal: {
    label: '普通模式',
    description: '显示所有记忆',
    icon: '😐',
  },
  joy: {
    label: '乐乐模式',
    description: '只显示高重要性记忆',
    icon: '🟡',
    filter: (orb) => orb.importance > 0.7 && !orb.isCompressed,
  },
  sadness: {
    label: '忧忧模式',
    description: '显示所有记忆 (包括低重要性)',
    icon: '🔵',
  },
  anxiety: {
    label: '焦焦模式',
    description: '显示待办/未完成事项',
    icon: '🟠',
    filter: (orb) => orb.tags?.includes('todo') || orb.tags?.includes('pending'),
  },
};
