# Hermes Agent 记忆系统深度分析报告

**研究日期**: 2026-04-11  
**研究员**: 小鬼 👻  
**目标**: 深入研究 Hermes Agent 记忆系统，为 Memory-Master v4.2.0 提供架构参考

---

## 📊 项目概览

| 指标 | 数据 |
|------|------|
| **项目名称** | Hermes Agent |
| **开发者** | Nous Research |
| **GitHub Stars** | 15,767 ⭐ |
| **License** | MIT |
| **当前版本** | v0.8.0 |
| **最后更新** | 2026-04-10 |
| **语言** | Python |
| **核心口号** | "The agent that grows with you" |

---

## 🧠 四层记忆系统架构

Hermes 采用**四层记忆模型**，每层负责不同的记忆类型：

```
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Honcho User Modeling (理解引擎)                │
│  - Dialectic reasoning (辩证推理)                        │
│  - User preferences, habits, goals                      │
│  - Peer cards (多 Agent 场景)                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Skills (程序记忆)                              │
│  - Auto-generated SKILL.md files                        │
│  - Procedural memory: "how to do things"                │
│  - Slash commands: /skill-name                          │
│  - Self-improvement during use                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Session Archive (情景记忆/冷回忆)               │
│  - SQLite + FTS5 full-text search                       │
│  - All CLI and messaging sessions                       │
│  - Explicit retrieval via session_search tool           │
│  - LLM summarization before injection                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Prompt Memory (工作记忆/热记忆)                 │
│  - MEMORY.md (语义记忆)                                  │
│  - USER.md (用户模型)                                    │
│  - Always-on, loaded without agent decision             │
│  - 3,575 character limit (force curation)               │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ 核心存储架构：SQLite + FTS5

### 数据库位置
```
~/.hermes/state.db (SQLite, WAL mode)
```

### Schema 设计

```sql
-- Sessions 表：会话元数据
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,          -- cli, telegram, discord, etc.
    started_at INTEGER NOT NULL,
    finished_at INTEGER,
    parent_session_id TEXT,        -- Lineage tracking
    title TEXT,                    -- Unique (NULLs allowed)
    token_count INTEGER,
    cache_read_tokens INTEGER,
    cache_write_tokens INTEGER,
    reasoning_tokens INTEGER,
    estimated_cost_usd REAL,
    actual_cost_usd REAL,
    cost_status TEXT,
    cost_source TEXT,
    pricing_version INTEGER,
    billing_provider TEXT,
    billing_base_url TEXT,
    billing_mode TEXT
);

-- Messages 表：完整消息历史
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,            -- user, assistant, system
    content TEXT,
    timestamp INTEGER NOT NULL,
    finish_reason TEXT,
    reasoning TEXT,                -- Reasoning details
    reasoning_details TEXT,
    codex_reasoning_items TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- FTS5 虚拟表：全文搜索索引
CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
    content,
    session_id,
    role,
    timestamp
);

-- Schema 版本追踪
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY
);
```

### Schema 演进历史

| Version | 变更内容 |
|---------|----------|
| 1 | Initial schema (sessions, messages, FTS5) |
| 2 | Add `finish_reason` column to messages |
| 3 | Add `title` column to sessions |
| 4 | Add unique index on `title` (NULLs allowed) |
| 5 | Add billing columns (11 columns for cost tracking) |
| 6 | Add reasoning columns to messages |

### 索引设计

```sql
-- 父会话索引 (Lineage 追踪)
CREATE INDEX IF NOT EXISTS idx_sessions_parent ON sessions(parent_session_id);

-- 会话标题唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_title_unique ON sessions(title);

-- 消息会话索引
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, timestamp);

-- 消息时间戳索引
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
```

---

## 🔍 FTS5 搜索系统

### 搜索能力

```python
# 基础搜索
results = db.search_messages("docker build error")

