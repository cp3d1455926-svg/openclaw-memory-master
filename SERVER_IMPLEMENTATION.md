# 🖥️ Memory-Master 服务端实现方案

**设计时间**: 2026-04-06 16:05  
**架构参考**: OpenViking + Mem0 + SimpleMem  
**技术栈**: Node.js + Express + SQLite/PostgreSQL + pgvector

---

## 📊 第一部分：架构概览

### 部署模式

```
┌─────────────────────────────────────────┐
│          客户端模式（当前）              │
├─────────────────────────────────────────┤
│  OpenClaw Agent                         │
│    ↓                                    │
│  Memory-Master Skill (本地)             │
│    ↓                                    │
│  文件系统 (~/.openclaw/workspace/memory)│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         服务端模式（计划）               │
├─────────────────────────────────────────┤
│  OpenClaw Agent 1 ──┐                   │
│  OpenClaw Agent 2 ──┼──→ Memory Server  │
│  OpenClaw Agent 3 ──┘       ↓           │
│                    PostgreSQL + pgvector │
│                    Redis (缓存)          │
└─────────────────────────────────────────┘
```

---

## 📊 第二部分：技术选型

### 方案对比

| 方案 | 技术栈 | 优势 | 劣势 | 推荐度 |
|------|--------|------|------|--------|
| **轻量级** | Node.js + SQLite | 简单、零配置 | 性能有限 | ⭐⭐⭐⭐ |
| **标准级** | Node.js + PostgreSQL | 生产就绪、扩展性好 | 需要 DB 运维 | ⭐⭐⭐⭐⭐ |
| **高性能** | Go + PostgreSQL | 性能最佳 | 开发成本高 | ⭐⭐⭐ |
| **Python** | FastAPI + PostgreSQL | 生态丰富 | 与当前栈不一致 | ⭐⭐⭐ |

---

### 推荐架构（标准级）

```
┌─────────────────────────────────────────┐
│         Memory-Master Server            │
├─────────────────────────────────────────┤
│  API Layer (Express/Fastify)            │
│    ↓                                    │
│  Service Layer                          │
│  ├── Memory Service                     │
│  ├── Search Service                     │
│  ├── Consolidation Service              │
│  └── Admin Service                      │
│    ↓                                    │
│  Data Layer                             │
│  ├── PostgreSQL (主存储)                │
│  ├── pgvector (向量搜索)                │
│  └── Redis (缓存/队列)                  │
└─────────────────────────────────────────┘
```

---

## 📊 第三部分：数据库设计

### 1. 核心表结构

```sql
-- 记忆表
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uri VARCHAR(500) UNIQUE NOT NULL,
    memory_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    abstract TEXT,  -- L0 摘要
    overview TEXT,  -- L1 概览
    metadata JSONB DEFAULT '{}',
    embedding vector(1536),  -- pgvector
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- 索引
    INDEX idx_memories_type (memory_type),
    INDEX idx_memories_uri (uri),
    INDEX idx_memories_created (created_at),
    INDEX idx_memories_embedding USING hnsw (embedding vector_cosine_ops)
);

-- 记忆关系表（图谱）
CREATE TABLE memory_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_memory_id UUID REFERENCES memories(id),
    to_memory_id UUID REFERENCES memories(id),
    relation_type VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_relations_from (from_memory_id),
    INDEX idx_relations_to (to_memory_id),
    INDEX idx_relations_type (relation_type)
);

-- 用户/Agent 表
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_agents_name (name)
);

-- 记忆权限表
CREATE TABLE memory_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES memories(id),
    agent_id UUID REFERENCES agents(id),
    permission VARCHAR(20) NOT NULL, -- read/write/admin
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(memory_id, agent_id),
    INDEX idx_permissions_memory (memory_id),
    INDEX idx_permissions_agent (agent_id)
);

-- 操作日志表
CREATE TABLE operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    operation VARCHAR(50) NOT NULL,
    memory_uri VARCHAR(500),
    request JSONB,
    response JSONB,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_logs_agent (agent_id),
    INDEX idx_logs_operation (operation),
    INDEX idx_logs_created (created_at)
);
```

