/**
 * 上下文压缩管道 - 参考 Claude Code
 * 
 * 硬限制：
 * - MAX_MEMORY_LINES: 200 行（超过静默截断）
 * - COMPACTION_TOKENS: 167,000 tokens（触发压缩）
 * - MAX_FILE_READ: 2,000 行（超过会幻觉）
 * - SESSION_AGE_DAYS: 30 天
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw/workspace/memory');

/**
 * 压缩限制（参考 Claude Code）
 */
const COMPRESSION_LIMITS = {
  MAX_MEMORY_LINES: 200,        // 记忆行数上限
  COMPACTION_TOKENS: 167000,    // 压缩触发点（tokens）
  MAX_FILE_READ: 2000,          // 文件读取上限
  SESSION_AGE_DAYS: 30,         // 会话保存天数
  TOPIC_MAX_LINES: 100          // 每个主题文件最大行数
};

/**
 * 压缩管道阶段
 */
const COMPRESSION_STAGES = [
  'removeDuplicates',      // 去重
  'extractKeyPoints',      // 提取关键点
  'summarizeLongThreads',  // 总结长对话
  'pruneOldMemories',      // 删除旧记忆
  'consolidateInsights'    // 整合洞察
];

/**
 * 上下文压缩管理器
 */
class ContextCompactionManager {
  constructor() {
    this.limits = COMPRESSION_LIMITS;
  }
  
  /**
   * 估算 token 数（简单策略：中文字符数/2 + 英文字符数）
   */
  estimateTokens(text) {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.replace(/[\u4e00-\u9fa5]/g, '').length;
    return Math.floor(chineseChars / 2) + otherChars;
  }
  
  /**
   * 检查是否需要压缩
   */
  async needsCompaction() {
    const files = [
      'MEMORY.md',
      'topics/projects.md',
      'topics/tasks.md',
      'topics/decisions.md'
    ];
    
    let totalTokens = 0;
    let totalLines = 0;
    
    for (const file of files) {
      const filePath = path.join(MEMORY_DIR, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        totalTokens += this.estimateTokens(content);
        totalLines += content.split('\n').length;
      }
    }
    
    const needsCompression = totalTokens > this.limits.COMPACTION_TOKENS || 
                            totalLines > this.limits.MAX_MEMORY_LINES;
    
    console.log(`[Compaction] 当前状态：${totalTokens} tokens, ${totalLines} 行`);
    console.log(`[Compaction] 限制：${this.limits.COMPACTION_TOKENS} tokens, ${this.limits.MAX_MEMORY_LINES} 行`);
    console.log(`[Compaction] 需要压缩：${needsCompression ? '是' : '否'}`);
    
    return {
      needsCompression,
      totalTokens,
      totalLines,
      limits: this.limits
    };
  }
  
  /**
   * 执行压缩管道
   */
  async compact(context) {
    console.log('[Compaction] 开始压缩管道...\n');
    
    let result = context;
    const stats = {
      stages: [],
      originalLength: context.length,
      finalLength: 0
    };
    
    for (const stage of COMPRESSION_STAGES) {
      const startTime = Date.now();
      const inputLength = result.length;
      
      console.log(`[Compaction] 阶段：${stage}`);
      
      try {
        result = await this[stage](result);
        
        const duration = Date.now() - startTime;
        const outputLength = result.length;
        const reduction = ((inputLength - outputLength) / inputLength * 100).toFixed(2);
        
        stats.stages.push({
          stage,
          inputLength,
          outputLength,
          reduction: reduction + '%',
          duration: duration + 'ms'
        });
        
        console.log(`  ${inputLength} → ${outputLength} (减少 ${reduction}%), 耗时 ${duration}ms\n`);
        
      } catch (error) {
        console.error(`  ❌ 阶段 ${stage} 失败:`, error.message);
        stats.stages.push({
          stage,
          error: error.message
        });
      }
    }
    
    stats.finalLength = result.length;
    stats.totalReduction = ((stats.originalLength - stats.finalLength) / stats.originalLength * 100).toFixed(2) + '%';
    
    console.log(`[Compaction] ✅ 压缩完成，总减少 ${stats.totalReduction}\n`);
    
    return {
      compressed: result,
      stats
    };
  }
  
  /**
   * 阶段 1: 去重
   */
  async removeDuplicates(context) {
    if (typeof context === 'string') {
      // 文本去重：删除重复行
      const lines = context.split('\n');
      const uniqueLines = [];
      const seen = new Set();
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !seen.has(trimmed)) {
          seen.add(trimmed);
          uniqueLines.push(line);
        }
      }
      
