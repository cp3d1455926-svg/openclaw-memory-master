# 🔍 OpenViking 深度分析报告

**调研时间**: 2026-04-06 15:55  
**来源**: GitHub + Mintlify 文档 + RFC 讨论  
**分析维度**: YAML 配置、ReAct 编排、存储架构

---

## 📊 第一部分：项目概况

### 基本信息

| 属性 | 值 |
|------|-----|
| **项目名** | OpenViking |
| **开发者** | 火山引擎（Volcengine，字节跳动云） |
| **定位** | AI Agent 的上下文数据库 |
| **Slogan** | "Giving your AI agents a filesystem for a brain" |
| **GitHub** | https://github.com/volcengine/OpenViking |
| **状态** | 活跃开发中（上周有更新） |

---

### 核心特性

根据 GitHub 和文档：

1. **统一文件系统管理** - 碎片化 Agent 数据的统一管理
2. **分层上下文加载** - 显著减少 token 成本
3. **YAML 可配置记忆类型** - 8 种内置类型
4. **ReAct 3+1 阶段流程** - 智能编排
5. **增量更新** - Patch Handler 支持
6. **语义搜索** - 向量索引 + AGFS 按需加载

---

## 📊 第二部分：存储架构

### 架构概览（来自 Mintlify 文档）

```
┌─────────────────────────────────────────┐
│           VikingFS (虚拟文件系统)         │
├─────────────────────────────────────────┤
│  AGFS (Agent Filesystem)                │
│  - 内容存储                              │
│  - URI 抽象                              │
│                                          │
│  Vector Index (向量索引)                 │
│  - 语义搜索                              │
│  - 元数据过滤                            │
└─────────────────────────────────────────┘
```

---

### VikingFS 类设计（Python 代码）

```python
from openviking.storage.viking_fs import VikingFS

class VikingFS:
    """Virtual filesystem with URI abstraction."""
    
    def __init__(self, agfs, vector_index):
        self.agfs = agfs          # 内容存储
        self.vector_index = vector_index  # 语义索引
    
    async def read(self, uri: str) -> str:
        """Read file content from AGFS."""
        return await self.agfs.read_file(uri)
    
    async def write(self, uri: str, data: str):
        """Write file to AGFS."""
        await self.agfs.write_file(uri, data)
    
    async def abstract(self, uri: str) -> str:
        """Read L0 abstract (摘要层)."""
        return await self.agfs.read_file(
            f"{uri.rstrip('/')}/.abstract.md"
        )
    
    async def overview(self, uri: str) -> str:
        """Read L1 overview (概览层)."""
        return await self.agfs.read_file(
            f"{uri.rstrip('/')}/.overview.md"
        )
    
    async def find(self, query: str, target_uri: str = None):
        """Semantic search using vector index."""
        # 向量搜索返回 URI + 元数据
        results = await self.vector_index.search(
            query=query,
            filter={"parent_uri": target_uri} if target_uri else None
        )
        # 内容按需从 AGFS 加载
        return results
```

---

### 分层存储（L0/L1/L2）

```
目录结构示例:
viking://resources/
├── .abstract.md          # L0: 摘要（自动生成）
├── .overview.md          # L1: 概览（自动生成）
├── authentication.md     # L2: 完整内容
├── authorization.md      # L2: 完整内容
└── projects/
    └── project-a.md      # L2: 完整内容
```

**加载策略**:
1. 先读 `.abstract.md` (L0) - 快速浏览
2. 需要时读 `.overview.md` (L1) - 详细信息
3. 必要时读完整内容 (L2) - 完整上下文

**优势**:
- ✅ 减少 token 消耗（只加载需要的层级）
- ✅ 快速检索（摘要层很小）
- ✅ 按需加载（避免全量读取）

**Memory-Master 可借鉴**:
- 🔜 创建 `.abstract.md` 自动生成
- 🔜 创建 `.overview.md` 自动总结
- 🔜 实现分层加载策略

---

## 📊 第三部分：YAML 记忆类型配置

### MemoryTypeRegistry（8 种内置类型）

根据 GitHub PR #1045:

