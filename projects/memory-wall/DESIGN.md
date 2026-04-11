# Memory Wall - 头脑特工队风格记忆墙

**版本**: v1.0.0  
**创建日期**: 2026-04-11  
**灵感**: 皮克斯《头脑特工队 1&2》  
**状态**: 🚧 开发中

---

## 🎨 视觉设计

### 配色方案

```css
/* 记忆类型颜色 */
--episodic-color: #3B82F6;      /* 蓝色 - 忧忧 */
--semantic-color: #FBBF24;      /* 金色 - 乐乐 */
--procedural-color: #10B981;    /* 绿色 - 怕怕 */
--persona-color: #8B5CF6;       /* 紫色 - 怒怒 */

/* 情感颜色 */
--joy-color: #FBBF24;           /* 金色 */
--sadness-color: #3B82F6;       /* 蓝色 */
--fear-color: #10B981;          /* 绿色 */
--anger-color: #EF4444;         /* 红色 */
--disgust-color: #84CC16;       /* 青柠色 */

/* 状态颜色 */
--fresh-color: rgba(255, 255, 255, 0.9);    /* 新鲜记忆 */
--faded-color: rgba(255, 255, 255, 0.4);    /* 褪色记忆 */
--compressed-color: rgba(255, 255, 255, 0.2); /* 压缩记忆 */
--core-glow: rgba(251, 191, 36, 0.6);       /* 核心发光 */
```

### 记忆球尺寸

| 重要性 | 直径 | 亮度 | 效果 |
|--------|------|------|------|
| 核心记忆 | 80px | 100% | 强发光 + 脉动 |
| 高重要性 | 60px | 80% | 发光 |
| 中重要性 | 45px | 60% | 无 |
| 低重要性 | 30px | 40% | 半透明 |
| 压缩记忆 | 20px | 20% | 灰色 + 睡眠图标 |

---

## 🏗️ 架构设计

### 技术栈

```yaml
前端框架: React 18 + TypeScript
3D 引擎: Three.js + React Three Fiber
动画库: Framer Motion
样式: Tailwind CSS + CSS Modules
状态管理: Zustand
构建工具: Vite
部署: Cloudflare Pages
```

### 项目结构

```
memory-wall/
├── public/
│   ├── favicon.ico
│   └── sounds/              # 音效文件
│       ├── orb-click.mp3
│       └── ambient.mp3
├── src/
│   ├── components/
│   │   ├── MemoryWall/      # 主记忆墙组件
│   │   │   ├── MemoryWall.tsx
│   │   │   ├── MemoryWall.css
│   │   │   └── index.ts
│   │   ├── MemoryOrb/       # 记忆球组件
│   │   │   ├── MemoryOrb.tsx
│   │   │   ├── MemoryOrb3D.tsx
│   │   │   ├── MemoryOrb.css
│   │   │   └── index.ts
│   │   ├── MemoryShelf/     # 记忆架组件
│   │   │   ├── MemoryShelf.tsx
│   │   │   └── MemoryShelf.css
│   │   ├── CoreMemories/    # 核心记忆区
│   │   │   ├── CoreMemories.tsx
│   │   │   └── CoreMemories.css
│   │   ├── MemoryDetail/    # 记忆详情面板
│   │   │   ├── MemoryDetail.tsx
│   │   │   └── MemoryDetail.css
│   │   ├── SearchBar/       # 搜索栏
│   │   │   ├── SearchBar.tsx
│   │   │   └── SearchBar.css
│   │   ├── Timeline/        # 时间轴导航
│   │   │   ├── Timeline.tsx
│   │   │   └── Timeline.css
│   │   └── MoodMode/        # 情绪模式切换
│   │       ├── MoodMode.tsx
│   │       └── MoodMode.css
│   ├── hooks/
│   │   ├── useMemoryStore.ts    # Zustand store
│   │   ├── useMemoryAPI.ts      # API 调用
│   │   └── useOrbAnimation.ts   # 动画钩子
│   ├── types/
│   │   └── memory.ts            # TypeScript 类型
│   ├── utils/
│   │   ├── colors.ts            # 颜色工具
│   │   ├── animations.ts        # 动画工具
│   │   └── time.ts              # 时间工具
│   ├── api/
│   │   └── memory-api.ts        # API 客户端
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 📊 数据类型

### MemoryOrb

```typescript
interface MemoryOrb {
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

type MemoryType = 'episodic' | 'semantic' | 'procedural' | 'persona';
type EmotionType = 'joy' | 'sadness' | 'fear' | 'anger' | 'disgust';
```

### MemoryShelf

```typescript
interface MemoryShelf {
  id: string;
  label: string;             // "今天", "本周", "本月", "更早"
  timeRange: {
    start: number;
    end: number;
  };
  memories: MemoryOrb[];
  isExpanded: boolean;       // 是否展开
}
```

### WallState

```typescript
interface WallState {
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
  accessOrb: (id: string) => void;  // 记录访问
}

type TimeRange = 'today' | 'week' | 'month' | 'all';
type MoodMode = 'normal' | 'joy' | 'sadness' | 'anxiety';
```

---

## 🔌 API 设计

###  endpoints

```typescript
// Memory-Master API 扩展

// 获取记忆墙数据
GET /api/v1/wall/memories?range=today&limit=100
Response: {
  orbs: MemoryOrb[];
  shelves: MemoryShelf[];
  coreMemories: MemoryOrb[];
}

// 获取单个记忆详情
GET /api/v1/wall/memories/:id
Response: MemoryOrb

// 记录访问
POST /api/v1/wall/memories/:id/access
Request: { duration?: number }
Response: { accessCount: number }

// 搜索记忆
GET /api/v1/wall/search?q=xxx&type=episodic&limit=50
Response: { results: MemoryOrb[]; total: number }

// 设置核心记忆
POST /api/v1/wall/memories/:id/core
Request: { isCore: boolean }
Response: MemoryOrb

// 获取统计
GET /api/v1/wall/stats
Response: {
  total: number;
  today: number;
  compressed: number;
  byType: Record<MemoryType, number>;
  byEmotion: Record<EmotionType, number>;
}
```

---

## 🎬 动画效果

### 记忆球动画

```css
/* 脉动动画 (核心记忆) */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.9; }
}

