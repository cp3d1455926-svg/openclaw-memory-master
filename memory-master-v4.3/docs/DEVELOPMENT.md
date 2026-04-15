# Memory-Master v4.3.0 开发文档

## 架构设计

### 核心模块

```
┌─────────────────────────────────────────────┐
│            MemoryMaster (主接口)             │
├─────────────────────────────────────────────┤
│  Storage  │  Retrieval  │  Extractor       │
│  Manager  │   Engine    │   + Relation     │
├─────────────────────────────────────────────┤
│  Priority │   Graph     │   Viz            │
│  Manager  │  Engine+RAG │   Lineage        │
└─────────────────────────────────────────────┘
```

## API 设计

### MemoryMaster

```python
mm = MemoryMaster(workspace="~/.openclaw/workspace")

# CRUD
mm.add("内容", priority="P1")
mm.search("查询", top_k=5)
mm.get("memory_id")
mm.update("memory_id", "新内容")
mm.delete("memory_id")

# 管理
mm.archive(days=30)
mm.stats()
```

### PriorityManager

```python
pm = PriorityManager()

# 解析格式
priority, date, content = pm.parse_priority("- [P1][2026-04-12] 内容")

# 格式化
formatted = pm.format_memory("P1", "2026-04-12", "内容")

# 检查过期
expired = pm.is_expired("P2", "2026-03-01")
```

### EntityExtractor

```python
ee = EntityExtractor()

# 提取实体
entities = ee.extract("Jake 开发 Memory-Master")

# 批量提取
entities = ee.extract_batch(texts)
```

## 数据格式

### 记忆格式

```markdown
- [P0][2026-04-12] Jake，12 岁，OpenClaw 开发者
- [P1][2026-04-06] Memory-Master v4.3.0 开发中
- [P2][2026-04-01] 今天测试了新的压缩算法
```

### 实体格式

```json
{
  "id": "entity_001",
  "name": "Jake",
  "type": "Person",
  "description": "12 岁，OpenClaw 开发者",
  "metadata": {
    "age": 12,
    "role": "developer"
  },
  "created_at": "2026-04-12"
}
```

### 关系格式

```json
{
  "id": "rel_001",
  "source_entity_id": "entity_001",
  "target_entity_id": "entity_002",
  "relation_type": "works_on",
  "description": "Jake 开发 Memory-Master",
  "metadata": {},
  "created_at": "2026-04-12"
}
```

## 性能优化

### 时间衰减公式

```python
score = base_similarity * time_decay * importance_boost

time_decay = exp(-lambda * days_since_creation)
# lambda = 0.01 (可调参数)
```

### 层次化存储

```
MEMORY.md (索引，~1.5k tokens，始终加载)
├── people/Jake.md (详情，按需加载)
├── projects/Memory-Master.md (详情，按需加载)
└── decisions/2026-04.md (详情，按需加载)
```

## 测试策略

- 单元测试：pytest
- 集成测试：真实工作目录测试
- 性能测试：基准测试 + 负载测试

## 发布流程

1. 开发完成 → v4.3.0-alpha
2. 内部测试 → v4.3.0-beta
3. 公开测试 → v4.3.0-rc
4. 正式发布 → v4.3.0
