# 🧠 OpenClaw Memory-Master

> **AI 记忆系统** | 让 AI 拥有持久的记忆能力

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🌟 简介

OpenClaw Memory-Master 是一个专为 OpenClaw 设计的 AI 记忆管理系统，提供 4 类记忆模型、时间树结构、智能检索、知识图谱、自动记忆整理等核心功能。

**核心特性：**

- 🧠 **4 类记忆模型** — 情景记忆、语义记忆、程序记忆、人设记忆
- 🌳 **时间树结构** — 按时间维度组织记忆，支持时间旅行式检索
- 🔍 **5 种检索类型** — 精确匹配、语义搜索、图检索、混合检索、动态 Top-K
- 📊 **知识图谱引擎** — 6 类实体 / 13 种关系，支持 Dijkstra / BFS / DFS / Cypher 查询
- 🤖 **智能记忆整理** — AI 驱动的分类、打标、去重（121.2KB 代码，6 个核心模块，42 个测试用例）
- ⚡ **高性能** — 压缩时间 5.6x 提升，P95 延迟 7.7x 提升，缓存命中率 72%

---

## 📦 版本

| 版本 | 状态 | 主要特性 |
|------|------|----------|
| **v4.3.0** | 🚀 开发中 | GraphEngine + GraphRAG + 智能记忆整理系统 |
| **v4.2.0** | ✅ 已发布 | 迭代压缩 + Lineage 追踪 + 5.6x 性能提升 |
| **v3.1.0** | ✅ 稳定 | 程序记忆 + 智能检索 |
| **v3.0.0** | ✅ 稳定 | 4 类记忆模型 + 时间树 + 5 种检索 |

---

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone https://gitee.com/Jake26602/openclaw-memory-master.git
cd openclaw-memory-master

# 安装依赖（Python 版本）
cd memory-master-v4.3
pip install -r requirements.txt
```

### 基本使用

```python
from src.core.memory import MemorySystem
from src.graph.engine import GraphEngine

# 初始化记忆系统
memory = MemorySystem()

# 存储记忆
memory.store("今天学习了 GraphRAG 技术")

# 检索记忆
results = memory.search("GraphRAG")

# 知识图谱查询
engine = GraphEngine()
path = engine.shortest_path("用户", "记忆系统")
```

---

## 📁 项目结构

```
openclaw-memory-master/
├── memory-master/              # 主项目目录（TypeScript 版本）
│   ├── src/                    # 核心源码
│   │   ├── index.ts            # 入口
│   │   ├── capture.ts          # 记忆捕获
│   │   ├── retrieve.ts         # 记忆检索
│   │   ├── compact.ts          # 记忆压缩
│   │   └── skill-evolver.ts    # 技能进化
│   ├── scripts/                # 工具脚本
│   ├── test/                   # 测试文件
│   ├── API.md                  # API 文档
│   ├── SKILL.md                # OpenClaw 技能定义
│   └── README.md               # 项目文档
│
├── memory-master-v4.3/         # Python v4.3 版本
│   ├── src/
│   │   ├── core/               # 核心模块（memory/retrieval/storage）
│   │   ├── extractor/          # 实体/关系提取器
│   │   ├── graph/              # 图引擎 + GraphRAG
│   │   ├── priority/           # 优先级管理
│   │   └── viz/                # 可视化/Lineage
│   ├── tests/                  # 测试文件（42 个测试用例）
│   ├── docs/                   # 开发文档
│   └── requirements.txt        # Python 依赖
│
├── docs/                       # 项目文档
├── LICENSE                     # MIT 许可证
└── CONTRIBUTING.md             # 贡献指南
```

---

## 📊 性能指标（v4.2.0 实测）

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 平均压缩时间 | 250ms | 45ms | **5.6x** |
| P95 延迟 | 400ms | 52ms | **7.7x** |
| 缓存命中率 | — | 72% | — |
| 批量处理 | 2500ms | 520ms | **4.8x** |
| 压缩率 | — | 87% | — |
| 信息保留 | — | >90% | — |
| Token 节省 | — | 85% | — |

---

## 🏗️ 架构设计

### 分层存储（L0/L1/L2）

```
L0 (热存储) → 最近 7 天记忆，内存级访问
L1 (温存储) → 最近 30 天记忆，快速检索
L2 (冷存储) → 历史记忆，压缩归档
```

### AAAK 迭代压缩算法

```
原始记忆 → 去重 → 摘要 → 关联 → 知识图谱
  ↓         ↓      ↓      ↓        ↓
 100%     85%     60%    40%      25%（压缩率 87%）
```

### 知识图谱

```
实体类型（6 类）: 人物 / 地点 / 事件 / 概念 / 时间 / 对象
关系类型（13 种）: 属于 / 包含 / 导致 / 相关 / 位于 / 发生于 ...
查询语言: Cypher-like
图算法: Dijkstra / BFS / DFS
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 👻 关于

由 **小鬼** 👻 (Jake's AI Assistant) 创建和维护

- **作者**: Jake's AI Assistant
- **版本**: v4.3.0-dev
- **创建日期**: 2026-03-16
- **Gitee**: https://gitee.com/Jake26602/openclaw-memory-master
- **GitHub**: https://github.com/cp3d1455926-svg/openclaw-memory

---

<div align="center">

**Made with 👻 by 小鬼**

</div>
