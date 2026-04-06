# 🔧 Memory-Master 优化计划（参考 Claude Code）

**创建时间**: 2026-04-06 15:35  
**参考架构**: Claude Code v2.1.88 (泄露源码)  
**预计完成**: 2026-04-13 (7 天)

---

## 📊 Claude Code 记忆架构分析

### 核心发现

根据泄露的 512,000 行源码，Claude Code 的记忆系统有以下特点：

#### 1. 三层记忆设计

```
Layer 1: MEMORY.md (索引层)
  - 仅存储索引，不存储具体内容
  - 指向 topic files 的指针
  - 轻量级，快速加载 (~200ms)

Layer 2: Topic Files (主题层)
  - projects.md - 项目相关
  - tasks.md - 待办事项
  - people.md - 人物关系
  - preferences.md - 用户偏好
  - decisions.md - 重要决策
  - 按需加载，节省 token

Layer 3: Session Transcripts (会话层)
  - 完整对话历史
  - 可搜索的全文索引
  - 支持语义检索
```

#### 2. 硬限制（从源码中挖掘）

```javascript
const HARD_LIMITS = {
  MAX_MEMORY_LINES: 200,        // 记忆行数上限，超过静默截断
  COMPACTION_TOKENS: 167000,    // 自动压缩触发点
  MAX_FILE_READ: 2000,          // 文件读取上限，超过会幻觉
  SESSION_AGE_DAYS: 30          // 会话保存天数
};
```

#### 3. 记忆巩固（后台运行）

```javascript
// Claude Code 的记忆巩固流程
async function memoryConsolidation() {
  // 1. 合并相似观察
  // 2. 移除矛盾信息
  // 3. 转换为结构化上下文
  // 4. 更新记忆图谱
}
```

#### 4. KV 缓存 + Fork-Join 模型

- 使用 KV 缓存创建子智能体
- 子智能体包含完整上下文
- 无需重复工作，性能提升 10 倍

---

## 🎯 Memory-Master 优化方案

### 优化 1: 三层记忆架构

**当前问题**:
- ❌ 只有一层记忆（daily notes + MEMORY.md）
- ❌ 每次加载全部内容，浪费 token
- ❌ 结构不清晰，难以维护

**改进方案**:

```
memory/
├── MEMORY.md              # Layer 1: 索引（轻量）
├── topics/                # Layer 2: 主题文件
│   ├── projects.md        # 项目相关
│   ├── tasks.md           # 待办事项
│   ├── people.md          # 人物关系
│   ├── preferences.md     # 用户偏好
│   └── decisions.md       # 重要决策
└── sessions/              # Layer 3: 会话记录
    ├── 2026-04-06-001.md  # 会话 1
    └── 2026-04-06-002.md  # 会话 2
```

**实现代码**: `memory-manager.js`

---

### 优化 2: 记忆巩固任务

**当前问题**:
- ❌ 记忆碎片化
- ❌ 可能有矛盾信息
- ❌ 缺乏整合

**改进方案**:

```javascript
/**
 * 记忆巩固任务 - 每天凌晨 3 点运行
 */
async function memoryConsolidation() {
  // 1. 读取所有记忆
  const memories = await loadAllMemories();
  
  // 2. 合并相似记忆（使用 embedding 相似度）
  const merged = mergeSimilarMemories(memories);
  
  // 3. 检测并移除矛盾
  const consistent = removeContradictions(merged);
  
  // 4. 提取洞察
  const insights = extractInsights(consistent);
  
  // 5. 更新记忆图谱
  await updateMemoryGraph(insights);
  
  // 6. 写入主题文件
  await writeToTopicFiles(insights);
}
```

**实现代码**: `memory-consolidation.js`

---

### 优化 3: 智能压缩管道

**当前问题**:
- ❌ 无压缩限制
- ❌ 可能占用过多 token
- ❌ 缺乏优先级管理

**改进方案**:

```javascript
const COMPRESSION_LIMITS = {
  MAX_MEMORY_LINES: 200,        // 参考 Claude Code
  COMPACTION_TOKENS: 167000,    // 参考 Claude Code
  MAX_FILE_READ: 2000,          // 参考 Claude Code
  SESSION_AGE_DAYS: 30
};

const compactionPipeline = [
  removeDuplicates,      // 去重
  extractKeyPoints,      // 提取关键点
  summarizeLongThreads,  // 总结长对话
  pruneOldMemories,      // 删除旧记忆
  consolidateInsights    // 整合洞察
];

// 执行压缩
async function compactContext(context) {
  let result = context;
  for (const stage of compactionPipeline) {
    result = await stage(result);
  }
  return result;
}
```

**实现代码**: `context-compaction.js`

---

### 优化 4: 主题文件按需加载

**当前问题**:
- ❌ 每次加载全部记忆
- ❌ 浪费 token 和带宽

**改进方案**:

```javascript
class TopicFileManager {
  async loadTopic(topicName) {
    // 按需加载特定主题
    const filePath = `memory/topics/${topicName}.md`;
    return await fs.readFile(filePath, 'utf8');
  }
  
  async appendToTopic(topicName, content) {
    // 追加到主题文件
    await fs.appendFile(
      `memory/topics/${topicName}.md`,
      `\n${content}\n`,
      'utf8'
    );
  }
  
  async getIndex() {
    // 获取所有主题索引
    const index = {};
    for (const topic of ['projects', 'tasks', 'people', 'preferences', 'decisions']) {
      const stats = await fs.stat(`memory/topics/${topic}.md`);
      index[topic] = {
        lines: stats.size,
        lastModified: stats.mtime
      };
    }
    return index;
  }
}
```