      return uniqueLines.join('\n');
    }
    
    // 数组去重
    if (Array.isArray(context)) {
      return context.filter((item, index, self) => 
        index === self.findIndex(t => t.content === item.content)
      );
    }
    
    return context;
  }
  
  /**
   * 阶段 2: 提取关键点
   */
  async extractKeyPoints(context) {
    if (typeof context !== 'string') {
      return context;
    }
    
    // 简单策略：保留包含关键词的行
    const keyPatterns = [
      /重要 | 关键 | 必须 | 应该 | 要 | 决定 | 决策/,
      /项目 | 任务 | 待办 | 计划/,
      /记住 | 别忘了 | 提醒/,
      /\*\*.*\*\*/,  // Markdown 粗体（通常是重点）
      /^#+\s/,       // Markdown 标题
      /-\s*\[/,      // 待办事项
      /\d{4}-\d{2}-\d{2}/  // 日期
    ];
    
    const lines = context.split('\n');
    const keyPoints = [];
    
    for (const line of lines) {
      const isKeyPoint = keyPatterns.some(pattern => pattern.test(line));
      
      if (isKeyPoint || line.startsWith('#') || line.trim().length < 10) {
        keyPoints.push(line);
      }
    }
    
    return keyPoints.join('\n');
  }
  
  /**
   * 阶段 3: 总结长对话
   */
  async summarizeLongThreads(context) {
    // 简单策略：截断过长的段落
    if (typeof context !== 'string') {
      return context;
    }
    
    const paragraphs = context.split('\n\n');
    const summarized = paragraphs.map(p => {
      const lines = p.split('\n');
      
      // 如果段落太长，只保留前 10 行和最后 5 行
      if (lines.length > 15) {
        return [
          ...lines.slice(0, 10),
          '\n... (省略中间内容) ...\n',
          ...lines.slice(-5)
        ].join('\n');
      }
      
      return p;
    });
    
    return summarized.join('\n\n');
  }
  
  /**
   * 阶段 4: 删除旧记忆
   */
  async pruneOldMemories(context) {
    if (typeof context !== 'string') {
      return context;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.limits.SESSION_AGE_DAYS);
    
    // 简单策略：保留最近的日期标记
    const lines = context.split('\n');
    const filtered = lines.filter(line => {
      // 检查是否包含日期
      const dateMatch = line.match(/(\d{4}-\d{2}-\d{2})/);
      
      if (dateMatch) {
        const lineDate = new Date(dateMatch[1]);
        return lineDate >= cutoffDate;
      }
      
      // 没有日期的行保留
      return true;
    });
    
    return filtered.join('\n');
  }
  
  /**
   * 阶段 5: 整合洞察
   */
  async consolidateInsights(context) {
    // 简单策略：按主题分组
    if (typeof context !== 'string') {
      return context;
    }
    
    // 这个功能需要 LLM 支持，这里做简单处理
    return context;
  }
  
  /**
   * 压缩文件
   */
  async compactFile(filePath) {
    console.log(`[Compaction] 压缩文件：${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️ 文件不存在`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const originalSize = content.length;
    const originalLines = content.split('\n').length;
    
    // 检查是否需要压缩
    if (originalLines <= this.limits.MAX_MEMORY_LINES) {
      console.log(`  ✅ 无需压缩（${originalLines} 行 < ${this.limits.MAX_MEMORY_LINES}）`);
      return;
    }
    
    // 执行压缩
    const { compressed, stats } = await this.compact(content);
    
    // 如果压缩后仍然超过限制，强制截断
    let finalContent = compressed;
    const finalLines = finalContent.split('\n');
    
    if (finalLines.length > this.limits.MAX_MEMORY_LINES) {
      console.log(`  ⚠️ 压缩后仍超限，强制截断到${this.limits.MAX_MEMORY_LINES}行`);
      finalContent = finalLines.slice(-this.limits.MAX_MEMORY_LINES).join('\n');
    }
    
    // 写入文件
    fs.writeFileSync(filePath, finalContent, 'utf8');
    
    const newSize = finalContent.length;
    const newLines = finalContent.split('\n').length;
    const sizeReduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    
    console.log(`  ✅ 压缩完成：${originalLines} → ${newLines} 行，减少 ${sizeReduction}%`);
    
    return {
      originalLines,
      newLines,
      sizeReduction
    };
  }
  
  /**
   * 运行全局压缩
   */
  async runGlobalCompaction() {
    console.log('[Compaction] 🗜️ 开始全局压缩...\n');
    
    const startTime = Date.now();
    const results = {};
    
    // 压缩主题文件
    const topicFiles = [
      'topics/projects.md',
      'topics/tasks.md',
      'topics/people.md',
      'topics/preferences.md',
      'topics/decisions.md'
    ];
    
    for (const file of topicFiles) {
      const filePath = path.join(MEMORY_DIR, file);
      try {
        results[file] = await this.compactFile(filePath);
      } catch (error) {
        console.error(`  ❌ 压缩 ${file} 失败:`, error.message);
        results[file] = { error: error.message };
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`\n[Compaction] ✅ 全局压缩完成，耗时 ${duration}ms\n`);
    
    return {
      success: true,
      duration,
      results
    };
  }
}

module.exports = {
  ContextCompactionManager,
  COMPRESSION_LIMITS,
  COMPRESSION_STAGES
};

// 如果直接运行，执行全局压缩
if (require.main === module) {
  const manager = new ContextCompactionManager();
  
  // 先检查是否需要压缩
  manager.needsCompaction().then(async status => {
    if (status.needsCompression) {
      console.log();
      await manager.runGlobalCompaction();
    } else {
      console.log('\n✅ 无需压缩\n');
    }
  });
}
