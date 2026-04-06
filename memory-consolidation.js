/**
 * 记忆巩固任务 - 参考 Claude Code
 * 
 * 后台运行，定期整理记忆：
 * 1. 合并相似观察
 * 2. 移除矛盾信息
 * 3. 转换为结构化上下文
 * 4. 更新记忆图谱
 */

const fs = require('fs');
const path = require('path');
const { TopicFileManager } = require('./memory-manager');
const { extractFromText } = require('./utils/entity-extractor-final');

const MEMORY_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw/workspace/memory');
const STATE_FILE = path.join(MEMORY_DIR, 'memory-state.json');

/**
 * 记忆巩固管理器
 */
class MemoryConsolidationManager {
  constructor() {
    this.topicManager = new TopicFileManager();
    this.similarityThreshold = 0.8; // 相似度阈值
  }
  
  /**
   * 读取所有记忆
   */
  async loadAllMemories() {
    const memories = [];
    
    // 1. 读取主题文件
    for (const topic of ['projects', 'tasks', 'people', 'preferences', 'decisions']) {
      try {
        const content = await this.topicManager.loadTopic(topic);
        if (content) {
          memories.push({
            type: 'topic',
            topic,
            content,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error(`[Consolidation] 读取主题 ${topic} 失败:`, error);
      }
    }
    
    // 2. 读取会话记录
    const sessionsDir = path.join(MEMORY_DIR, 'sessions');
    if (fs.existsSync(sessionsDir)) {
      const files = fs.readdirSync(sessionsDir)
        .filter(f => f.endsWith('.md'))
        .slice(-10); // 最近 10 个会话
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(sessionsDir, file), 'utf8');
          memories.push({
            type: 'session',
            id: file.replace('.md', ''),
            content,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error(`[Consolidation] 读取会话 ${file} 失败:`, error);
        }
      }
    }
    
    return memories;
  }
  
  /**
   * 合并相似记忆（简单文本相似度）
   */
  mergeSimilarMemories(memories) {
    console.log(`[Consolidation] 开始合并相似记忆，共 ${memories.length} 条`);
    
    const merged = [];
    const used = new Set();
    
    for (let i = 0; i < memories.length; i++) {
      if (used.has(i)) continue;
      
      const current = memories[i];
      const similar = [current];
      
      for (let j = i + 1; j < memories.length; j++) {
        if (used.has(j)) continue;
        
        const other = memories[j];
        
        // 简单相似度计算（Jaccard 相似度）
        const similarity = this.calculateSimilarity(current.content, other.content);
        
        if (similarity >= this.similarityThreshold) {
          similar.push(other);
          used.add(j);
        }
      }
      
      // 合并相似记忆
      if (similar.length > 1) {
        const mergedContent = this.mergeMemoryContents(similar);
        merged.push({
          ...current,
          content: mergedContent,
          mergedCount: similar.length
        });
        console.log(`[Consolidation] 合并 ${similar.length} 条相似记忆`);
      } else {
        merged.push(current);
      }
      
      used.add(i);
    }
    
    console.log(`[Consolidation] 合并完成，${memories.length} → ${merged.length} 条`);
    return merged;
  }
  
  /**
   * 计算文本相似度（Jaccard）
   */
  calculateSimilarity(text1, text2) {
    const set1 = new Set(this.tokenize(text1));
    const set2 = new Set(this.tokenize(text2));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
  
  /**
   * 分词
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .match(/[\w\u4e00-\u9fa5]+/g) || [];
  }
  
  /**
   * 合并记忆内容
   */
  mergeMemoryContents(memories) {
    // 简单策略：保留最新的内容，追加其他内容的关键点
    const latest = memories[0];
    const others = memories.slice(1);
    
    let merged = latest.content;
    
    if (others.length > 0) {
      merged += '\n\n## 相关信息\n\n';
      others.forEach(m => {
        merged += `- ${m.content.substring(0, 200)}...\n`;
      });
    }
    
    return merged;
  }
  
  /**
   * 检测并移除矛盾
   */
  removeContradictions(memories) {
    console.log('[Consolidation] 检测矛盾信息...');
    
    // 简单策略：检测相反的陈述
    const contradictionPatterns = [
      { positive: /应该 | 要 | 需要 | 必须/, negative: /不应该 | 不要 | 不需要 | 禁止/ },
      { positive: /好 | 优秀 | 推荐/, negative: /差 | 糟糕 | 不推荐/ },
      { positive: /是 | 对 | 正确/, negative: /不是 | 错 | 错误/ }
    ];
    
    const consistent = memories.filter(memory => {
      const content = memory.content.toLowerCase();
      
      for (const { positive, negative } of contradictionPatterns) {
        const hasPositive = positive.test(content);
        const hasNegative = negative.test(content);
        
        // 同时包含正反陈述，可能有矛盾
        if (hasPositive && hasNegative) {
          console.log(`[Consolidation] 检测到潜在矛盾，保留最新记录`);
          return false;
        }
      }
      
      return true;
    });
    
    console.log(`[Consolidation] 移除 ${memories.length - consistent.length} 条矛盾记录`);
    return consistent;
  }
  
  /**
   * 提取洞察
   */
  async extractInsights(memories) {
    console.log('[Consolidation] 提取洞察...');
    
    const insights = [];
    
    for (const memory of memories) {
      // 使用实体提取
      const { entities, relations } = extractFromText(memory.content);
      
      if (entities.length > 0 || relations.length > 0) {
        insights.push({
          ...memory,
          entities,
          relations,
          insightType: this.classifyInsight(memory)
        });
      }
    }
    
    console.log(`[Consolidation] 提取 ${insights.length} 条洞察`);
    return insights;
  }
  
  /**
   * 分类洞察
   */
  classifyInsight(memory) {
    const content = memory.content.toLowerCase();
    
    if (/项目 | 技能 | 计划/.test(content)) return 'project';
    if (/待办 | 任务 | 要做/.test(content)) return 'task';
    if (/决定 | 决策 | 选择/.test(content)) return 'decision';
    if (/偏好 | 喜欢 | 习惯/.test(content)) return 'preference';
    if (/人 | 名字 | 同学/.test(content)) return 'person';
    
    return 'general';
  }
  
  /**
   * 更新记忆图谱
   */
  async updateMemoryGraph(insights) {
    console.log('[Consolidation] 更新记忆图谱...');
    
    const graphFile = path.join(MEMORY_DIR, 'memory-graph.json');
    let graph = { nodes: [], edges: [], lastUpdated: new Date().toISOString() };
    
    if (fs.existsSync(graphFile)) {
      try {
        graph = JSON.parse(fs.readFileSync(graphFile, 'utf8'));
      } catch (error) {
        console.error('[Consolidation] 读取图谱失败:', error);
      }
    }
    
    // 添加新节点和边
    for (const insight of insights) {
      for (const entity of insight.entities) {
        const nodeId = `${entity.type}-${this.normalizeId(entity.name)}`;
        
        if (!graph.nodes.find(n => n.id === nodeId)) {
          graph.nodes.push({
            id: nodeId,
            type: entity.type,
            name: entity.name,
            metadata: {
              insightType: insight.insightType,
              source: insight.content.substring(0, 100)
            },
            createdAt: new Date().toISOString()
          });
        }
      }
      
      for (const relation of insight.relations) {
        if (!graph.edges.find(e => 
          e.from === relation.from && e.to === relation.to && e.relation === relation.relation
        )) {
          graph.edges.push({
            ...relation,
            createdAt: new Date().toISOString()
          });
        }
      }
    }
    
    graph.lastUpdated = new Date().toISOString();
    fs.writeFileSync(graphFile, JSON.stringify(graph, null, 2), 'utf8');
    console.log(`[Consolidation] 图谱更新完成：${graph.nodes.length} 节点，${graph.edges.length} 边`);
  }
  
  /**
   * 写入主题文件
   */
  async writeToTopicFiles(insights) {
    console.log('[Consolidation] 写入主题文件...');
    
    for (const insight of insights) {
      const topic = this.mapInsightToTopic(insight.insightType);
      
      if (topic) {
        const summary = this.generateSummary(insight);
        await this.topicManager.appendToTopic(topic, summary);
      }
    }
    
    console.log('[Consolidation] 主题文件更新完成');
  }
  
  /**
   * 映射洞察到主题
   */
  mapInsightToTopic(insightType) {
    const mapping = {
      'project': 'projects',
      'task': 'tasks',
      'decision': 'decisions',
      'preference': 'preferences',
      'person': 'people'
    };
    
    return mapping[insightType] || null;
  }
  
  /**
   * 生成摘要
   */
  generateSummary(insight) {
    const timestamp = new Date().toISOString();
    
    let summary = `**时间**: ${timestamp}\n\n`;
    
    if (insight.entities.length > 0) {
      summary += '**实体**:\n';
      insight.entities.forEach(e => {
        summary += `- [${e.type}] ${e.name}\n`;
      });
      summary += '\n';
    }
    
    if (insight.relations.length > 0) {
      summary += '**关系**:\n';
      insight.relations.forEach(r => {
        summary += `- ${r.from} -[${r.relationLabel}]-> ${r.to}\n`;
      });
      summary += '\n';
    }
    
    summary += `**内容**: ${insight.content.substring(0, 300)}...\n`;
    
    return summary;
  }
  
  /**
   * 标准化 ID
   */
  normalizeId(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }
  
  /**
   * 执行记忆巩固
   */
  async run() {
    console.log('[Consolidation] 🌙 开始记忆巩固任务...\n');
    
    const startTime = Date.now();
    
    try {
      // 1. 读取所有记忆
      const memories = await this.loadAllMemories();
      console.log(`[Consolidation] 读取 ${memories.length} 条记忆\n`);
      
      // 2. 合并相似记忆
      const merged = this.mergeSimilarMemories(memories);
      console.log();
      
      // 3. 移除矛盾
      const consistent = this.removeContradictions(merged);
      console.log();
      
      // 4. 提取洞察
      const insights = await this.extractInsights(consistent);
      console.log();
      
      // 5. 更新记忆图谱
      await this.updateMemoryGraph(insights);
      console.log();
      
      // 6. 写入主题文件
      await this.writeToTopicFiles(insights);
      console.log();
      
      const duration = Date.now() - startTime;
      console.log(`[Consolidation] ✅ 记忆巩固完成，耗时 ${duration}ms\n`);
      
      // 更新状态
      this.updateState({
        lastConsolidation: new Date().toISOString(),
        consolidationDuration: duration,
        memoriesProcessed: memories.length,
        insightsExtracted: insights.length
      });
      
      return {
        success: true,
        duration,
        memoriesProcessed: memories.length,
        insightsExtracted: insights.length
      };
      
    } catch (error) {
      console.error('[Consolidation] ❌ 记忆巩固失败:', error);
      
      this.updateState({
        lastConsolidation: new Date().toISOString(),
        consolidationError: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * 更新状态
   */
  updateState(stateUpdate) {
    let state = {};
    
    if (fs.existsSync(STATE_FILE)) {
      try {
        state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      } catch (error) {}
    }
    
    Object.assign(state, stateUpdate);
    state.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  }
}

module.exports = {
  MemoryConsolidationManager
};

// 如果直接运行，执行记忆巩固
if (require.main === module) {
  const manager = new MemoryConsolidationManager();
  manager.run().then(result => {
    console.log('记忆巩固结果:', result);
  });
}