```yaml
# memory-types.yaml
memory_types:
  # 1. 卡片记忆
  - name: card
    schema:
      type: object
      properties:
        title: { type: string }
        content: { type: string }
        tags: { type: array, items: string }
        priority: { type: integer, enum: [1, 2, 3] }
    
  # 2. 事件记忆
  - name: event
    schema:
      type: object
      properties:
        timestamp: { type: string, format: date-time }
        description: { type: string }
        participants: { type: array, items: string }
        outcome: { type: string }
    
  # 3. 实体记忆
  - name: entity
    schema:
      type: object
      properties:
        name: { type: string }
        type: { type: string }
        attributes: { type: object }
        relations: { type: array }
    
  # 4. 偏好记忆
  - name: preference
    schema:
      type: object
      properties:
        user_id: { type: string }
        category: { type: string }
        value: { type: string }
        confidence: { type: number }
    
  # 5. 技能记忆
  - name: skill
    schema:
      type: object
      properties:
        name: { type: string }
        description: { type: string }
        parameters: { type: array }
        examples: { type: array }
    
  # 6. 工具记忆
  - name: tool
    schema:
      type: object
      properties:
        name: { type: string }
        endpoint: { type: string }
        method: { type: string }
        schema: { type: object }
    
  # 7. 对话记忆
  - name: conversation
    schema:
      type: object
      properties:
        session_id: { type: string }
        messages: { type: array }
        summary: { type: string }
    
  # 8. 任务记忆
  - name: task
    schema:
      type: object
      properties:
        title: { type: string }
        status: { type: string, enum: [pending, in_progress, done] }
        deadline: { type: string, format: date }
        dependencies: { type: array }
```

---

### 自定义记忆类型（Issue #578）

```yaml
# 用户自定义类型
custom_types:
  - name: meeting_note
    schema:
      type: object
      properties:
        meeting_id: { type: string }
        date: { type: string }
        attendees: { type: array }
        agenda: { type: array }
        decisions: { type: array }
        action_items: { type: array }
    prompt_template: |
      请提取以下会议笔记的关键信息：
      - 会议 ID: {{meeting_id}}
      - 日期：{{date}}
      - 参会者：{{attendees}}
      - 议程：{{agenda}}
      - 决策：{{decisions}}
      - 待办：{{action_items}}
```

**Memory-Master 可借鉴**:
- 🔜 创建 `memory-types.yaml` 配置文件
- 🔜 支持 8 种内置类型
- 🔜 支持用户自定义类型
- 🔜 YAML Schema 驱动

---

## 📊 第四部分：ReAct 3+1 阶段流程

### ReAct 编排器架构

```
┌─────────────────────────────────────────┐
│       MemoryReAct Orchestrator          │
├─────────────────────────────────────────┤
│  Phase 1: Pre-fetch Optimization        │
│  Phase 2: Tool Use (read/find/ls)       │
│  Phase 3: Schema-driven Operations      │
│  +1:    Merge Operations                │
└─────────────────────────────────────────┘
```

---

### Phase 1: 预取优化（Pre-fetch）

```python
async def pre_fetch_optimization(context_uri):
    """预取优化：减少后续搜索次数"""
    
    # 1. ls directories - 列出目录结构
    directories = await viking_fs.ls(context_uri)
    
    # 2. read .abstract.md - 读取摘要
    abstracts = []
    for dir in directories:
        abstract = await viking_fs.abstract(dir)
        abstracts.append(abstract)
    
    # 3. read .overview.md - 读取概览
    overviews = []
    for dir in directories:
        overview = await viking_fs.overview(dir)
        overviews.append(overview)
    
    # 4. search once - 只搜索一次
    search_results = await viking_fs.find(
        query=current_query,
        target_uri=context_uri
    )
    
    return {
        'directories': directories,
        'abstracts': abstracts,
        'overviews': overviews,
        'search_results': search_results
    }
```

**优势**:
- ✅ 批量预取（减少 I/O 次数）
- ✅ 只搜索一次（避免重复查询）
- ✅ 分层加载（先摘要后全文）

---

### Phase 2: 工具使用（Tool Use）

```python
class MemoryReAct:
    """ReAct-style 记忆编排器"""
    
    def __init__(self, viking_fs):
        self.vfs = viking_fs
        self.tools = {
            'read': self.read,
            'find': self.find,
            'ls': self.ls,
            'write_uris': self.write_uris,
            'edit_uris': self.edit_uris,
            'delete_uris': self.delete_uris
        }
    
    async def read(self, uri: str) -> str:
        """读取文件内容"""
        return await self.vfs.read(uri)
    
    async def find(self, query: str, target_uri: str = None):
        """语义搜索"""
        return await self.vfs.find(query, target_uri)
    
    async def ls(self, uri: str) -> list:
        """列出目录内容"""
        return await self.vfs.ls(uri)
    
    async def write_uris(self, uris: list, content: str):
        """写入多个 URI"""
        for uri in uris:
            await self.vfs.write(uri, content)
    
    async def edit_uris(self, uris: list, patch: dict):
        """编辑多个 URI（增量更新）"""
        for uri in uris:
            await self.apply_patch(uri, patch)
    
    async def delete_uris(self, uris: list):
        """删除多个 URI"""
        for uri in uris:
            await self.vfs.delete(uri)
```

---

### Phase 3: Schema 驱动操作

