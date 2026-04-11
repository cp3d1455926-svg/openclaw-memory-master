import { create } from 'zustand';
import type { WallState, MemoryOrb, TimeRange, MoodMode } from '@/types/memory';
import { mockMemoryAPI } from '@/mock/mockData';

// 初始状态
const initialState = {
  orbs: [],
  shelves: [],
  coreMemories: [],
  selectedOrbId: null,
  searchQuery: '',
  currentTimeRange: 'all' as TimeRange,
  moodMode: 'normal' as MoodMode,
  isLoading: false,
  error: null,
};

// 创建 Store
export const useMemoryStore = create<WallState>((set, get) => ({
  ...initialState,

  // 加载记忆 (使用 Mock API)
  loadMemories: async (range = 'all') => {
    set({ isLoading: true, error: null, currentTimeRange: range });
    
    try {
      const data = await mockMemoryAPI.getWallMemories();
      
      // 按时间分组到记忆架
      const shelves = groupMemoriesByShelf(data.orbs);
      
      set({
        orbs: data.orbs,
        shelves,
        coreMemories: data.coreMemories,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载失败',
        isLoading: false,
      });
    }
  },

  // 选择记忆球
  selectOrb: (id: string) => {
    set({ selectedOrbId: id });
    
    // 记录访问
    if (id) {
      get().accessOrb(id);
    }
  },

  // 搜索
  search: (query: string) => {
    set({ searchQuery: query });
  },

  // 设置情绪模式
  setMoodMode: (mode: MoodMode) => {
    set({ moodMode: mode });
  },

  // 记录访问
  accessOrb: async (id: string) => {
    try {
      await mockMemoryAPI.recordAccess(id);
      
      // 更新本地状态
      set((state) => ({
        orbs: state.orbs.map((orb) =>
          orb.id === id
            ? { ...orb, accessCount: orb.accessCount + 1, lastAccessed: Date.now() }
            : orb
        ),
      }));
    } catch (error) {
      console.error('记录访问失败:', error);
    }
  },

  // 切换记忆架展开状态
  toggleShelf: (shelfId: string) => {
    set((state) => ({
      shelves: state.shelves.map((shelf) =>
        shelf.id === shelfId
          ? { ...shelf, isExpanded: !shelf.isExpanded }
          : shelf
      ),
    }));
  },

  // 设置核心记忆
  setCoreMemory: async (id: string, isCore: boolean) => {
    try {
      await mockMemoryAPI.setCoreMemory(id, isCore);
      
      // 更新本地状态
      set((state) => {
        const updatedOrbs = state.orbs.map((orb) =>
          orb.id === id ? { ...orb, isCore } : orb
        );
        
        const updatedCore = isCore
          ? [...state.coreMemories, ...updatedOrbs.filter((o) => o.id === id)]
          : state.coreMemories.filter((o) => o.id !== id);
        
        return {
          orbs: updatedOrbs,
          coreMemories: updatedCore,
        };
      });
    } catch (error) {
      console.error('设置核心记忆失败:', error);
      throw error;
    }
  },
}));

// 按时间分组到记忆架
function groupMemoriesByShelf(orbs: MemoryOrb[]): MemoryShelf[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  const shelves: MemoryShelf[] = [
    {
      id: 'today',
      label: '今天',
      timeRange: { start: now - dayMs, end: now },
      isExpanded: true,
      memories: [],
    },
    {
      id: 'week',
      label: '本周',
      timeRange: { start: now - 7 * dayMs, end: now - dayMs },
      isExpanded: true,
      memories: [],
    },
    {
      id: 'month',
      label: '本月',
      timeRange: { start: now - 30 * dayMs, end: now - 7 * dayMs },
      isExpanded: false,
      memories: [],
    },
    {
      id: 'earlier',
      label: '更早',
      timeRange: { start: 0, end: now - 30 * dayMs },
      isExpanded: false,
      memories: [],
    },
  ];
  
  // 分配记忆到对应的架子
  orbs.forEach((orb) => {
    const shelf = shelves.find(
      (s) => orb.timestamp >= s.timeRange.start && orb.timestamp < s.timeRange.end
    );
    if (shelf) {
      shelf.memories.push(orb);
    }
  });
  
  // 按时间排序 (最新的在前)
  shelves.forEach((shelf) => {
    shelf.memories.sort((a, b) => b.timestamp - a.timestamp);
  });
  
  return shelves;
}

// 辅助钩子：获取过滤后的记忆
export function useFilteredMemories() {
  const { orbs, moodMode, searchQuery } = useMemoryStore();
  
  return orbs.filter((orb) => {
    // 情绪模式过滤
    const moodConfig = MOOD_MODE_CONFIG[moodMode];
    if (moodConfig.filter && !moodConfig.filter(orb)) {
      return false;
    }
    
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        orb.content.toLowerCase().includes(query) ||
        orb.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
}
