/**
 * 自动记忆捕捉模块
 * 
 * 监控对话历史，自动识别并保存重要信息
 */

const fs = require('fs');
const path = require('path');
const { calculateImportance } = require('./utils/importance');
const { updateMemoryGraph, updateMemoryState, ensureMemoryDir } = require('./index');

const MEMORY_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw/workspace/memory');

/**
 * 获取今日记忆文件路径
 */
function getTodayMemoryFile() {
  const today = new Date().toISOString().split('T')[0];
  return path.join(MEMORY_DIR, `${today}.md`);
}

/**
 * 自动捕捉对话记忆
 * @param {Object[]} messages - 对话消息数组 [{ role: 'user/assistant', content: '...' }]
 * @param {Object} options - 配置选项
 */
async function autoCaptureMemories(messages, options = {}) {
  const {
    threshold = 50,           // 重要性阈值
    compress = true,          // 是否压缩摘要
    updateGraph = true,       // 是否更新记忆图谱
    debug = false             // 调试模式
  } = options;

  console.log(`[Auto-Capture] 开始分析 ${messages.length} 条消息...`);
  
  ensureMemoryDir();
  
  const captured = [];
  const importantMessages = [];
  
  // 1. 识别重要消息
  messages.forEach((msg, index) => {
    const { score, reasons } = calculateImportance(msg.content || msg.text || '');
    
    if (score >= threshold) {
      importantMessages.push({
        index,
        role: msg.role,
        content: msg.content || msg.text,
        score,
        reasons
      });
      
      if (debug) {
        console.log(`[Auto-Capture] 发现重要消息 #${index}: ${score}分`);
      }
    }
  });
  
  console.log(`[Auto-Capture] 识别到 ${importantMessages.length} 条重要消息`);
  
  // 2. 写入记忆
  if (importantMessages.length > 0) {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const todayFile = getTodayMemoryFile();
    
    // 读取或创建今日记忆文件
    let dailyContent = '';
    const weekday = new Date().toLocaleDateString('zh-CN', { weekday: 'long' });
    const today = new Date().toISOString().split('T')[0];
    
    if (fs.existsSync(todayFile)) {
      dailyContent = fs.readFileSync(todayFile, 'utf-8');
    } else {
      dailyContent = `# ${today} ${weekday}\n\n## 📊 今日统计\n- 对话轮数：0\n- 重要记忆：0 条\n\n`;
    }
    
    // 添加记忆区块
    const memorySection = `\n## 📝 自动捕捉 [${timestamp}]\n\n${importantMessages.map(msg => {
      const roleIcon = msg.role === 'user' ? '👤' : '🤖';
      return `### ${roleIcon} 消息 #${msg.index} (${msg.score}分)\n${msg.content}\n**原因**: ${msg.reasons.join(', ')}\n`;
    }).join('\n')}\n`;
    
    dailyContent += memorySection;
    
    // 更新统计
    dailyContent = dailyContent.replace(
      /- 重要记忆：\d+ 条/,
      `- 重要记忆：${parseInt(dailyContent.match(/- 重要记忆：(\d+) 条/)?.[1] || 0) + importantMessages.length} 条`
    );
    
    fs.writeFileSync(todayFile, dailyContent, 'utf8');
    console.log(`[Auto-Capture] 已写入：${todayFile}`);
    
    // 3. 更新记忆图谱（可选）
    if (updateGraph) {
      importantMessages.forEach(msg => {
        // 提取实体（简单实现，可以扩展）
        const content = msg.content;
        
        // 检测人名
        const nameKeywords = ['Jake', 'Alice', 'Bob', '先生', '女士', '同学'];
        nameKeywords.forEach(name => {
          if (content.includes(name)) {
            updateMemoryGraph(
              { id: `person-${name.toLowerCase()}`, type: 'person', name },
              null
            );
          }
        });
        
        // 检测项目
        const projectKeywords = ['项目', '计划', '任务'];
        if (projectKeywords.some(kw => content.includes(kw))) {
          const projectName = content.split('项目')[0].slice(-10) || '未命名项目';
          updateMemoryGraph(
            { id: `project-${projectName}`, type: 'project', name: projectName },
            null
          );
        }
      });
      
      console.log('[Auto-Capture] 已更新记忆图谱');
    }
    
    // 4. 更新状态
    updateMemoryState({
      lastCapture: new Date().toISOString(),
      totalMemories: importantMessages.length
    });
    
    captured.push({
      timestamp,
      count: importantMessages.length,
      file: todayFile
    });
  }
  
  return {
    success: captured.length > 0,
    captured,
    importantMessages
  };
}

/**
 * 定期整理记忆（合并、提炼、删除过期）
 */
async function organizeMemories(options = {}) {
  const {
    maxAge = 30,              // 记忆最大保存天数
    dryRun = false            // 仅预览，不实际执行
  } = options;
  
  console.log('[Organize] 开始定期整理记忆...');
  
  ensureMemoryDir();
  
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - maxAge * 24 * 60 * 60 * 1000);
  
  // 1. 扫描记忆文件
  const files = fs.readdirSync(MEMORY_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .map(f => ({
      name: f,
      path: path.join(MEMORY_DIR, f),
      date: new Date(f.replace('.md', ''))
    }));
  
  // 2. 识别过期文件
  const expiredFiles = files.filter(f => f.date < cutoffDate);
  
  console.log(`[Organize] 找到 ${files.length} 个记忆文件`);
  console.log(`[Organize] 过期文件 ${expiredFiles.length} 个（>${maxAge}天）`);
  
  if (dryRun) {
    console.log('[Organize] 预览模式，不执行删除');
    return {
      totalFiles: files.length,
      expiredFiles: expiredFiles.length,
      deleted: 0
    };
  }
  
  // 3. 删除过期文件（可选）
  let deletedCount = 0;
  expiredFiles.forEach(file => {
    try {
      fs.unlinkSync(file.path);
      console.log(`[Organize] 已删除：${file.name}`);
      deletedCount++;
    } catch (error) {
      console.error(`[Organize] 删除失败 ${file.name}:`, error);
    }
  });
  
  // 4. 更新状态
  updateMemoryState({
    lastOrganize: new Date().toISOString()
  });
  
  console.log(`[Organize] 整理完成，删除 ${deletedCount} 个过期文件`);
  
  return {
    totalFiles: files.length,
    expiredFiles: expiredFiles.length,
    deleted: deletedCount
  };
}

/**
 * 导出记忆为 JSON
 */
function exportMemories(options = {}) {
  const {
    startDate,                // 开始日期 YYYY-MM-DD
    endDate,                  // 结束日期 YYYY-MM-DD
    outputPath                // 输出文件路径
  } = options;
  
  ensureMemoryDir();
  
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();
  
  const memories = [];
  
  const files = fs.readdirSync(MEMORY_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .forEach(f => {
      const date = new Date(f.replace('.md', ''));
      if (date >= start && date <= end) {
        const content = fs.readFileSync(path.join(MEMORY_DIR, f), 'utf-8');
        memories.push({
          date: f.replace('.md', ''),
          content
        });
      }
    });
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    count: memories.length,
    memories
  };
  
  if (outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
    console.log(`[Export] 已导出 ${memories.length} 条记忆到：${outputPath}`);
  }
  
  return exportData;
}

module.exports = {
  autoCaptureMemories,
  organizeMemories,
  exportMemories
};
