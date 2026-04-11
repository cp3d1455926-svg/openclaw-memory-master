# 🧠 Memory Wall - 记忆墙

> **头脑特工队风格的 AI 记忆墙可视化界面**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/cp3d1455926-svg/memory-master)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-🚧%20开发中-yellow)]()

---

## 🎬 灵感来源

本项目灵感来自皮克斯动画电影《头脑特工队 1&2》(Inside Out)，将抽象的记忆概念可视化为一颗颗发光的记忆球，让 AI 记忆系统变得生动有趣！

![Memory Wall Concept](./docs/concept.png)

---

## ✨ 核心特性

### 🎨 视觉设计

- **4 类记忆颜色编码**
  - 🔵 情景记忆 (蓝色 - 忧忧)
  - 🟡 语义记忆 (金色 - 乐乐)
  - 🟢 程序记忆 (绿色 - 怕怕)
  - 🟣 人设记忆 (紫色 - 怒怒)

- **重要性可视化**
  - 核心记忆：大尺寸 + 强发光 + 脉动动画
  - 高重要性：较大尺寸 + 发光
  - 普通记忆：标准尺寸
  - 压缩记忆：小尺寸 + 灰色 + 睡眠图标

- **情绪模式**
  - 😐 普通模式：显示所有记忆
  - 🟡 乐乐模式：只显示高重要性记忆
  - 🔵 忧忧模式：显示所有记忆 (包括低重要性)
  - 🟠 焦焦模式：显示待办/未完成事项

### 🎮 交互功能

- **悬停预览**: 鼠标悬停显示记忆摘要
- **点击详情**: 打开完整记忆详情面板
- **搜索过滤**: 快速查找特定记忆
- **时间轴导航**: 按时间浏览记忆架
- **核心记忆区**: 顶部展示最重要的记忆

### 📱 响应式设计

- 桌面端：完整 3D 效果 + 多列布局
- 平板端：简化效果 + 中等列数
- 手机端：2D 布局 + 单列展示

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
cd projects/memory-wall
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000 查看效果

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

---

## 📊 项目结构

```
memory-wall/
├── src/
│   ├── components/
│   │   ├── MemoryWall/       # 主记忆墙组件
│   │   ├── MemoryOrb/        # 记忆球组件
│   │   ├── MemoryShelf/      # 记忆架组件
│   │   ├── CoreMemories/     # 核心记忆区
│   │   ├── MemoryDetail/     # 记忆详情面板
│   │   ├── SearchBar/        # 搜索栏
│   │   └── MoodMode/         # 情绪模式切换
│   ├── hooks/
│   │   ├── useMemoryStore.ts # Zustand 状态管理
│   │   └── useMemoryAPI.ts   # API 调用钩子
│   ├── api/
│   │   └── memory-api.ts     # Memory-Master API 客户端
│   ├── types/
│   │   └── memory.ts         # TypeScript 类型定义
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

## 🔌 API 集成

Memory Wall 需要连接 Memory-Master API 获取记忆数据。

### 环境变量

创建 `.env` 文件：

```env
VITE_MEMORY_MASTER_API_URL=http://localhost:3001/api/v1
```

### API Endpoints

```typescript
GET  /api/v1/wall/memories?range=today&limit=100
GET  /api/v1/wall/memories/:id
POST /api/v1/wall/memories/:id/access
GET  /api/v1/wall/search?q=xxx
POST /api/v1/wall/memories/:id/core
GET  /api/v1/wall/stats
```

详细 API 文档请参考 Memory-Master 项目。

---

## 🎯 开发计划

### v1.0.0 (MVP) - 🚧 开发中

- [x] 项目初始化
- [x] 基础记忆墙布局
- [x] 记忆球渲染
- [x] 点击查看详情
- [x] 基础搜索
- [ ] 连接真实 API
- [ ] 部署上线

### v1.1.0

- [ ] Three.js 3D 效果
- [ ] 核心记忆区动画增强
- [ ] 时间轴导航
- [ ] 键盘快捷键

### v1.2.0

- [ ] 动画增强 (脉动/悬浮)
- [ ] 搜索高亮
- [ ] 响应式优化
- [ ] 性能优化 (虚拟滚动)

### v2.0.0

- [ ] 记忆拖拽
- [ ] 批量操作
- [ ] 导出分享
- [ ] 音效系统
- [ ] 深色/浅色主题

---

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **3D 引擎**: Three.js + React Three Fiber (v1.1.0+)
- **动画**: Framer Motion
- **状态管理**: Zustand
- **HTTP 客户端**: Axios

---

## 📝 许可证

MIT License © 2026 Jake & 小鬼 👻

---

## 🙏 致谢

- 灵感来源：皮克斯《头脑特工队》
- Memory-Master 项目支持
- OpenClaw 生态系统

---

## 📬 联系方式

- GitHub: [@cp3d1455926-svg](https://github.com/cp3d1455926-svg)
- 项目地址：[Memory-Master](https://github.com/cp3d1455926-svg/memory-master)

---

**Built with ❤️ and 👻**