```python
async def schema_driven_operation(memory_type, data):
    """根据 YAML Schema 执行操作"""
    
    # 1. 加载 Schema
    schema = await MemoryTypeRegistry.get_schema(memory_type)
    
    # 2. 验证数据
    validation = validate_json_schema(data, schema)
    if not validation.valid:
        raise SchemaValidationError(validation.errors)
    
    # 3. 生成 URI
    uri = generate_uri(memory_type, data)
    
    # 4. 写入存储
    await viking_fs.write(uri, json.dumps(data))
    
    # 5. 更新索引
    await vector_index.index(uri, data)
    
    return {'uri': uri, 'status': 'success'}
```

---

### +1: 合并操作（Merge Operations）

```python
class MergeOperations:
    """合并操作：处理冲突和增量更新"""
    
    @staticmethod
    async def patch(original: str, patch: dict) -> str:
        """应用补丁（SEARCH/REPLACE 格式）"""
        # RoocodePatch SEARCH/REPLACE 格式
        for change in patch['changes']:
            original = original.replace(
                change['search'],
                change['replace']
            )
        return original
    
    @staticmethod
    async def sum(values: list) -> any:
        """求和合并（数值类型）"""
        return sum(values)
    
    @staticmethod
    async def avg(values: list) -> float:
        """平均合并（数值类型）"""
        return sum(values) / len(values)
    
    @staticmethod
    async def immutable(original: str) -> str:
        """不可变合并（保留原版）"""
        return original
```

---

## 📊 第五部分：增量更新机制

### Patch Handler

```python
class MemoryPatchHandler:
    """记忆补丁处理器 - 增量更新"""
    
    async def apply(self, patch: dict):
        """应用补丁到记忆"""
        
        patch_type = patch['type']
        
        if patch_type == 'search_replace':
            return await self.search_replace(patch)
        elif patch_type == 'json_patch':
            return await self.json_patch(patch)
        elif patch_type == 'semantic_merge':
            return await self.semantic_merge(patch)
        else:
            raise ValueError(f'Unknown patch type: {patch_type}')
    
    async def search_replace(self, patch: dict):
        """SEARCH/REPLACE 格式补丁"""
        content = await self.vfs.read(patch['uri'])
        
        for change in patch['changes']:
            content = content.replace(
                change['search'],
                change['replace']
            )
        
        await self.vfs.write(patch['uri'], content)
        return {'status': 'success'}
    
    async def json_patch(self, patch: dict):
        """JSON Patch (RFC 6902)"""
        content = await self.vfs.read(patch['uri'])
        data = json.loads(content)
        
        for op in patch['operations']:
            data = apply_json_patch(data, op)
        
        await self.vfs.write(patch['uri'], json.dumps(data))
        return {'status': 'success'}
    
    async def semantic_merge(self, patch: dict):
        """语义合并（使用 LLM）"""
        original = await self.vfs.read(patch['uri'])
        
        # 使用 LLM 智能合并
        merged = await llm.merge_texts(
            original=original,
            patch=patch['content'],
            instructions=patch.get('instructions')
        )
        
        await self.vfs.write(patch['uri'], merged)
        return {'status': 'success'}
```

---

## 📊 第六部分：与 Memory-Master 对比

| 维度 | OpenViking | Memory-Master v2.0 | Memory-Master v3.0 计划 |
|------|-----------|-------------------|----------------------|
| **架构** | 服务端（Python） | 本地 Skill（Node.js） | 保持本地 + 可选服务端 |
| **存储** | AGFS + Vector Index | 三层文件系统 | 借鉴 L0/L1/L2 分层 |
| **配置** | YAML Schema | JSON 配置 | 🔜 YAML 配置 |
| **记忆类型** | 8 种内置 | 5 种 | 🔜 8+ 种 |
| **编排** | ReAct 3+1 阶段 | 简单管道 | 🔜 ReAct 编排 |
| **检索** | 向量搜索 | 文本搜索 | 🔜 混合检索 |
| **更新** | Patch Handler | 全量写入 | 🔜 增量更新 |
| **预取** | 预取优化 | 无 | 🔜 预取优化 |

---

## 📋 第七部分：Memory-Master 改进清单

### Phase 4.5: 借鉴 OpenViking 架构

#### 1. 分层存储（L0/L1/L2）

```javascript
// 创建分层存储管理器
class TieredStorage {
  async getAbstract(uri) {
    // L0: 读取 .abstract.md
    return await fs.readFile(`${uri}/.abstract.md`, 'utf8');
  }
  
  async getOverview(uri) {
    // L1: 读取 .overview.md
    return await fs.readFile(`${uri}/.overview.md`, 'utf8');
  }
  
  async getContent(uri) {
    // L2: 读取完整内容
    return await fs.readFile(`${uri}.md`, 'utf8');
  }
  
  async loadSmart(uri, tokenBudget) {
    // 智能加载：根据 token 预算决定加载层级
    const abstract = await this.getAbstract(uri);
    if (tokenBudget < 1000) return abstract;
    
    const overview = await this.getOverview(uri);
    if (tokenBudget < 5000) return overview;
    
    return await this.getContent(uri);
  }
}
```