# 按来源过滤
results = db.search_messages("error", source_filter=["cli"])
results = db.search_messages("bug", exclude_sources=["telegram", "discord"])

# 按角色过滤
results = db.search_messages("help", role_filter=["user"])

# 组合过滤
results = db.search_messages(
    "authentication",
    source_filter=["cli", "discord"],
    role_filter=["user", "assistant"]
)
```

### 搜索结果格式

每个结果包含：
- `id`: 消息 ID
- `session_id`: 所属会话 ID
- `role`: 角色 (user/assistant/system)
- `timestamp`: 时间戳
- `snippet`: 匹配片段
- `match`: 高亮标记 (>>>match<<<)
- `context`: 上下文窗口
- `source`: 来源平台
- `model`: 使用的模型
- `session_started`: 会话开始时间

### FTS5 查询语法

```sql
-- 精确匹配
"docker build"

-- AND 搜索
docker AND build

-- OR 搜索
docker OR kubernetes

-- 排除
docker -compose

-- 前缀匹配
build*

-- NEAR 搜索 (临近词)
NEAR(docker build, 5)
```

### 查询清理

`_sanitize_fts5_query()` 方法处理边缘情况：
- 移除未闭合的引号
- 处理孤立的 AND/OR/NOT
- 转义特殊字符
- 示例：`"chat-send` → `chat-send`

---

## 🔗 Lineage (谱系追踪)

### 设计原理

当上下文压缩触发会话分割时，Hermes 通过 `parent_session_id` 创建会话链：

```
Session A (原始会话)
    ↓ (压缩触发)
Session B (parent_session_id = A)
    ↓ (继续压缩)
Session C (parent_session_id = B)
```

### Lineage 查询

```python
# 获取完整谱系
lineage = db.get_lineage(session_id)

# SQL 查询
SELECT * FROM sessions WHERE id = ?
SELECT s.* FROM sessions s
JOIN messages m ON m.session_id = s.id
WHERE m.session_id = ?
ORDER BY m.timestamp DESC
```

### 关键特性

- ✅ **可追溯性**: 即使压缩后也能追溯到原始上下文
- ✅ **完整性**: 保留参考链，不丢失信息
- ✅ **可恢复性**: 需要时可以重建完整对话历史

---

## 🗜️ 压缩系统 (Compression as Consolidation)

### 触发机制

```
预检检查 → 检测到长对话 → 触发 Sentinel → 压缩
(在达到硬限制之前触发)
```

### 压缩流程

```
1. 辅助模型扫描完整对话
2. 提取值得保留的内容 (3,575 字符限制内)
3. 总结中间轮次 (而非丢弃)
4. 保存摘要到 MEMORY.md / USER.md
5. 创建新会话 (parent_session_id 指向原会话)
6. 保留 Lineage 追踪
```

### 结构化摘要模板

Hermes 不使用简单的"总结这个"，而是使用**结构化模板**：

```markdown
## 关键决策
- 决策 1: ...
- 决策 2: ...

## 未完成事项
- 任务 1: ...
- 任务 2: ...

## 技术细节
- 配置: ...
- 依赖: ...

## 下一步行动
1. ...
2. ...
```

### 迭代更新

**杀手级特性**: 压缩器存储之前的摘要，后续压缩时**更新**而非重新开始：

```
压缩 1 → 摘要 A
压缩 2 → 摘要 A + B (累积)
压缩 3 → 摘要 A + B + C (继续累积)
```

**结果**: Hermes 可以在 100K 上下文窗口内保持连贯的 2 小时编码会话！

---

## 📚 Skills 系统 (程序记忆)

### 技能创建触发条件

当 Hermes 完成复杂任务时：
- 5+ 工具调用
- 棘手的调试
- 新颖的工作流程

系统提示**主动鼓励**保存为技能。

### SKILL.md 结构