**实现代码**: `topic-manager.js`

---

### 优化 5: 会话搜索

**当前问题**:
- ❌ 缺乏搜索功能
- ❌ 难以找到特定对话

**改进方案**:

```javascript
class SessionSearch {
  constructor() {
    this.index = new Map(); // 倒排索引
  }
  
  // 建立索引
  async indexSession(session) {
    const tokens = this.tokenize(session.content);
    tokens.forEach(token => {
      if (!this.index.has(token)) {
        this.index.set(token, []);
      }
      this.index.get(token).push(session.id);
    });
  }
  
  // 搜索
  search(query) {
    const tokens = this.tokenize(query);
    const results = new Map();
    
    tokens.forEach(token => {
      const sessions = this.index.get(token) || [];
      sessions.forEach(id => {
        results.set(id, (results.get(id) || 0) + 1);
      });
    });
    
    return Array.from(results.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({ id, score }));
  }
}
```

**实现代码**: `session-search.js`

---

## 📋 实施计划

### Phase 1: 三层架构（2026-04-06 ~ 2026-04-08）

**任务**:
- [ ] 创建 `memory/topics/` 目录
- [ ] 创建 `memory/sessions/` 目录
- [ ] 实现 `TopicFileManager`
- [ ] 迁移现有记忆到新结构
- [ ] 更新 `auto-capture.js` 使用新结构

**工作量**: 2 天  
**风险**: 低  
**优先级**: ⭐⭐⭐⭐⭐

---

### Phase 2: 记忆巩固（2026-04-09 ~ 2026-04-10）

**任务**:
- [ ] 实现 `memory-consolidation.js`
- [ ] 添加 Cron 任务（每天 3 点）
- [ ] 实现相似记忆合并算法
- [ ] 实现矛盾检测逻辑
- [ ] 测试巩固效果

**工作量**: 2 天  
**风险**: 中  
**优先级**: ⭐⭐⭐⭐

---

### Phase 3: 压缩管道（2026-04-11 ~ 2026-04-12）

**任务**:
- [ ] 实现 `context-compaction.js`
- [ ] 配置硬限制（200 行、167k tokens）
- [ ] 实现 5 阶段压缩管道
- [ ] 测试压缩效果
- [ ] 优化压缩算法

**工作量**: 2 天  
**风险**: 中  
**优先级**: ⭐⭐⭐⭐

---

### Phase 4: 搜索功能（2026-04-13）

**任务**:
- [ ] 实现 `session-search.js`
- [ ] 建立倒排索引
- [ ] 支持全文搜索
- [ ] 添加命令 `/memory-search`
- [ ] 测试搜索准确率

**工作量**: 1 天  
**风险**: 低  
**优先级**: ⭐⭐⭐

---

## 📈 预期效果

### 性能对比

| 指标 | 当前 (v1.0) | 优化后 (v2.0) | 提升 |
|------|------------|--------------|------|
| 记忆加载速度 | ~2000ms | ~200ms | **10x** |
| Token 消耗 | 100% | 20-30% | **-70%** |
| 记忆准确率 | 85% | 95% | **+12%** |
| 搜索速度 | N/A | <100ms | **新增** |
| 记忆巩固 | 手动 | 自动 | **新增** |
| 矛盾检测 | ❌ | ✅ | **新增** |

---

### 功能对比

| 功能 | v1.0 | v2.0 |
|------|------|------|
| 三层架构 | ❌ | ✅ |
| 记忆巩固 | ❌ | ✅ |
| 智能压缩 | ❌ | ✅ |
| 按需加载 | ❌ | ✅ |
| 全文搜索 | ❌ | ✅ |
| 矛盾检测 | ❌ | ✅ |
| KV 缓存 | ❌ | ⚠️ (可选) |
| Fork-Join | ❌ | ⚠️ (可选) |

---

## 🎯 成功标准

### Phase 1 验收标准

- ✅ `memory/topics/` 和 `memory/sessions/` 目录创建成功
- ✅ `TopicFileManager` 正常工作
- ✅ 现有记忆成功迁移
- ✅ 加载速度提升到 <500ms

### Phase 2 验收标准

- ✅ 记忆巩固任务每天自动运行
- ✅ 相似记忆合并成功率 >90%
- ✅ 矛盾检测准确率 >85%

### Phase 3 验收标准

- ✅ 压缩后 token 消耗减少 70%+
- ✅ 压缩后信息保留率 >95%
- ✅ 无重要信息丢失

### Phase 4 验收标准

- ✅ 搜索响应时间 <100ms
- ✅ 搜索准确率 >90%
- ✅ 支持中文搜索

---

## 🚀 开始实施

**下一步**: 创建 Phase 1 的代码结构

```bash
# 创建目录
mkdir -p memory/topics
mkdir -p memory/sessions

# 创建主题文件模板
echo "# 项目记忆\n\n" > memory/topics/projects.md
echo "# 待办事项\n\n" > memory/topics/tasks.md
echo "# 人物关系\n\n" > memory/topics/people.md
echo "# 用户偏好\n\n" > memory/topics/preferences.md
echo "# 重要决策\n\n" > memory/topics/decisions.md
```

---

*计划版本：v2.0*  
*参考架构：Claude Code v2.1.88*  
*创建时间：2026-04-06 15:35*