---

### 2. 向量搜索配置

```sql
-- 启用 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建索引（HNSW）
CREATE INDEX ON memories 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 创建索引（IVFFlat - 适合大数据量）
CREATE INDEX ON memories 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## 📊 第四部分：API 设计

### RESTful API

```yaml
openapi: 3.0.0
info:
  title: Memory-Master Server API
  version: 1.0.0

paths:
  # 记忆操作
  /api/v1/memories:
    post:
      summary: 创建记忆
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                uri: { type: string }
                memory_type: { type: string }
                content: { type: string }
                metadata: { type: object }
    get:
      summary: 搜索记忆
      parameters:
        - name: q
          in: query
          schema: { type: string }
        - name: type
          in: query
          schema: { type: string }
        - name: limit
          in: query
          schema: { type: integer, default: 10 }
  
  /api/v1/memories/{uri}:
    get:
      summary: 获取记忆
      parameters:
        - name: uri
          in: path
          required: true
          schema: { type: string }
        - name: level
          in: query
          schema: 
            type: string
            enum: [abstract, overview, full]
            default: abstract
    put:
      summary: 更新记忆
    delete:
      summary: 删除记忆
  
  /api/v1/memories/{uri}/patch:
    post:
      summary: 增量更新（Patch）
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                patch_type: 
                  type: string
                  enum: [search_replace, json_patch, semantic_merge]
                changes: { type: array }
  
  # 语义搜索
  /api/v1/search:
    post:
      summary: 语义搜索
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                query: { type: string }
                filters: { type: object }
                limit: { type: integer, default: 10 }
  
  # 记忆图谱
  /api/v1/graph:
    get:
      summary: 获取记忆图谱
      parameters:
        - name: uri
          in: query
          schema: { type: string }
        - name: depth
          in: query
          schema: { type: integer, default: 1 }
  
  # 记忆巩固
  /api/v1/consolidate:
    post:
      summary: 触发记忆巩固
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                agent_id: { type: string }
                mode: 
                  type: string
                  enum: [full, incremental]
  
  # 管理接口
  /api/v1/admin/agents:
    get:
      summary: 列出所有 Agent
    post:
      summary: 创建 Agent
  
  /api/v1/admin/stats:
    get:
      summary: 获取统计信息
```

---

## 📊 第五部分：服务端代码实现

### 1. 项目结构

```
memory-master-server/
├── package.json
├── src/
│   ├── index.js              # 入口
│   ├── server.js             # Express 服务器
│   ├── config/
│   │   ├── database.js       # 数据库配置
│   │   └── redis.js          # Redis 配置
│   ├── routes/
│   │   ├── memories.js       # 记忆路由
│   │   ├── search.js         # 搜索路由
│   │   ├── graph.js          # 图谱路由
│   │   └── admin.js          # 管理路由
│   ├── services/
│   │   ├── memoryService.js  # 记忆服务
│   │   ├── searchService.js  # 搜索服务
│   │   ├── consolidationService.js
│   │   └── embeddingService.js
│   ├── models/
│   │   ├── Memory.js         # 记忆模型
│   │   ├── Agent.js          # Agent 模型
│   │   └── Relation.js       # 关系模型
│   ├── middleware/
│   │   ├── auth.js           # 认证中间件
│   │   ├── rateLimit.js      # 限流中间件
│   │   └── logging.js        # 日志中间件
│   └── utils/
│       ├── logger.js
│       └── helpers.js
├── migrations/                # 数据库迁移
├── tests/                     # 测试
└── docker/
    ├── Dockerfile
    └── docker-compose.yml
```

---

### 2. 核心代码

#### server.js（Express 服务器）

```javascript
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const memoryRoutes = require('./routes/memories');
const searchRoutes = require('./routes/search');
const graphRoutes = require('./routes/graph');
const adminRoutes = require('./routes/admin');

