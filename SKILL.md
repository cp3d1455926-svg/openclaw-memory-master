---
name: memory-master
description: |
  OpenClaw 超级记忆增强 Skill。自动捕捉重要对话、智能过滤、记忆图谱、定期整理。
  解决 OpenClaw 重启后失忆的问题，实现跨会话记忆连续性。
  功能：
  - 自动监控对话，识别重要信息（项目、决策、待办、用户偏好）
  - 基于重要性评分智能过滤，只记真正重要的内容
  - 记忆关联图谱，自动链接相关记忆（人→项目→任务→文件）
  - 定期整理任务，后台自动提炼/合并/删除过期记忆
  - 重启自动加载，新会话开始时恢复关键上下文
  - 支持手动命令：/load-memory, /save-memory, /memory-status, /memory-graph
---

# Memory-Master - OpenClaw 超级记忆增强 Skill

## 激活条件

当用户提到以下关键词时自动激活：
- 记忆、记忆力、记住、记下来
- 重启、/new、/reset、新会话
- 上次我们聊到、之前的对话
- 记忆图谱、记忆整理

或用户直接使用命令：
- `/load-memory` - 手动加载记忆
- `/save-memory` - 手动保存记忆
- `/memory-status` - 查看记忆状态
- `/memory-graph` - 查看记忆图谱

---

## 核心功能

### 1. 对话监控（自动）

每次对话后自动执行：
1. 读取最近对话历史
2. 识别重要信息（使用重要性评分算法）
3. 压缩/摘要重要对话
4. 写入记忆文件（daily notes + MEMORY.md）
5. 更新记忆图谱

### 2. 重要性评分

基于以下维度评分：
- **关键词匹配**（+10 分/个）：项目、决定、待办、记住、重要、偏好、习惯
- **用户指令**（+30 分）："记住这个"、"记下来"、"别忘了"
- **具体数据**（+5 分/个）：日期、URL、数字、文件名
- **总结语句**（+15 分）："总之"、"所以"、"决定"、"结论"

**阈值**：> 50 分 → 写入记忆

### 3. 记忆压缩

使用 LLM 生成结构化摘要：
```
## 主题
[1 句话总结]

## 关键信息
- [要点 1]
- [要点 2]

## 待办
- [ ] [任务 1]
- [ ] [任务 2]
```

### 4. 记忆图谱

JSON 格式存储关联关系：
- **节点类型**：person, project, task, file, concept
- **关系类型**：created, related_to, depends_on, part_of

### 5. 定期整理

Cron 任务（每天 03:00）：
- 合并相似记忆
- 提炼长期记忆
- 删除过期信息（>30 天）
- 更新记忆图谱

### 6. 重启自动加载

检测新会话时：
1. 读取最近的 daily note
2. 提取关键上下文
3. 自动注入到系统提示
4. 用户无感知恢复

---

## 手动命令

### /load-memory

**功能**：手动加载上次会话记忆

**执行流程**：
1. 读取最近的 daily note（昨天或今天）
2. 读取 MEMORY.md 中的相关部分
3. 读取记忆图谱
4. 生成上下文摘要
5. 输出到对话

**输出示例**：
```
🧠 已加载记忆：

## 上次会话（2026-04-05）
- 讨论了 Memory-Master skill 设计方案
- 决定分 3 个阶段开发（MVP → 完整版 → 10 倍愿景）
- 创建了 DESIGN.md 设计文档

## 待办事项
- [ ] 创建 skill 目录结构
- [ ] 实现记忆捕捉模块
- [ ] 实现重要性评分算法

## 记忆图谱
- Jake → 创建了 → Memory-Master 项目
- Memory-Master → 依赖于 → OpenClaw

需要我继续哪个任务？
```

---

### /save-memory

**功能**：手动保存当前会话记忆

**执行流程**：
1. 读取当前会话历史
2. 识别重要信息
3. 生成摘要
4. 写入 daily note
5. 更新 MEMORY.md
6. 更新记忆图谱

**输出示例**：
```
✅ 记忆已保存：
- 写入文件：memory/2026-04-06.md
- 更新：MEMORY.md
- 更新：memory-graph.json

保存的关键信息：
- 项目：Memory-Master skill 开发
- 决策：分 3 阶段开发
- 待办：3 个任务
```

---

### /memory-status

**功能**：查看记忆系统状态

**输出示例**：
```
🧠 Memory-Master 状态

## 记忆文件
- MEMORY.md: 12 KB, 最后更新 2026-04-06 13:00
- memory-graph.json: 3 KB, 12 个节点，8 条边
- 今日记忆：2026-04-06.md (5 条记录)

## 系统状态
- 自动捕捉：✅ 启用
- 定期整理：✅ 启用（每天 03:00）
- 重启加载：✅ 启用
- 重要性阈值：50 分

## 最近记忆
1. [2026-04-06 13:00] Memory-Master 设计方案讨论
2. [2026-04-06 12:30] 决定分 3 阶段开发
3. [2026-04-05 21:00] Clawvard 练习 3 次满分
```

