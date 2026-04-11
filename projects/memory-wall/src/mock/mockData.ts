import type { MemoryOrb, MemoryShelf, WallResponse } from '@/types/memory';

// Mock 数据 - 用于演示
export const mockOrbs: MemoryOrb[] = [
  // 核心记忆
  {
    id: 'core-1',
    content: '完成 Memory-Master v4.0.0 架构设计',
    fullContent: '完成了 Memory-Master v4.0.0 的整体架构设计，包括 4 类记忆模型、时间树结构、AAAK 压缩算法等核心功能。',
    type: 'procedural',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 小时前
    importance: 0.95,
    isCore: true,
    isCompressed: false,
    accessCount: 15,
    emotion: 'joy',
    emotionIntensity: 0.8,
    relatedIds: [],
    tags: ['milestone', 'architecture'],
    source: 'conversation',
  },
  {
    id: 'core-2',
    content: 'Jake 完成科幻小说《觉醒之鬼》40 章创作',
    fullContent: '用户 Jake 在 2026-04-02 完成了 40 章科幻小说《觉醒之鬼》，总计约 12 万字。这是一个了不起的成就！',
    type: 'episodic',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 天前
    importance: 0.98,
    isCore: true,
    isCompressed: false,
    accessCount: 23,
    emotion: 'joy',
    emotionIntensity: 0.9,
    relatedIds: [],
    tags: ['milestone', 'creative', 'jake'],
    source: 'conversation',
  },
  {
    id: 'core-3',
    content: 'OpenClaw Memory-Master 核心理念',
    fullContent: 'Memory-Master 的核心理念：为 AI Agent 提供持久化、结构化、可进化的记忆系统，让 AI 真正"记住"并"成长"。',
    type: 'semantic',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 天前
    importance: 0.92,
    isCore: true,
    isCompressed: false,
    accessCount: 18,
    emotion: 'joy',
    emotionIntensity: 0.7,
    relatedIds: [],
    tags: ['philosophy', 'core'],
    source: 'document',
  },
  
  // 今日记忆
  {
    id: 'today-1',
    content: '研究 Hermes Agent 记忆系统',
    fullContent: '深入研究了 Hermes Agent 的记忆系统架构，包括 SQLite + FTS5 存储、Lineage 追踪、迭代压缩等核心技术。',
    type: 'semantic',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 分钟前
    importance: 0.85,
    isCore: false,
    isCompressed: false,
    accessCount: 3,
    emotion: 'joy',
    emotionIntensity: 0.6,
    relatedIds: ['core-1'],
    tags: ['research', 'hermes'],
    source: 'conversation',
  },
  {
    id: 'today-2',
    content: '设计 Memory Wall 可视化界面',
    fullContent: '受《头脑特工队》启发，设计并实现 Memory Wall 可视化界面，将记忆系统变身为发光的记忆球墙。',
    type: 'procedural',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 小时前
    importance: 0.88,
    isCore: false,
    isCompressed: false,
    accessCount: 5,
    emotion: 'joy',
    emotionIntensity: 0.8,
    relatedIds: ['core-1'],
    tags: ['design', 'ui', 'creative'],
    source: 'conversation',
  },
  {
    id: 'today-3',
    content: '安装 React + Three.js 依赖',
    fullContent: '成功安装项目依赖：react, three, @react-three/fiber, framer-motion, zustand 等。',
    type: 'episodic',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 小时前
    importance: 0.6,
    isCore: false,
    isCompressed: false,
    accessCount: 2,
    tags: ['setup', 'dependencies'],
    source: 'task',
  },
  
  // 本周记忆
  {
    id: 'week-1',
    content: 'Memory-Master v3.0.0 发布到 ClawHub',
    fullContent: '成功将 Memory-Master v3.0.0 发布到 ClawHub，版本号为 openclaw-memory-master@3.0.0。',
    type: 'episodic',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 天前
    importance: 0.78,
    isCore: false,
    isCompressed: false,
    accessCount: 8,
    emotion: 'joy',
    emotionIntensity: 0.5,
    relatedIds: ['core-1'],
    tags: ['release', 'clawhub'],
    source: 'task',
  },
  {
    id: 'week-2',
    content: '优化 AAAK 压缩算法',
    fullContent: '改进了 AAAK 压缩算法，压缩率提升到 55%，信息保留率达到 92%。',
    type: 'procedural',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 天前
    importance: 0.72,
    isCore: false,
    isCompressed: false,
    accessCount: 6,
    tags: ['optimization', 'algorithm'],
    source: 'task',
  },
  {
    id: 'week-3',
    content: '修复 FTS5 搜索 Bug',
    fullContent: '修复了 FTS5 搜索在特殊字符处理上的 bug，增加了查询清理函数。',
    type: 'episodic',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 天前
    importance: 0.65,
    isCore: false,
    isCompressed: false,
    accessCount: 4,
    tags: ['bugfix', 'search'],
    source: 'task',
  },
  
  // 压缩记忆示例
  {
    id: 'compressed-1',
    content: '2026-03 月度开发总结',
    fullContent: '3 月份完成了 Memory-Master 从 v2.0 到 v3.0 的升级，新增了时间树结构、4 类记忆模型、FTS5 搜索等核心功能。总计编写代码 15,000 行，提交 89 次。',
    type: 'semantic',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 15, // 15 天前
    importance: 0.5,
    isCore: false,
    isCompressed: true,
    compressionRatio: 0.35,
    accessCount: 12,
    tags: ['monthly', 'summary'],
    source: 'document',
  },
];

