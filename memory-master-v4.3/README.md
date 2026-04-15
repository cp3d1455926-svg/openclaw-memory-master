# Memory-Master v4.3.0 🧠

> OpenClaw 的增强型记忆系统 - 知识图谱 + 优先级管理 + GraphRAG

## ✨ 新特性（v4.3.0）

- 🎯 **实体关系自动提取** - 从文本中自动识别实体和关系
- 📊 **P0/P1/P2 优先级系统** - 智能管理记忆重要性
- ⏰ **时间衰减检索优化** - 更智能的时间权重算法
- 🔗 **GraphRAG 集成** - 知识图谱 + 向量检索融合
- 📁 **层次化存储** - 索引 + 详情文件，Token 节省 70%
- 🌐 **记忆谱系可视化** - 可视化记忆演化图

## 📦 安装

```bash
# 克隆项目
git clone https://github.com/cp3d1455926-svg/openclaw-memory.git
cd openclaw-memory

# 安装依赖
pip install -r requirements.txt
```

## 🚀 快速开始

```python
from memory_master import MemoryMaster

# 初始化
mm = MemoryMaster(workspace="~/.openclaw/workspace")

# 添加记忆
mm.add("用户喜欢喝咖啡", priority="P1")

# 检索记忆
results = mm.search("用户偏好", top_k=5)
```

## 📁 项目结构

```
memory-master/
├── src/
│   ├── core/          # 核心模块
│   ├── extractor/     # 实体关系提取
│   ├── priority/      # 优先级管理
│   ├── graph/         # 知识图谱引擎
│   └── viz/           # 可视化组件
├── scripts/           # 工具脚本
├── tests/             # 单元测试
└── docs/              # 文档
```

## 📊 性能指标

| 指标 | v4.2.0 | v4.3.0（目标） |
|------|--------|----------------|
| 压缩时间 | 45ms | 40ms |
| P95 延迟 | 52ms | 45ms |
| 检索准确率 | 87% | 92% |
| Token 节省 | 85% | 90% |

## 📝 更新日志

### v4.3.0 (2026-04-xx)
- 新增实体关系自动提取器
- 新增 P0/P1/P2 优先级系统
- 优化时间衰减检索算法
- 集成 GraphRAG
- 实现层次化存储
- 新增记忆谱系可视化

### v4.2.0 (2026-04-11)
- 4 类记忆模型
- AAAK 压缩算法
- 知识图谱引擎
- 多路召回融合

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