const { authMiddleware } = require('./middleware/auth');
const { loggingMiddleware } = require('./middleware/logging');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());
app.use(cors());

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 最多 100 请求
});
app.use('/api/', limiter);

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use(loggingMiddleware);

// API 路由
app.use('/api/v1/memories', authMiddleware, memoryRoutes);
app.use('/api/v1/search', authMiddleware, searchRoutes);
app.use('/api/v1/graph', authMiddleware, graphRoutes);
app.use('/api/v1/admin', adminRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Memory-Master Server running on port ${PORT}`);
});

module.exports = app;
```

---

#### services/memoryService.js（记忆服务）

```javascript
const { Pool } = require('pg');
const { generateEmbedding } = require('./embeddingService');

class MemoryService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });
  }

  // 创建记忆
  async create({ uri, memory_type, content, metadata = {} }) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 生成 embedding
      const embedding = await generateEmbedding(content);
      
      // 生成摘要和概览
      const abstract = await this.generateAbstract(content);
      const overview = await this.generateOverview(content);
      
      // 插入数据库
      const result = await client.query(
        `INSERT INTO memories (uri, memory_type, content, abstract, overview, metadata, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [uri, memory_type, content, abstract, overview, JSON.stringify(metadata), embedding]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 获取记忆（分层加载）
  async get(uri, level = 'abstract') {
    const selectFields = {
      abstract: 'uri, memory_type, abstract, metadata, created_at',
      overview: 'uri, memory_type, abstract, overview, metadata, created_at',
      full: '*'
    };
    
    const result = await this.pool.query(
      `SELECT ${selectFields[level]} 
       FROM memories 
       WHERE uri = $1 AND deleted_at IS NULL`,
      [uri]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Memory not found: ${uri}`);
    }
    
    return result.rows[0];
  }

  // 语义搜索
  async search(query, filters = {}, limit = 10) {
    // 生成查询 embedding
    const queryEmbedding = await generateEmbedding(query);
    
    // 构建过滤条件
    const whereClauses = ['deleted_at IS NULL'];
    const params = [queryEmbedding];
    let paramIndex = 2;
    
    if (filters.memory_type) {
      whereClauses.push(`memory_type = $${paramIndex++}`);
      params.push(filters.memory_type);
    }
    
    if (filters.agent_id) {
      whereClauses.push(`agent_id = $${paramIndex++}`);
      params.push(filters.agent_id);
    }
    
    const whereClause = whereClauses.join(' AND ');
    
    // 向量搜索
    const result = await this.pool.query(
      `SELECT id, uri, memory_type, abstract, metadata, 
              1 - (embedding <=> $1) as similarity
       FROM memories
       WHERE ${whereClause}
       ORDER BY embedding <=> $1
       LIMIT $${paramIndex}`,
      [...params, limit]
    );
    
    return result.rows;
  }

  // 增量更新（Patch）
  async patch(uri, patch) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 获取当前内容
      const current = await this.get(uri, 'full');
      
      // 应用补丁
      let updatedContent = current.content;
      
      if (patch.patch_type === 'search_replace') {
        for (const change of patch.changes) {
          updatedContent = updatedContent.replace(change.search, change.replace);
        }
      } else if (patch.patch_type === 'json_patch') {
        // 应用 JSON Patch
        updatedContent = applyJsonPatch(updatedContent, patch.operations);
      } else if (patch.patch_type === 'semantic_merge') {
        // 使用 LLM 语义合并
        updatedContent = await this.semanticMerge(current.content, patch.content);
      }
      
      // 重新生成摘要和概览
      const abstract = await this.generateAbstract(updatedContent);
      const overview = await this.generateOverview(updatedContent);
      
      // 重新生成 embedding
      const embedding = await generateEmbedding(updatedContent);
      
      // 更新数据库
      const result = await client.query(
        `UPDATE memories 
         SET content = $1, abstract = $2, overview = $3, embedding = $4, updated_at = NOW()
         WHERE uri = $5
         RETURNING *`,
        [updatedContent, abstract, embedding, uri]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 生成摘要（L0）
  async generateAbstract(content) {
    // 简单策略：提取前 100 字
    return content.substring(0, 100) + '...';
    
    // 进阶：使用 LLM 生成摘要
    // return await llm.summarize(content, { max_length: 100 });
  }

  // 生成概览（L1）
  async generateOverview(content) {
    // 简单策略：提取前 500 字
    return content.substring(0, 500) + '...';
    
    // 进阶：使用 LLM 生成概览
    // return await llm.summarize(content, { max_length: 500 });
  }

  // 语义合并
  async semanticMerge(original, patch) {
    // 使用 LLM 智能合并
    const prompt = `
请合并以下两个文本，保留关键信息：

原文：
${original}

补丁：
${patch}

合并结果：
`;
    // return await llm.generate(prompt);
    return original + '\n\n' + patch; // 简单拼接
  }
}

module.exports = new MemoryService();
```

---

#### routes/memories.js（记忆路由）

```javascript
const express = require('express');
const router = express.Router();
const memoryService = require('../services/memoryService');

// 创建记忆
router.post('/', async (req, res, next) => {
  try {
    const { uri, memory_type, content, metadata } = req.body;
    
    if (!uri || !memory_type || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const memory = await memoryService.create({
      uri,
      memory_type,
      content,
      metadata
    });
    
    res.status(201).json(memory);
  } catch (error) {
    next(error);
  }
});

// 获取记忆（分层加载）
router.get('/:uri', async (req, res, next) => {
  try {
    const { uri } = req.params;
    const { level = 'abstract' } = req.query;
    
    const memory = await memoryService.get(uri, level);
    res.json(memory);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// 更新记忆
router.put('/:uri', async (req, res, next) => {
  try {
    const { uri } = req.params;
    const { content, metadata } = req.body;
    
    // 先删除旧的
    await memoryService.delete(uri);
    
    // 创建新的
    const memory = await memoryService.create({
      uri,
      memory_type: req.body.memory_type,
      content,
      metadata
    });
    
    res.json(memory);
  } catch (error) {
    next(error);
  }
});

// 增量更新（Patch）
router.post('/:uri/patch', async (req, res, next) => {
  try {
    const { uri } = req.params;
    const { patch_type, changes, operations, content } = req.body;
    
    const memory = await memoryService.patch(uri, {
      patch_type,
      changes,
      operations,
      content
    });
    
    res.json(memory);
  } catch (error) {
    next(error);
  }
});

// 删除记忆
router.delete('/:uri', async (req, res, next) => {
  try {
    const { uri } = req.params;
    await memoryService.delete(uri);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

---

### 3. Docker 部署

#### docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL + pgvector
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: memory
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
      POSTGRES_DB: memory_master
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U memory"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis（缓存/队列）
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Memory-Master Server
  server:
    build: .
    environment:
      DATABASE_URL: postgresql://memory:${DB_PASSWORD:-changeme}@postgres:5432/memory_master
      REDIS_URL: redis://redis:6379
      PORT: 3000
      LOG_LEVEL: info
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./logs:/app/logs

  # pgAdmin（可选，用于管理数据库）
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin}
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
```

---

#### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY src/ ./src/
COPY migrations/ ./migrations/

# 创建日志目录
RUN mkdir -p /app/logs

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "src/index.js"]
```

---

## 📊 第六部分：客户端集成

### OpenClaw Skill 配置

```json
{
  "skills": {
    "entries": {
      "memory-master": {
        "enabled": true,
        "mode": "server",  // 或 "local"
        "server": {
          "url": "http://localhost:3000",
          "apiKey": "your-api-key",
          "timeout": 30000
        },
        "fallback": {
          "enabled": true,
          "mode": "local"  // 服务端不可用时回退本地
        }
      }
    }
  }
}
```

---

### Skill 代码调整

```javascript
// memory-client.js
class MemoryClient {
  constructor(config) {
    this.mode = config.mode; // 'server' or 'local'
    this.serverUrl = config.server?.url;
    this.apiKey = config.server?.apiKey;
    this.localManager = config.mode === 'local' ? new TopicFileManager() : null;
  }

  async save(uri, content, options = {}) {
    if (this.mode === 'server') {
      return await this.serverSave(uri, content, options);
    } else {
      return await this.localManager.save(uri, content);
    }
  }

  async load(uri, level = 'abstract') {
    if (this.mode === 'server') {
      return await this.serverLoad(uri, level);
    } else {
      return await this.localManager.load(uri);
    }
  }

  async serverSave(uri, content, options) {
    const response = await fetch(`${this.serverUrl}/api/v1/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        uri,
        content,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return await response.json();
  }

  async serverLoad(uri, level) {
    const response = await fetch(
      `${this.serverUrl}/api/v1/memories/${encodeURIComponent(uri)}?level=${level}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return await response.json();
  }
}
```

---

## 📊 第七部分：部署方案

### 方案 1: 本地部署（开发/测试）

```bash
# 1. 克隆仓库
git clone https://gitee.com/Jake26602/openclaw-memory-master.git
cd memory-master-server

# 2. 启动 Docker Compose
docker-compose up -d

# 3. 运行数据库迁移
npm run migrate

# 4. 验证服务
curl http://localhost:3000/health
```

**资源需求**:
- CPU: 1 核
- 内存：2GB
- 存储：10GB

---

### 方案 2: 云服务器部署（生产）

**推荐配置**:
- CPU: 2-4 核
- 内存：4-8GB
- 存储：50GB SSD
- 网络：按量付费

**部署步骤**:
1. 购买云服务器（阿里云/腾讯云/AWS）
2. 安装 Docker + Docker Compose
3. 配置防火墙（开放 3000 端口）
4. 部署应用
5. 配置 HTTPS（Let's Encrypt）

---

### 方案 3: Serverless 部署（按需付费）

**平台选择**:
- Vercel（前端友好）
- Railway（简单部署）
- AWS Lambda + API Gateway
- 阿里云函数计算

**优势**:
- ✅ 按调用付费
- ✅ 自动扩缩容
- ✅ 零运维

**劣势**:
- ❌ 冷启动延迟
- ❌ 不适合长连接
- ❌ 数据库需单独部署

---

## 📊 第八部分：性能优化

### 1. 缓存策略

```javascript
// 使用 Redis 缓存热点数据
const cache = require('node-cache');

async function getWithCache(uri, level) {
  const cacheKey = `memory:${uri}:${level}`;
  
  // 尝试从缓存获取
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 从数据库获取
  const memory = await memoryService.get(uri, level);
  
  // 写入缓存（5 分钟过期）
  await redis.setex(cacheKey, 300, JSON.stringify(memory));
  
  return memory;
}
```

---

### 2. 批量操作

```javascript
// 批量创建记忆
async function batchCreate(memories) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const memory of memories) {
      const result = await client.query(
        `INSERT INTO memories (...) VALUES (...) RETURNING *`,
        [...]
      );
      results.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    return results;
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

---

### 3. 连接池优化

```javascript
const pool = new Pool({
  max: 20,              // 最大连接数
  min: 5,               // 最小连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 监控连接池状态
pool.on('connect', () => {
  console.log('Connected to database');
});

pool.on('acquire', (client) => {
  console.log('Client acquired');
});

pool.on('release', (client) => {
  console.log('Client released');
});
```

---

## 📊 第九部分：安全考虑

### 1. API 认证

```javascript
// middleware/auth.js
const crypto = require('crypto');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization' });
  }
  
  const apiKey = authHeader.substring(7);
  const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  // 验证 API Key
  const result = await pool.query(
    'SELECT * FROM agents WHERE api_key_hash = $1',
    [apiKeyHash]
  );
  
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  req.agent = result.rows[0];
  next();
}
```

---

### 2. 限流保护

```javascript
// 基于 Agent 的限流
const rateLimitMap = new Map();

function rateLimitMiddleware(req, res, next) {
  const agentId = req.agent.id;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 分钟
  const maxRequests = 100;
  
  if (!rateLimitMap.has(agentId)) {
    rateLimitMap.set(agentId, []);
  }
  
  const requests = rateLimitMap.get(agentId);
  
  // 清理过期请求
  const validRequests = requests.filter(time => now - time < windowMs);
  rateLimitMap.set(agentId, validRequests);
  
  if (validRequests.length >= maxRequests) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  validRequests.push(now);
  next();
}
```

---

### 3. 数据加密

```javascript
// 敏感数据加密存储
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 字节
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

## 📋 第十部分：实施计划

### Phase 1: 基础服务端（1 周）

- [ ] 创建项目结构
- [ ] 实现数据库模型
- [ ] 实现 CRUD API
- [ ] 实现认证中间件
- [ ] Docker 化部署
- [ ] 编写测试

**工作量**: 5 天  
**优先级**: ⭐⭐⭐⭐⭐

---

### Phase 2: 高级功能（1 周）

- [ ] 实现向量搜索（pgvector）
- [ ] 实现分层存储（L0/L1/L2）
- [ ] 实现 Patch Handler
- [ ] 实现 Redis 缓存
- [ ] 实现预取优化

**工作量**: 5 天  
**优先级**: ⭐⭐⭐⭐

---

### Phase 3: 生产就绪（1 周）

- [ ] 实现监控告警
- [ ] 实现日志聚合
- [ ] 实现备份恢复
- [ ] 性能优化
- [ ] 安全加固
- [ ] 文档完善

**工作量**: 5 天  
**优先级**: ⭐⭐⭐⭐

---

### Phase 4: 客户端集成（3 天）

- [ ] 调整 Memory-Master Skill
- [ ] 实现服务端/本地双模式
- [ ] 实现自动回退
- [ ] 测试验证

**工作量**: 3 天  
**优先级**: ⭐⭐⭐⭐

---

## 📈 成本估算

### 本地部署（开发）

| 项目 | 费用 |
|------|------|
| 服务器 | 免费（本地） |
| 电费 | ~¥50/月 |
| **总计** | **~¥50/月** |

---

### 云服务器部署（生产）

| 项目 | 配置 | 费用 |
|------|------|------|
| ECS | 2 核 4GB | ¥200/月 |
| RDS | PostgreSQL 高可用 | ¥300/月 |
| Redis | 主从版 | ¥100/月 |
| OSS | 对象存储 | ¥50/月 |
| **总计** | | **~¥650/月** |

---

### Serverless 部署

| 项目 | 费用模型 | 预估 |
|------|---------|------|
| 函数计算 | ¥0.0000288/GB 秒 | ¥100/月 |
| API 网关 | ¥0.01/万次调用 | ¥50/月 |
| RDS | PostgreSQL | ¥300/月 |
| **总计** | | **~¥450/月** |

---

## 🎯 总结

### 服务端优势

1. ✅ **多 Agent 共享** - 多个 OpenClaw 实例共享记忆
2. ✅ **集中管理** - 统一的记忆管理和权限控制
3. ✅ **高性能** - PostgreSQL + pgvector 向量搜索
4. ✅ **可扩展** - 支持水平扩展
5. ✅ **高可用** - 数据库主从、Redis 缓存

---

### 本地模式优势

1. ✅ **零依赖** - 无需额外服务
2. ✅ **隐私安全** - 数据完全本地
3. ✅ **低成本** - 无服务器费用
4. ✅ **低延迟** - 本地文件系统访问

---

### 推荐方案

**混合模式** = 本地为主 + 服务端可选

- **开发/个人使用**: 本地模式
- **团队/企业使用**: 服务端模式
- **混合部署**: 本地 + 云端备份

---

*设计完成时间：2026-04-06 16:10*  
*作者：小鬼 👻 × Jake*  
*版本：v1.0-design*
