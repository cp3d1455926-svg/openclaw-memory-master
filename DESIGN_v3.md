# Memory-Master v3.0 综合设计文档

**创建时间**: 2026-04-06  
**版本**: v3.0  
**参考来源**: 12 篇行业最佳实践笔记  
**状态**: 设计阶段

---

## 📋 目录

1. [愿景与定位](#愿景与定位)
2. [行业调研总结](#行业调研总结)
3. [核心设计理念](#核心设计理念)
4. [架构设计](#架构设计)
5. [功能模块](#功能模块)
6. [v3.0 改进计划](#v30-改进计划)
7. [实施路线图](#实施路线图)
8. [评估体系](#评估体系)

---

## 🎯 愿景与定位

### 愿景

> **让 AI Agent 拥有真正的记忆能力，像人类一样记住并理解长期交互。**

### 定位

Memory-Master 是一个**本地优先的 AI Agent 记忆增强系统**，为 OpenClaw 等 AI Agent 提供：
- ✅ 跨会话记忆连续性
- ✅ 智能记忆捕捉与过滤
- ✅ 深度复盘与洞察提取
- ✅ 高效记忆检索与注入

### 设计原则

1. **本地优先** - 数据完全本地，隐私安全
2. **复盘式记忆** - 不是流水账，而是深度复盘
3. **全流程渗透** - 记忆贯穿 PDCA 全链路
4. **智能压缩** - 5 阶段管道，保留关键信息
5. **可扩展** - 支持插件化扩展

---

## 📊 行业调研总结

### 12 篇参考笔记

| # | 主题 | 核心观点 | 采纳情况 |
|---|------|---------|---------|
| 1 | 4 类记忆模型 | 工作/情景/语义/程序 | ✅ 已采纳 |
| 2 | 大模型记忆技术 | PE+ 工具 + 算力 + 存储 | ✅ 已实现 |
| 3 | 6 个 Agent 对比 | OpenClaw 是唯一有真正记忆的 | ✅ 增强版 |
| 4 | 8 种记忆策略 | 分层/压缩/图谱等 | ✅ 已实现 5/8 |
| 5 | Memoria 框架 | 贝莱德提出，解决失忆 | ✅ 理念一致 |
| 6 | TiMem 框架 | 时间分层记忆 | 🔜 待实现 |
| 7 | 复盘>流水账 | 深度复盘机制 | ✅ 已实现 |
| 8 | AdaMem(清华) | 4 层异构 + 多智能体 | ✅ 设计一致 |
| 9 | Agent 综述 4 篇 | 三维分类 + 效率优化 | ✅ 已采纳 |
| 10 | 五层记忆模型 | 开发者实战分享 | 🔜 待实现 |
| 11 | RAG 局限性 | Agentic Memory > RAG | ✅ 已是 Agentic Memory |
| 12 | 企业级架构 | PDCA 全链路渗透 | ✅ 已渗透 |

---

### 核心洞察

#### 1. 记忆范式：Agentic Memory > RAG

**来源**: 笔记 11

> "RAG 适合检索静态知识，但对于管理自主智能体的动态、演化状态根本不够。"

**Memory-Master 的选择**: ✅ Agentic Memory 范式
- 不只是检索，而是**记忆管理**
- 不只是存储，而是**深度复盘**
- 不只是添加，而是**更新演化**

---

#### 2. 记忆模型：4 类/5 层/8 种策略

**来源**: 笔记 1, 4, 8, 10

**4 类记忆** (AdaMem):
- 工作记忆 (Working) - 近期上下文
- 情景记忆 (Episodic) - 具体事件
- 语义记忆 (Semantic) - 通用知识
- 程序记忆 (Procedural) - 技能流程
- + 人设记忆 (Persona) - 用户特征

**5 层记忆** (笔记 10):
- L0: 原始观察
- L1: 短期记忆
- L2: 长期记忆
- L3: 结构化知识
- L4: 个性化表示

**8 种策略** (笔记 4):
- 全量记忆、滑动窗口、相关性过滤
- 摘要/压缩、向量数据库、知识图谱
- 分层记忆、类 OS 内存管理

---

#### 3. 架构设计：PDCA 全链路渗透

**来源**: 笔记 12

```
P (Plan) → D (Do) → C (Check) → A (Act)
   ↓          ↓         ↓         ↓
 记忆注入  记忆记录  记忆对比  记忆更新
```

**Memory-Master 的实现**: ✅ 全流程渗透

---

#### 4. 效率优化：按需加载 + 智能过滤

**来源**: 笔记 3, 9

**核心观点**:
- "不是每步都要调 API，token 烧得飞快的框架可以优化了"
- "grep 在实践中胜过 RAG"

**Memory-Master 的实现**:
- ✅ 重要性评分过滤（只记重要的）
- ✅ 分层加载（按需加载 L0/L1/L2）
- ✅ 文本搜索优先（向量可选）

---

## 🧠 核心设计理念

### 1. 三维记忆设计框架

**来源**: 笔记 9《Memory in the Age of AI Agents》

| 维度 | 问题 | Memory-Master 选择 |
|------|------|-------------------|
| **存在哪** | 存储位置 | 外部存储（文件系统） |
| **干嘛用** | 用途 | 事实 + 经验 + 工作记忆 |
| **怎么流动** | 生命周期 | 形成 + 演化 + 检索 |

---

### 2. 复盘式记忆

**来源**: 笔记 7

> "人是通过复盘变得更强大的，而不是记流水账日志。"

**Memory-Master 的实现**:
```
原始对话 → 重要性评分 → 实体提取 → 写入记忆
           ↓
      记忆巩固（复盘）
           ↓
  合并相似 + 移除矛盾 + 提取洞察
           ↓
      智能压缩（提炼精华）
           ↓
      结构化存储（图谱）
```

**对比流水账**:
- ❌ 流水账：记录所有对话
- ✅ 复盘式：只记录重要的 + 深度加工

---

### 3. Agentic Memory 范式

**来源**: 笔记 11

**从 Retrieval 到 Memory Management**:
```
旧范式 (RAG):
  用户查询 → 检索 → 返回结果

新范式 (Agentic Memory):
  用户交互 → 编码 → 存储 → 巩固 → 演化
     ↓
  需要时 → 检索 → 注入 → 生成回答
     ↓
  新交互 → 更新记忆 → 循环
```

---

## 🏗️ 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    OpenClaw Agent                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Memory-Master Skill                         │
├─────────────────────────────────────────────────────────┤
│  感知层 (Perception)                                     │
│  ├── auto-capture.js (自动捕捉对话)                     │
│  └── importance.js (重要性评分)                         │
├─────────────────────────────────────────────────────────┤
│  理解层 (Understanding)                                  │
│  ├── entity-extractor.js (实体提取)                     │
│  └── relation-discovery.js (关系发现)                   │
├─────────────────────────────────────────────────────────┤
│  记忆层 (Memory)                                         │
│  ├── L0: workspace/ (工作记忆) 🔜                       │
│  ├── L1: sessions/ (情景记忆) ✅                        │
│  ├── L2: topics/ (语义记忆) ✅                          │
│  ├── L3: MEMORY.md (长期洞察) ✅                        │
│  ├── L4: identity.json (人设记忆) 🔜                    │
│  └── Graph: memory-graph.json (图记忆) ✅               │
├─────────────────────────────────────────────────────────┤
│  巩固层 (Consolidation)                                  │
│  ├── memory-consolidation.js (记忆巩固)                 │
│  └── context-compaction.js (智能压缩)                   │
├─────────────────────────────────────────────────────────┤
│  检索层 (Retrieval)                                      │
│  ├── keyword-search (关键词搜索) ✅                     │
│  ├── time-search (时间查询) 🔜                          │
│  └── graph-search (图谱查询) 🔜                         │
├─────────────────────────────────────────────────────────┤
│  注入层 (Injection)                                      │
│  └── context-injection (上下文注入) ✅                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  数据存储层                               │
│  ├── ~/.openclaw/workspace/memory/                     │
│  ├── topics/*.md (主题文件)                            │
│  ├── sessions/*.md (会话记录)                          │
│  └── memory-graph.json (记忆图谱)                      │
└─────────────────────────────────────────────────────────┘
```

---

### 记忆分层设计

#### L0: 工作记忆 (Working Memory) 🔜

**用途**: 当前任务的临时状态
**生命周期**: 会话结束清除
**存储位置**: `workspace/current-task.md`

```javascript
// 实现示例
class WorkingMemory {
  async set(key, value) {
    await fs.write(`workspace/${key}.md`, value);
  }
  
  async get(key) {
    return await fs.read(`workspace/${key}.md`);
  }
  
  async clear() {
    // 会话结束时清除
    await fs.empty('workspace/');
  }
}
```

---

#### L1: 情景记忆 (Episodic Memory) ✅

**用途**: 具体事件、时间、情境
**生命周期**: 永久存储
**存储位置**: `sessions/YYYY-MM-DD-XXX.md`

```javascript
// 已实现
{
  "date": "2026-04-06",
  "session": "001",
  "content": "讨论了 Memory-Master 设计",
  "keyEvents": ["数学竞赛", "测试报告"],
  "timestamp": "2026-04-06T15:00:00Z"
}
```

---

#### L2: 语义记忆 (Semantic Memory) ✅

**用途**: 通用知识、主题分类
**生命周期**: 永久存储
**存储位置**: `topics/*.md`

```javascript
// 已实现
topics/
├── projects.md      # 项目知识
├── tasks.md         # 任务知识
├── preferences.md   # 用户偏好
└── decisions.md     # 决策知识
```

---

#### L3: 长期洞察 (Long-term Insights) ✅

**用途**: 深度复盘结果、洞察
**生命周期**: 永久存储
**存储位置**: `MEMORY.md`

```javascript
// 已实现
## 当前记忆

### 项目进展
- Memory-Master v2.0 已完成
- 参考了 12 篇行业最佳实践

### 用户偏好
- 喜欢简洁的回答
- 重视系统设计
```

---

#### L4: 人设记忆 (Persona Memory) 🔜

**用途**: 用户特征、习惯、性格
**生命周期**: 永久存储，可演化
**存储位置**: `identity.json`

```json
{
  "name": "Jake",
  "age": 12,
  "preferences": {
    "response_style": "简洁",
    "emoji_usage": "适度"
  },
  "habits": [
    "晚上学习",
    "喜欢技术"
  ],
  "personality": {
    "type": "技术型",
    "traits": ["创造力", "耐心"]
  }
}
```

---

#### Graph: 图记忆 (Graph Memory) ✅

**用途**: 实体关系、知识图谱
**生命周期**: 永久存储，动态演化
**存储位置**: `memory-graph.json`

```json
{
  "nodes": [
    { "id": "person-jake", "type": "person", "name": "Jake" },
    { "id": "project-memory-master", "type": "project" }
  ],
  "edges": [
    { "from": "person-jake", "to": "project-memory-master", "relation": "created" }
  ]
}
```

---

## 🔧 功能模块

### 1. 自动记忆捕捉 (auto-capture)

**状态**: ✅ 已实现

**功能**:
- 监控对话历史
- 重要性评分（阈值 40 分）
- 自动写入记忆文件

**代码位置**: `auto-capture.js`

---

### 2. 重要性评分 (importance-scoring)

**状态**: ✅ 已实现

**评分维度**:
- 关键词匹配 (+10 分/个，上限 30)
- 用户明确指令 (+30 分)
- 包含日期/URL/数字 (+5-8 分)
- 总结性语句 (+20 分)
- 代码内容 (+15 分)
- 人名/称呼 (+8 分)
- 消息长度 (+5-10 分)

**阈值**: ≥40 分 → 写入记忆

**代码位置**: `utils/importance.js`

---

### 3. 实体提取 (entity-extraction)

**状态**: ✅ 已实现

**实体类型**:
- person (人名)
- project (项目)
- event (事件)
- task (任务)
- file (文件)
- date (日期)
- url (链接)

**代码位置**: `utils/entity-extractor-v3.js`

---

### 4. 记忆巩固 (memory-consolidation)

**状态**: ✅ 已实现

**流程**:
1. 读取所有记忆
2. 合并相似记忆
3. 移除矛盾信息
4. 提取洞察
5. 更新记忆图谱
6. 写入主题文件

**代码位置**: `memory-consolidation.js`

---

### 5. 智能压缩 (context-compaction)

**状态**: ✅ 已实现

**5 阶段管道**:
1. removeDuplicates (去重)
2. extractKeyPoints (提取关键点)
3. summarizeLongThreads (总结长对话)
4. pruneOldMemories (删除旧记忆)
5. consolidateInsights (整合洞察)

**压缩率**: 47-60%

**代码位置**: `context-compaction.js`

---

### 6. 记忆检索 (memory-retrieval)

**状态**: ⚠️ 基础实现

**当前实现**:
- ✅ 关键词搜索 (BM25)
- 🔜 时间查询 (时间树)
- 🔜 图谱查询 (关系遍历)
- 🔜 意图感知检索

**代码位置**: `memory-retrieval.js` (待创建)

---

### 7. 上下文注入 (context-injection)

**状态**: ✅ 已实现

**流程**:
1. 接收用户查询
2. 检索相关记忆
3. 注入到系统提示
4. 生成回答

**代码位置**: OpenClaw Skill 主入口

---

## 🚀 v3.0 改进计划

### 优先级 1 (本周)

#### 1.1 实现工作记忆 (workspace/)

**需求**:
- 存储当前任务状态
- 会话结束自动清除
- 支持快速读写

**实现**:
```javascript
// 创建 workspace/ 目录
mkdir -p memory/workspace

// 实现 WorkingMemory 类
class WorkingMemory {
  async set(key, value) { ... }
  async get(key) { ... }
  async clear() { ... }
}
```

**工作量**: 2 小时

---

#### 1.2 实现人设记忆 (identity.json)

**需求**:
- 存储用户特征
- 支持演化更新
- 跨会话持久化

**实现**:
```json
{
  "name": "Jake",
  "preferences": {...},
  "habits": [...],
  "personality": {...}
}
```

**工作量**: 2 小时

---

#### 1.3 实现程序记忆 (hooks/)

**需求**:
- 存储操作流程
- "如何做"的知识
- 可复用技能

**实现**:
```
memory/hooks/
├── how-to-install-skill.md
├── how-to-deploy.md
└── best-practices.md
```

**工作量**: 2 小时

---

### 优先级 2 (下周)

#### 2.1 实现时间树结构

**需求**:
- 支持自然时间查询
- 自动聚合（日→周→月）
- 快速时间导航

**实现**:
```javascript
class TemporalMemoryTree {
  async queryByTime(range) {
    // "上周"、"这个月"、"昨天"
  }
  
  async autoAggregate() {
    // 日→周→月→年
  }
}
```

**工作量**: 4 小时

---

#### 2.2 实现参与者分离

**需求**:
- 按用户分离存储
- 支持多用户场景
- 隐私隔离

**实现**:
```
memory/
├── users/
│   └── jake/
├── assistants/
│   └── xiaogui/
└── shared/
```

**工作量**: 3 小时

---

#### 2.3 实现智能检索

**需求**:
- 意图感知检索
- 混合检索（关键词 + 图谱）
- 复杂度感知

**实现**:
```javascript
async function intelligentRecall(query) {
  const intent = parseIntent(query);
  const complexity = estimateComplexity(query);
  
  switch (intent) {
    case 'factual': return factualSearch(query);
    case 'temporal': return timeSearch(query);
    case 'relational': return graphSearch(query);
  }
}
```

**工作量**: 4 小时

---

### 优先级 3 (下下周)

#### 3.1 建立评估基准

**需求**:
- 事实回忆测试
- 时间推理测试
- 用户偏好测试
- 压缩质量验证

**实现**:
```yaml
# benchmark.yaml
tests:
  factual_recall:
    - query: "我下周要参加什么？"
      expected: "数学竞赛"
  temporal_reasoning:
    - query: "昨天讨论了什么？"
      expected: "Memory-Master"
```

**工作量**: 3 小时

---

#### 3.2 实现压缩质量验证

**需求**:
- 验证压缩后信息保留率
- 二次探针验证
- 低于阈值重新压缩

**实现**:
```javascript
async function validateCompression(original, compressed) {
  const questions = generateQuestions(original);
  const originalAnswers = await answer(original, questions);
  const compressedAnswers = await answer(compressed, questions);
  
  const retentionRate = calculateSimilarity(
    originalAnswers,
    compressedAnswers
  );
  
  return retentionRate > 0.9;
}
```

**工作量**: 3 小时

---

#### 3.3 实现多智能体协作

**需求**:
- 记忆代理（写入/更新）
- 研究代理（搜集/反思）
- 工作代理（生成回答）

**实现**:
```javascript
class MemoryAgents {
  async process(query) {
    const evidence = await this.researchAgent.search(query);
    const answer = await this.workerAgent.generate(query, evidence);
    await this.memoryAgent.save(query, answer, evidence);
    return answer;
  }
}
```

**工作量**: 6 小时

---

## 📅 实施路线图

### Phase 1: v2.5 (本周)
- [ ] 实现工作记忆
- [ ] 实现人设记忆
- [ ] 实现程序记忆
- [ ] 测试当前版本

**里程碑**: 完成 4 类记忆模型

---

### Phase 2: v2.7 (下周)
- [ ] 实现时间树结构
- [ ] 实现参与者分离
- [ ] 实现智能检索
- [ ] 建立评估基准

**里程碑**: 检索能力提升 50%

---

### Phase 3: v3.0 (下下周)
- [ ] 实现压缩质量验证
- [ ] 实现多智能体协作
- [ ] 完成文档完善
- [ ] 发布到 ClawHub

**里程碑**: 发布 v3.0 正式版

---

## 📊 评估体系

### 评估维度（参考笔记 9）

| 维度 | 评估项 | 目标值 |
|------|--------|--------|
| **事实回忆** | 准确回忆用户信息 | >95% |
| **时间推理** | 正确回答时间相关问题 | >90% |
| **用户偏好** | 准确识别用户偏好 | >95% |
| **压缩质量** | 信息保留率 | >90% |
| **检索速度** | 平均响应时间 | <100ms |
| **Token 效率** | 相比全量存储节省 | >70% |

---

### 基准测试集

```yaml
# benchmark.yaml
factual_recall:
  - query: "我下周要参加什么？"
    expected: "数学竞赛"
  - query: "我的待办有哪些？"
    expected: "完成测试报告"

temporal_reasoning:
  - query: "昨天讨论了什么项目？"
    expected: "Memory-Master"
  - query: "上周做了什么决定？"
    expected: "采用三层架构"

user_preferences:
  - query: "我喜欢什么样的回答？"
    expected: "简洁"
  - query: "我的习惯是什么？"
    expected: "晚上学习"

compression_quality:
  - original: "50 轮对话"
    compressed: "5 个关键点 + 1 个洞察"
    retention_rate: >0.9
```

---

## 🎯 成功标准

### v2.5 成功标准
- ✅ 实现工作记忆、人设记忆、程序记忆
- ✅ 4 类记忆模型完整
- ✅ 测试通过率 >90%

### v2.7 成功标准
- ✅ 时间查询准确率 >90%
- ✅ 检索速度 <100ms
- ✅ 多用户支持

### v3.0 成功标准
- ✅ 压缩质量 >90% 保留率
- ✅ 发布到 ClawHub
- ✅ 社区用户 >10 人

---

## 📚 参考文档

### 已创建的文档
- `SERVER_IMPLEMENTATION.md` (26 KB) - 服务端实现方案
- `OPENVIKING_DEEP_ANALYSIS.md` (16 KB) - OpenViking 深度分析
- `GITHUB_MEMORY_FRAMEWORKS.md` (6.7 KB) - GitHub 框架调研
- `COMPREHENSIVE_REFERENCE_REPORT.md` (8.0 KB) - 综合参考报告
- `TEST_RECORD.md` (2.0 KB) - 测试记录

### 外部参考
- arXiv:2601.02845 (TiMem)
- arXiv:2603.16496 (AdaMem)
- LoCoMo Benchmark
- PERSONAMEM Benchmark

---

## 🎊 总结

**Memory-Master v3.0** 综合了 12 篇行业最佳实践笔记，涵盖了：
- ✅ 学术前沿（TiMem、AdaMem、Memoria）
- ✅ 工程实践（6 个 Agent 对比、15+ 开源项目）
- ✅ 产品视角（企业级架构、PDCA 全链路）
- ✅ 开发者视角（实战分享、复盘理念）

**核心优势**:
- ✅ Agentic Memory 范式（超越 RAG）
- ✅ 5 阶段智能压缩（行业领先）
- ✅ 全流程渗透（PDCA 全链路）
- ✅ 本地优先（隐私安全）

**待完善**:
- 🔜 工作记忆 + 人设记忆 + 程序记忆
- 🔜 时间树结构 + 智能检索
- 🔜 评估基准 + 质量验证

---

*设计完成时间：2026-04-06 19:35*  
*作者：小鬼 👻 × Jake*  
*版本：v3.0-design*