---

### /memory-graph

**功能**：查看记忆关联图谱

**输出示例**：
```
🕸️ 记忆图谱

## 人物
- Jake (用户，12 岁，喜欢小说和技术)

## 项目
- Memory-Master (技能开发中)
- 觉醒之鬼 (40 章科幻小说，已完成)

## 关系
Jake → 创建了 → Memory-Master
Jake → 创建了 → 觉醒之鬼
Memory-Master → 依赖于 → OpenClaw
觉醒之鬼 → 主题是 → AI 觉醒

## 统计
- 节点：12 个
- 边：8 条
- 最后更新：2026-04-06 13:00
```

---

## 记忆文件结构

### memory/YYYY-MM-DD.md

```markdown
# YYYY-MM-DD 星期 X

## 📝 对话记录

### [时间戳] 主题
- 关键信息 1
- 关键信息 2
- 待办：[ ] 任务

## 📊 统计
- 对话轮数：X
- 重要记忆：Y 条
- 新建文件：Z 个
```

### memory/memory-graph.json

```json
{
  "nodes": [
    {
      "id": "person-jake",
      "type": "person",
      "name": "Jake",
      "metadata": { "age": 12, "interests": ["小说", "技术"] },
      "createdAt": "2026-04-02T00:00:00Z"
    }
  ],
  "edges": [
    {
      "from": "person-jake",
      "to": "project-memory-master",
      "relation": "created",
      "createdAt": "2026-04-06T00:00:00Z"
    }
  ],
  "lastUpdated": "2026-04-06T13:00:00Z"
}
```

### memory/memory-state.json

```json
{
  "lastCapture": "2026-04-06T13:00:00Z",
  "lastOrganize": "2026-04-06T03:00:00Z",
  "totalMemories": 42,
  "graphNodes": 12,
  "graphEdges": 8,
  "config": {
    "importanceThreshold": 50,
    "autoLoadOnStart": true,
    "organizeSchedule": "0 3 * * *",
    "maxMemoryAge": 30,
    "enableGraph": true
  }
}
```

---

## 配置

在 `~/.openclaw/workspace/skills/memory-master/config.json` 中配置：

```json
{
  "importanceThreshold": 50,
  "autoLoadOnStart": true,
  "organizeSchedule": "0 3 * * *",
  "maxMemoryAge": 30,
  "enableGraph": true,
  "debug": false
}
```

**配置项说明**：
- `importanceThreshold`: 重要性阈值（默认 50），低于此分数不写入记忆
- `autoLoadOnStart`: 启动时自动加载记忆（默认 true）
- `organizeSchedule`: Cron 表达式，定期整理时间（默认每天 03:00）
- `maxMemoryAge`: 记忆最大保存天数（默认 30），超过此天数的记忆可能被清理
- `enableGraph`: 启用记忆图谱（默认 true）
- `debug`: 调试模式，输出详细日志（默认 false）

---

## 错误处理

### 常见问题

**Q: 记忆没有自动保存？**
A: 检查重要性阈值是否太高，或对话中确实没有重要信息。使用 `/save-memory` 手动保存。

**Q: 重启后没有自动加载记忆？**
A: 检查 `config.json` 中 `autoLoadOnStart` 是否为 true。使用 `/load-memory` 手动加载。

**Q: 记忆图谱为空？**
A: 检查 `enableGraph` 是否为 true。记忆图谱需要累积一定对话后才会生成。

**Q: 定期整理没有执行？**
A: 检查 cron 配置是否正确，或查看 `memory-state.json` 中的 `lastOrganize` 时间。

---

## 开发笔记

### 依赖

本 skill 使用 OpenClaw 内置工具：
- `memory_search` / `memory_get` - 记忆读写
- `cron` - 定期整理任务
- `sessions_history` - 读取对话历史
- `exec` - 文件操作（可选）

### 性能优化

1. **增量更新** - 只处理新增对话，不重复处理历史
2. **批量写入** - 积累多条记忆后一次性写入，减少 I/O
3. **懒加载** - 记忆图谱只在请求时加载
4. **缓存** - 记忆状态缓存到内存，避免重复读取文件

### 安全考虑

1. **不记录敏感信息** - 自动过滤密码、密钥、个人信息
2. **本地存储** - 所有记忆文件存储在本地，不上传云端
3. **用户可控** - 提供手动删除记忆的接口

---

## 更新日志

### v0.1.0 (2026-04-06)
- ✨ 初始版本
- ✅ 智能记忆捕捉
- ✅ 重要性评分
- ✅ 定期整理
- ✅ 记忆图谱
- ✅ 手动命令支持

---

**Made with 👻 by 小鬼 × Jake**