---

#### 2. YAML 记忆类型配置

```yaml
# memory-types.yaml
memory_types:
  - name: card
    schema:
      type: object
      properties:
        title: { type: string }
        content: { type: string }
        tags: { type: array }
    
  - name: event
    schema:
      type: object
      properties:
        timestamp: { type: string }
        description: { type: string }
        participants: { type: array }
    
  - name: entity
    schema:
      type: object
      properties:
        name: { type: string }
        type: { type: string }
        attributes: { type: object }

# 使用示例
const registry = await MemoryTypeRegistry.load('memory-types.yaml');
const schema = registry.getSchema('event');
const validated = registry.validate('event', eventData);
```

---

#### 3. ReAct 编排器

```javascript
class MemoryReAct {
  constructor(storage) {
    this.storage = storage;
    this.tools = {
      read: this.read.bind(this),
      find: this.find.bind(this),
      ls: this.ls.bind(this),
      write_uris: this.writeUris.bind(this),
      edit_uris: this.editUris.bind(this),
      delete_uris: this.deleteUris.bind(this)
    };
  }
  
  async execute(plan) {
    // ReAct-style 执行计划
    const results = [];
    for (const step of plan) {
      const tool = this.tools[step.tool];
      const result = await tool(...step.args);
      results.push(result);
      
      // 根据结果调整后续步骤
      if (step.adjustBasedOnResult) {
        plan = this.adjustPlan(plan, result);
      }
    }
    return results;
  }
}
```

---

#### 4. 预取优化

```javascript
async function preFetchOptimization(contextUri) {
  // 1. ls directories
  const directories = await storage.ls(contextUri);
  
  // 2. 批量读取摘要
  const abstracts = await Promise.all(
    directories.map(dir => storage.getAbstract(dir))
  );
  
  // 3. 批量读取概览
  const overviews = await Promise.all(
    directories.map(dir => storage.getOverview(dir))
  );
  
  // 4. 只搜索一次
  const searchResults = await storage.find(currentQuery, contextUri);
  
  return {
    directories,
    abstracts,
    overviews,
    searchResults
  };
}
```

---

#### 5. 增量更新（Patch Handler）

```javascript
class MemoryPatchHandler {
  async apply(patch) {
    switch (patch.type) {
      case 'search_replace':
        return await this.searchReplace(patch);
      case 'json_patch':
        return await this.jsonPatch(patch);
      case 'semantic_merge':
        return await this.semanticMerge(patch);
      default:
        throw new Error(`Unknown patch type: ${patch.type}`);
    }
  }
  
  async searchReplace(patch) {
    let content = await fs.readFile(patch.uri, 'utf8');
    for (const change of patch.changes) {
      content = content.replace(change.search, change.replace);
    }
    await fs.writeFile(patch.uri, content, 'utf8');
    return { status: 'success' };
  }
}
```

---

## 📊 第八部分：实现优先级

| 功能 | 复杂度 | 价值 | 优先级 |
|------|--------|------|--------|
| L0/L1/L2 分层存储 | 中 | 高 | ⭐⭐⭐⭐⭐ |
| YAML 记忆类型 | 低 | 高 | ⭐⭐⭐⭐⭐ |
| Patch Handler | 中 | 高 | ⭐⭐⭐⭐ |
| 预取优化 | 中 | 中 | ⭐⭐⭐⭐ |
| ReAct 编排 | 高 | 中 | ⭐⭐⭐ |
| 向量搜索 | 高 | 中 | ⭐⭐⭐ |

---

## 🎯 总结

### OpenViking 核心优势

1. ✅ **分层存储** - L0/L1/L2 减少 token 消耗
2. ✅ **YAML 配置** - 灵活可配置的记忆类型
3. ✅ **ReAct 编排** - 智能的多阶段流程
4. ✅ **增量更新** - Patch Handler 避免全量写入
5. ✅ **预取优化** - 批量读取减少 I/O

### Memory-Master 差异化

1. ✅ **轻量级** - 本地运行，无服务端依赖
2. ✅ **三层架构** - 已与 OpenViking 理念一致
3. ✅ **智能压缩** - 47-60% 压缩率
4. ✅ **记忆巩固** - 后台自动整理

### 下一步行动

1. 🔜 **创建 `memory-types.yaml`** - 定义 8 种内置类型
2. 🔜 **实现分层存储** - L0/L1/L2 抽象层
3. 🔜 **实现 Patch Handler** - 支持增量更新
4. 🔜 **实现预取优化** - 批量读取摘要/概览

---

*报告完成时间：2026-04-06 16:00*  
*作者：小鬼 👻 × Jake*  
*版本：v4.0-planning*