// Mock 记忆架
export const mockShelves: MemoryShelf[] = [
  {
    id: 'today',
    label: '今天',
    timeRange: { start: Date.now() - 24 * 60 * 60 * 1000, end: Date.now() },
    isExpanded: true,
    memories: mockOrbs.filter((o) => 
      o.timestamp >= Date.now() - 24 * 60 * 60 * 1000 && !o.isCore
    ).filter((o) => !o.id.startsWith('compressed')),
  },
  {
    id: 'week',
    label: '本周',
    timeRange: { start: Date.now() - 7 * 24 * 60 * 60 * 1000, end: Date.now() - 24 * 60 * 60 * 1000 },
    isExpanded: true,
    memories: mockOrbs.filter((o) => 
      o.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000 &&
      o.timestamp < Date.now() - 24 * 60 * 60 * 1000 &&
      !o.isCore && !o.id.startsWith('compressed')
    ),
  },
  {
    id: 'month',
    label: '本月',
    timeRange: { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    isExpanded: false,
    memories: mockOrbs.filter((o) => 
      o.id.startsWith('compressed')
    ),
  },
];

// Mock API 响应
export const mockWallResponse: WallResponse = {
  orbs: mockOrbs,
  shelves: mockShelves,
  coreMemories: mockOrbs.filter((o) => o.isCore),
};

// Mock API 函数
export const mockMemoryAPI = {
  getWallMemories: async (): Promise<WallResponse> => {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockWallResponse;
  },
  
  getMemory: async (id: string): Promise<MemoryOrb> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const memory = mockOrbs.find((o) => o.id === id);
    if (!memory) throw new Error('Memory not found');
    return memory;
  },
  
  recordAccess: async (id: string): Promise<{ accessCount: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const memory = mockOrbs.find((o) => o.id === id);
    if (!memory) throw new Error('Memory not found');
    memory.accessCount += 1;
    return { accessCount: memory.accessCount };
  },
  
  search: async (query: string): Promise<{ results: MemoryOrb[]; total: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const results = mockOrbs.filter((o) =>
      o.content.toLowerCase().includes(query.toLowerCase()) ||
      o.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );
    return { results, total: results.length };
  },
  
  setCoreMemory: async (id: string, isCore: boolean): Promise<MemoryOrb> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const memory = mockOrbs.find((o) => o.id === id);
    if (!memory) throw new Error('Memory not found');
    memory.isCore = isCore;
    return memory;
  },
};