```markdown
---
name: docker-compose-setup
description: Set up Docker Compose for a new project
version: 1.0.0
trigger: /docker-compose-setup
---

# 技能内容

## 步骤
1. ...
2. ...

## 工具
- docker
- compose
- ...
```

### 技能特性

- ✅ **自动注册为斜杠命令**: `/docker-compose-setup`
- ✅ **按需加载**: 只在调用时加载到上下文
- ✅ **自进化**: 使用过程中自我改进
- ✅ **版本控制**: 支持版本迭代

---

## 🎯 Honcho 用户建模 (第四层)

### 什么是 Honcho

[Honcho](https://github.com/plastic-labs/honcho) 是一个 AI 原生记忆后端，在 Hermes 内置记忆系统之上添加**辩证推理**和**深度用户建模**。

### 核心能力

#### 1. Dialectic Reasoning (辩证推理)

每次对话后，Honcho 分析交流并推导"结论"：
- 用户偏好
- 习惯
- 目标

#### 2. Peer Cards (对等卡片)

多 Agent 场景中，用户和 AI 都有 Honcho 中的对等表示：
```
User Peer Card:
- 姓名、角色
- 偏好、习惯
- 项目、目标

AI Peer Card:
- 能力、限制
- 工作风格
- 历史交互
```

#### 3. 四种 Honcho 工具

Hermes 向 Agent 暴露四个 Honcho 工具：
1. `honcho_create_session` - 创建新会话
2. `honcho_add_observation` - 添加观察
3. `honcho_get_session` - 获取会话
4. `honcho_list_sessions` - 列出会话

### 配置示例

```yaml
# ~/.hermes/config.yaml
memory:
  provider: honcho
  honcho_base_url: http://localhost:8000

honcho:
  observation: directional  # "unified" 或 "directional"
```

### 工作模式

| 模式 | 描述 |
|------|------|
| **unified** | 统一观察，适合单 Agent |
| **directional** | 定向观察，适合多 Agent |

---

## 🔄 封闭学习循环 (Closed Learning Loop)

Hermes 的核心创新是**封闭学习循环**：

```
┌──────────────────────────────────────────────────────────┐
│                    封闭学习循环                           │
│                                                          │
│  1. Agent-curated memory                                │
│     ↓ (定期提示)                                          │
│  2. Periodic nudges (反思提示)                           │
│     ↓                                                    │
│  3. Autonomous skill creation                            │
│     ↓ (使用中改进)                                        │
│  4. Skill self-improvement during use                   │
│     ↓                                                    │
│  5. FTS5 cross-session recall                           │
│     ↓ (LLM 总结)                                           │
│  6. LLM summarization                                   │
│     ↓                                                    │
│  7. Honcho dialectic user modeling                      │
│     └──────────────→ (回到 1)                            │
└──────────────────────────────────────────────────────────┘
```

### 关键组件

1. **Agent-curated memory**: Agent 主动判断什么值得保存
2. **Periodic nudges**: 定期提示 Agent 反思和保存
3. **Autonomous skill creation**: 自动创建技能
4. **Skill self-improvement**: 使用中改进技能
5. **FTS5 cross-session recall**: 跨会话检索
6. **LLM summarization**: LLM 总结检索结果
7. **Honcho dialectic user modeling**: 辩证用户建模

---

## 🏗️ 架构对比：Hermes vs Memory-Master

### 相似之处

| 特性 | Hermes | Memory-Master |
|------|--------|---------------|
| **分层记忆** | 4 层 (Prompt/Session/Skills/Honcho) | 4 类 (情景/语义/程序/人设) |
| **SQLite 存储** | ✅ state.db | ✅ memory.db |
| **全文搜索** | ✅ FTS5 | ✅ FTS5 (计划中) |
| **时间树** | ✅ parent_session_id | ✅ 时间树结构 |
| **技能系统** | ✅ SKILL.md | ✅ 程序记忆蒸馏 |
| **用户建模** | ✅ Honcho + USER.md | ✅ 人设记忆 |
| **压缩机制** | ✅ 迭代摘要 | ✅ AAAK 压缩 |

### 差异之处

| 特性 | Hermes | Memory-Master |
|------|--------|---------------|
| **向量搜索** | ❌ 仅 FTS5 | ✅ 计划中 |
| **知识图谱** | ❌ (Honcho 部分支持) | ✅ AAAK + 知识图谱 (开发中) |
| **自进化** | ✅ DSPy + GEPA | 🔧 计划中 |
| **多 Profile** | ✅ 完全隔离 | 🔧 计划中 (L0/L1/L2) |
| **多后端** | ✅ 6 种 (Local/Docker/SSH/...) | ✅ OpenClaw 原生 |
| **平台集成** | ✅ 15+ 平台 | ✅ OpenClaw 通道 |

---

## 💡 对 Memory-Master v4.2.0 的启发

### 1. 迭代压缩 (立即采用) ⭐⭐⭐

**Hermes 做法**: 压缩器存储之前的摘要，后续压缩时更新而非重新开始。

**Memory-Master 实现**:
```python
class AAAKCompressor:
    def compress(self, new_content, previous_summary=None):
        if previous_summary:
            # 更新模式：累积摘要
            prompt = f"""
            之前的摘要:
            {previous_summary}
            
            新内容:
            {new_content}
            
            请更新摘要，保持累积性...
            """
        else:
            # 初始模式：创建摘要
            prompt = f"""
            请总结以下内容...
            {new_content}
            """
        
        return self.llm.summarize(prompt)
```

**收益**: 
- ✅ 信息不丢失
- ✅ 上下文连贯性
- ✅ 支持超长会话

---

### 2. Lineage 追踪 (高优先级) ⭐⭐⭐

**Hermes 做法**: `parent_session_id` 创建会话链，保留参考链。

**Memory-Master 实现**:
```sql
ALTER TABLE memories ADD COLUMN parent_memory_id TEXT;
ALTER TABLE memories ADD COLUMN compression_chain TEXT;

CREATE INDEX idx_parent_memory ON memories(parent_memory_id);
```

**Schema 更新**:
```python
class Memory:
    id: str
    parent_memory_id: Optional[str]  # 父记忆 (压缩前)
    compression_chain: List[str]     # 完整压缩链
    is_compressed: bool
    original_size: int
    compressed_size: int
```

**收益**:
- ✅ 可追溯性
- ✅ 可恢复性
- ✅ 调试友好

---

### 3. 结构化摘要模板 (高优先级) ⭐⭐

**Hermes 做法**: 使用结构化模板而非简单"总结这个"。

**Memory-Master 实现**:
```python
COMPRESSION_TEMPLATE = """
## 关键决策
{decisions}

## 未完成事项
{pending_tasks}

## 技术细节
{technical_details}

## 下一步行动
{next_actions}

## 时间线
{timeline}
"""

def structured_compress(session_content):
    # 提取结构化信息
    decisions = extract_decisions(session_content)
    pending_tasks = extract_pending_tasks(session_content)
    technical_details = extract_technical_details(session_content)
    next_actions = extract_next_actions(session_content)
    timeline = extract_timeline(session_content)
    
    return COMPRESSION_TEMPLATE.format(
        decisions=decisions,
        pending_tasks=pending_tasks,
        technical_details=technical_details,
        next_actions=next_actions,
        timeline=timeline
    )
```

**收益**:
- ✅ 信息组织清晰
- ✅ 易于检索
- ✅ 人类可读

---

### 4. FTS5 搜索增强 (中优先级) ⭐⭐

**Hermes 做法**: 完整的 FTS5 搜索语法支持 + 过滤。

**Memory-Master 实现**:
```python
class MemorySearch:
    def search(self, query, filters=None):
        # 清理查询
        clean_query = self._sanitize_fts5_query(query)
        
        # 构建 SQL
        sql = """
        SELECT * FROM memories_fts
        WHERE content MATCH ?
        """
        params = [clean_query]
        
        # 添加过滤
        if filters:
            if 'source' in filters:
                sql += " AND source IN (?)"
                params.extend(filters['source'])
            if 'role' in filters:
                sql += " AND role IN (?)"
                params.extend(filters['role'])
            if 'time_range' in filters:
                sql += " AND timestamp BETWEEN ? AND ?"
                params.extend(filters['time_range'])
        
        return self.db.execute(sql, params)
    
    def _sanitize_fts5_query(self, query):
        # 处理边缘情况
        # - 移除未闭合引号
        # - 处理孤立 AND/OR/NOT
        # - 转义特殊字符
        pass
```

**收益**:
- ✅ 精确搜索
- ✅ 灵活过滤
- ✅ 用户友好

---

### 5. 多 Profile 隔离 (中优先级) ⭐⭐

**Hermes 做法**: 每个 Profile 是完全独立的 HERMES_HOME。

**Memory-Master 实现**:
```python
class ProfileManager:
    def __init__(self, profile_name):
        self.profile_name = profile_name
        self.home_dir = f"~/.memory-master/profiles/{profile_name}"
        self.db_path = f"{self.home_dir}/memory.db"
        self.config_path = f"{self.home_dir}/config.yaml"
    
    def create(self, clone_level="blank"):
        """
        clone_level:
        - blank: 全新配置
        - clone: 复制配置
        - clone-all: 复制一切 (包括记忆)
        """
        pass
    
    def export(self, output_path):
        """导出为 tar.gz"""
        pass
    
    def import_from(self, archive_path):
        """从 tar.gz 导入"""
        pass
```

**CLI 命令**:
```bash
memory-master profile list
memory-master profile use <name>
memory-master profile create <name> [--clone] [--clone-all]
memory-master profile delete <name>
memory-master profile export <name> backup.tar.gz
memory-master profile import backup.tar.gz
```

**收益**:
- ✅ 多项目隔离
- ✅ 备份/迁移
- ✅ 团队协作

---

### 6. 自进化技能 (长期目标) ⭐

**Hermes 做法**: DSPy + GEPA (Genetic-Pareto Prompt Evolution)。

**Memory-Master 实现** (长期计划):
```python
class SkillEvolution:
    def __init__(self):
        self.dspy_optimizer = DSPOptimizer()
        self.gepa = GeneticParetoOptimizer()
    
    def evolve(self, skill_name, usage_logs):
        # 收集使用日志
        # 评估效果
        # 生成变体
        # A/B 测试
        # 选择最优
        pass
```

**收益**:
- ✅ 自动优化
- ✅ 持续改进
- ✅ 减少人工维护

---

## 📋 Memory-Master v4.2.0 开发计划

基于 Hermes 分析，更新开发计划：

### Phase 1: 核心增强 (v4.2.0)

- [x] **迭代压缩**: 支持累积摘要
- [x] **Lineage 追踪**: parent_memory_id + compression_chain
- [x] **结构化摘要模板**: 决策/任务/时间线
- [ ] **FTS5 搜索增强**: 过滤 + 语法支持
- [ ] **Schema 迁移**: 版本化管理

### Phase 2: 高级功能 (v4.3.0)

- [ ] **多 Profile 隔离**: 完整隔离 + 克隆 + 导出/导入
- [ ] **CLI 增强**: profile 管理命令
- [ ] **备份系统**: tar.gz 归档
- [ ] **成本追踪**: token 计数 + 费用估算

### Phase 3: 自进化 (v5.0.0)

- [ ] **DSPy 集成**: 优化压缩策略
- [ ] **GEPA 集成**: 技能进化
- [ ] **A/B 测试框架**: 效果评估
- [ ] **自动部署**: 最优策略自动上线

---

## 🎯 关键洞察

### 1. "Files are all you need" 的真相

Hermes 表面是"基于文件"，实际是**混合架构**：
- 热记忆：MEMORY.md + USER.md (文件)
- 冷记忆：SQLite + FTS5 (数据库)
- 程序记忆：SKILL.md (文件)
- 用户建模：Honcho (外部服务)

**启示**: Memory-Master 也应采用混合架构，而非纯文件或纯数据库。

### 2. 压缩不是丢弃，是巩固

Hermes 的压缩哲学：
> "Compression as Consolidation"

不是丢弃旧内容，而是**提炼精华**并**累积**。

**启示**: AAAK 压缩应采用迭代更新模式。

### 3. 分离关注点

Hermes 明确分离：
- 情景记忆 (Session Archive): "发生了什么"
- 程序记忆 (Skills): "如何做"
- 语义记忆 (Prompt Memory): "知道什么"
- 用户模型 (Honcho): "是谁"

**启示**: Memory-Master 的 4 类记忆模型是正确的！

### 4. 显式 vs 隐式检索

- **Prompt Memory**: Always-on (隐式加载)
- **Session Archive**: Explicit retrieval (显式调用)

**启示**: Memory-Master 应区分自动加载和按需检索。

### 5. SQLite + FTS5 被低估

Hermes 证明：
> "For personal or small-team agents, you don't need Pinecone or Weaviate. SQLite with FTS5 gives you persistent storage, full-text search, and ACID transactions with zero infrastructure."

**启示**: Memory-Master 可以继续使用 SQLite + FTS5 作为基础，向量搜索作为可选增强。

---

## 🔗 参考资源

- **Hermes Agent GitHub**: https://github.com/NousResearch/hermes-agent
- **官方文档**: https://hermes-agent.nousresearch.com/docs
- **Session Storage**: https://hermes-agent.nousresearch.com/docs/developer-guide/session-storage/
- **Honcho Memory**: https://hermes-agent.nousresearch.com/docs/user-guide/features/honcho
- **Inside Hermes Agent**: https://mranand.substack.com/p/inside-hermes-agent-how-a-self-improving
- **Memory Explained**: https://vectorize.io/articles/hermes-agent-memory-explained
- **Context Window Solution**: https://medium.com/@maclarensg_50191/how-hermes-agent-solves-the-context-window-problem

---

## 📝 结论

Hermes Agent 是一个**成熟的、生产就绪的**自进化 Agent 系统，其记忆系统设计有以下核心优势：

1. ✅ **分层清晰**: 4 层记忆各司其职
2. ✅ **存储高效**: SQLite + FTS5 零基础设施
3. ✅ **可追溯**: Lineage 追踪保证信息不丢失
4. ✅ **可进化**: 技能系统 + Honcho 自进化
5. ✅ **可扩展**: 多 Profile + 多后端

**Memory-Master 应借鉴**:
- 迭代压缩 (立即采用)
- Lineage 追踪 (高优先级)
- 结构化摘要 (高优先级)
- FTS5 增强 (中优先级)
- 多 Profile (中优先级)
- 自进化 (长期目标)

**Memory-Master 应保持**:
- 4 类记忆模型 (与 Hermes 一致，证明正确)
- 时间树结构 (优于 Hermes 的扁平会话)
- AAAK 压缩 (有潜力超越 Hermes)
- 知识图谱 (Hermes 缺失的能力)
- OpenClaw 原生集成 (差异化优势)

---

**下一步行动**:
1. 实现迭代压缩 (v4.2.0)
2. 添加 Lineage 追踪 (v4.2.0)
3. 设计结构化摘要模板 (v4.2.0)
4. 增强 FTS5 搜索 (v4.2.0)
5. 规划多 Profile 架构 (v4.3.0)

**研究完成时间**: 2026-04-11 14:30  
**研究员**: 小鬼 👻