/* 悬浮动画 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* 闪烁动画 (新记忆) */
@keyframes shimmer {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* 加载动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Three.js 效果

```typescript
// 记忆球材质
const orbMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Color(color) },
    glowIntensity: { value: importance },
    time: { value: 0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform float glowIntensity;
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
      vec3 glow = color * glowIntensity * intensity;
      gl_FragColor = vec4(color + glow, 1.0);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
});
```

---

## 🎮 交互设计

### 鼠标交互

| 操作 | 效果 |
|------|------|
| 悬停 | 记忆球放大 10% + 显示预览 |
| 点击 | 打开详情面板 |
| 双击 | 全屏查看内容 |
| 右键 | 上下文菜单 (编辑/删除/设核心) |
| 拖拽 | 移动记忆球 (重新排序) |

### 键盘快捷键

```
Ctrl/Cmd + K  → 打开搜索
Ctrl/Cmd + J  → 切换到乐乐模式
Ctrl/Cmd + S  → 切换到忧忧模式
Esc           → 关闭详情面板
←/→           → 导航时间轴
```

### 触摸交互 (移动端)

```
点击 → 打开详情
长按 → 上下文菜单
双指缩放 → 时间轴缩放
滑动 → 滚动记忆架
```

---

## 🎭 情绪模式

### Normal Mode (默认)
```
显示所有记忆
标准配色
正常动画速度
```

### Joy Mode (乐乐模式)
```
只显示高重要性记忆 (importance > 0.7)
金色温暖色调
快速脉动动画
隐藏压缩记忆
```

### Sadness Mode (忧忧模式)
```
显示所有记忆 (包括低重要性)
蓝色冷静色调
慢速动画
适合深度回顾
```

### Anxiety Mode (焦焦模式)
```
显示待办/未完成事项
橙色警示色调
快速闪烁动画
显示时间压力提示
```

---

## 📱 响应式断点

```css
/* 移动端 */
@media (max-width: 640px) {
  .memory-orb { --base-size: 25px; }
  .shelf { grid-template-columns: repeat(5, 1fr); }
}

/* 平板端 */
@media (min-width: 641px) and (max-width: 1024px) {
  .memory-orb { --base-size: 35px; }
  .shelf { grid-template-columns: repeat(8, 1fr); }
}

/* 桌面端 */
@media (min-width: 1025px) {
  .memory-orb { --base-size: 45px; }
  .shelf { grid-template-columns: repeat(12, 1fr); }
}

/* 大屏幕 */
@media (min-width: 1440px) {
  .memory-orb { --base-size: 55px; }
  .shelf { grid-template-columns: repeat(16, 1fr); }
}
```

---

## 🚀 开发里程碑

### MVP (v1.0.0) - 2026-04-11
- [x] 项目初始化
- [ ] 基础记忆墙布局 (2D)
- [ ] 记忆球渲染
- [ ] 点击查看详情
- [ ] 基础搜索

### v1.1.0 - 2026-04-12
- [ ] 3D 效果 (Three.js)
- [ ] 核心记忆区
- [ ] 时间轴导航
- [ ] 情绪模式切换

### v1.2.0 - 2026-04-13
- [ ] 动画增强 (脉动/悬浮)
- [ ] 搜索高亮
- [ ] 响应式设计
- [ ] 性能优化

### v2.0.0 - 2026-04-15
- [ ] 记忆拖拽
- [ ] 批量操作
- [ ] 导出分享
- [ ] 音效系统

---

## 🎯 成功指标

```
性能:
- 首屏加载 < 2 秒
- 记忆球渲染 < 100ms (100 个球)
- 搜索响应 < 500ms

体验:
- 60fps 动画
- 无卡顿滚动
- 流畅的交互动画

功能:
- 支持 1000+ 记忆球
- 支持 5 种情绪模式
- 支持完整 CRUD 操作
```

---

## 📝 待办事项

### 高优先级
- [ ] 实现 MemoryOrb 组件
- [ ] 实现 MemoryWall 主布局
- [ ] 连接 Memory-Master API
- [ ] 部署到 Cloudflare Pages

### 中优先级
- [ ] Three.js 3D 效果
- [ ] Framer Motion 动画
- [ ] 搜索功能
- [ ] 响应式设计

### 低优先级
- [ ] 音效系统
- [ ] 键盘快捷键
- [ ] 拖拽功能
- [ ] 分享功能

---

## 🎬 彩蛋想法

### 电影致敬
- [ ] 加载动画：记忆球落下
- [ ] 点击音效：电影原声
- [ ] 冰棒遗忘区：压缩记忆特殊展示
- [ ] 彩虹独角兽：达成成就时的特效

### 个性化
- [ ] 自定义记忆球颜色
- [ ] 自定义布局
- [ ] 自定义动画速度
- [ ] 深色/浅色主题

---

**Let's build this!** 🚀👻
