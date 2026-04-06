/**
 * Memory-Master - OpenClaw 超级记忆增强 Skill
 * 
 * @author 小鬼 👻 × Jake
 * @version 0.1.0
 * @description 自动捕捉重要对话、智能过滤、记忆图谱、定期整理
 */

const fs = require('fs');
const path = require('path');

// 记忆文件路径
const MEMORY_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw/workspace/memory');
const MEMORY_FILE = path.join(MEMORY_DIR, 'MEMORY.md');
const GRAPH_FILE = path.join(MEMORY_DIR, 'memory-graph.json');
const STATE_FILE = path.join(MEMORY_DIR, 'memory-state.json');

// 配置文件路径
const CONFIG_FILE = path.join(__dirname, 'config.json');

// 默认配置
const DEFAULT_CONFIG = {
  importanceThreshold: 40,  // 降低阈值到 40 分，更灵敏
  autoLoadOnStart: true,
  organizeSchedule: '0 3 * * *',
  maxMemoryAge: 30,
  enableGraph: true,
  debug: false
};

/**
 * 加载配置
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.error('[Memory-Master] 加载配置失败:', error);
  }
  return DEFAULT_CONFIG;
}

/**
 * 确保记忆目录存在
 */
function ensureMemoryDir() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
}

/**
 * 获取今日日期字符串
 */
function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

/**
 * 获取今日记忆文件路径
 */
function getTodayMemoryFile() {
  return path.join(MEMORY_DIR, `${getTodayStr()}.md`);
}

/**
 * 重要性评分算法
 * @param {string} message - 对话消息
 * @returns {number} - 重要性分数
 */
function scoreImportance(message) {
  let score = 0;
  
  // 规则 1: 关键词匹配（+10 分/个）
  const keywords = ['项目', '决定', '待办', '记住', '重要', '偏好', '习惯', '任务', '计划', '目标'];
  keywords.forEach(kw => {
    if (message.includes(kw)) score += 10;
  });
  
  // 规则 2: 用户明确指令（+30 分）
  const explicitCommands = /记住 | 记下来 | 别忘了 | 记录 | 保存/;
  if (explicitCommands.test(message)) score += 30;
  
  // 规则 3: 包含具体数据（+5 分/个）
  if (/\d{4}-\d{2}-\d{2}/.test(message)) score += 5; // 日期
  if (/https?:\/\//.test(message)) score += 5; // URL
  if (/\d+\.?\d*/.test(message)) score += 3; // 数字
  if (/[^\s]\.(md|js|py|json|txt|doc|pdf)/.test(message)) score += 5; // 文件名
  
  // 规则 4: 总结性语句（+15 分）
  const summaryWords = /总之 | 所以 | 决定 | 结论 | 综上所述 | 总的来说/;
  if (summaryWords.test(message)) score += 15;
  
  // 规则 5: 问题/答案（+8 分）
  if (/[？?]/.test(message) || /答：|回答：/.test(message)) score += 8;
  
  // 规则 6: 代码/技术内容（+10 分）
  if (/```|function|const|let|var|import|export/.test(message)) score += 10;
  
  return score;
}

/**
 * 压缩对话生成摘要
 * @param {string[]} messages - 对话消息数组
 * @returns {Promise<string>} - 压缩后的摘要
 */
async function compressConversation(messages) {
  // 这里应该调用 LLM 生成摘要
  // 由于这是 skill 代码，实际使用时会通过 OpenClaw 的工具调用
  const summary = `## 主题
[需要 LLM 生成 1 句话总结]

## 关键信息
${messages.slice(0, 5).map(m => `- ${m.substring(0, 50)}...`).join('\n')}

## 待办
- [ ] [需要提取待办事项]`;

  return summary;
}

/**
 * 写入记忆到 daily note
 * @param {string} content - 记忆内容
 */
function writeToDailyNote(content) {
  ensureMemoryDir();
  const todayFile = getTodayMemoryFile();
  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  
  let dailyContent = '';
  if (fs.existsSync(todayFile)) {
    dailyContent = fs.readFileSync(todayFile, 'utf-8');
  } else {
    const weekday = new Date().toLocaleDateString('zh-CN', { weekday: 'long' });
    dailyContent = `# ${getTodayStr()} ${weekday}\n\n`;
  }
  
  const newSection = `\n## 📝 对话记录\n\n### [${timestamp}] 自动捕捉\n${content}\n`;
  dailyContent += newSection;
  
  fs.writeFileSync(todayFile, dailyContent, 'utf-8');
  console.log(`[Memory-Master] 已写入 daily note: ${todayFile}`);
}

/**
 * 更新 MEMORY.md
 * @param {string} content - 要添加的内容
 */
function updateLongTermMemory(content) {
  ensureMemoryDir();
  
  let memoryContent = '';
  if (fs.existsSync(MEMORY_FILE)) {
    memoryContent = fs.readFileSync(MEMORY_FILE, 'utf-8');
  } else {
    memoryContent = `# MEMORY.md - 长期记忆\n\n这是 OpenClaw 的长期记忆文件。\n\n---\n\n*最后更新：${new Date().toISOString()}*\n`;
  }
  
  // 在"## 当前记忆"后插入新内容，如果没有这个标题就追加到末尾
  const insertMarker = '## 当前记忆';
  if (memoryContent.includes(insertMarker)) {
    const parts = memoryContent.split(insertMarker);
    memoryContent = parts[0] + insertMarker + '\n\n' + content + '\n' + parts[1];
  } else {
    memoryContent += `\n\n## 新增记忆 (${getTodayStr()})\n\n${content}\n`;
  }
  
  fs.writeFileSync(MEMORY_FILE, memoryContent, 'utf-8');
  console.log(`[Memory-Master] 已更新长期记忆：${MEMORY_FILE}`);
}

/**
 * 更新记忆图谱
 * @param {Object} newNode - 新节点
 * @param {Object} newEdge - 新边
 */
function updateMemoryGraph(newNode = null, newEdge = null) {
  ensureMemoryDir();
  
  let graph = { nodes: [], edges: [], lastUpdated: new Date().toISOString() };
  
  if (fs.existsSync(GRAPH_FILE)) {
    try {
      graph = JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf-8'));
    } catch (error) {
      console.error('[Memory-Master] 读取记忆图谱失败:', error);
    }
  }
  
  if (newNode && !graph.nodes.find(n => n.id === newNode.id)) {
    graph.nodes.push({ ...newNode, createdAt: new Date().toISOString() });
  }
  
  if (newEdge) {
    graph.edges.push({ ...newEdge, createdAt: new Date().toISOString() });
  }
  
  graph.lastUpdated = new Date().toISOString();
  fs.writeFileSync(GRAPH_FILE, JSON.stringify(graph, null, 2), 'utf-8');
  console.log(`[Memory-Master] 已更新记忆图谱：${GRAPH_FILE}`);
}

/**
 * 更新记忆系统状态
 * @param {Object} stateUpdate - 状态更新
 */
function updateMemoryState(stateUpdate) {
  ensureMemoryDir();
  
  let state = {
    lastCapture: null,
    lastOrganize: null,
    totalMemories: 0,
    graphNodes: 0,
    graphEdges: 0,
    config: { ...DEFAULT_CONFIG }
  };
  
  if (fs.existsSync(STATE_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch (error) {
      console.error('[Memory-Master] 读取状态失败:', error);
    }
  }
  
  Object.assign(state, stateUpdate);
  state.lastUpdated = new Date().toISOString();
  
  // 更新统计
  if (fs.existsSync(GRAPH_FILE)) {
    try {
      const graph = JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf-8'));
      state.graphNodes = graph.nodes.length;
      state.graphEdges = graph.edges.length;
    } catch (error) {}
  }
  
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * 加载记忆（用于重启后恢复）
 * @returns {string} - 加载的记忆内容
 */
function loadMemory() {
  ensureMemoryDir();
  
  const today = getTodayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  let memoryContent = '';
  
  // 读取昨天的 daily note
  const yesterdayFile = path.join(MEMORY_DIR, `${yesterday}.md`);
  if (fs.existsSync(yesterdayFile)) {
    memoryContent += `\n## 上次会话 (${yesterday})\n\n`;
    memoryContent += fs.readFileSync(yesterdayFile, 'utf-8').substring(0, 1000) + '...\n';
  }
  
  // 读取今天的 daily note（如果有）
  const todayFile = getTodayMemoryFile();
  if (fs.existsSync(todayFile)) {
    const content = fs.readFileSync(todayFile, 'utf-8');
    memoryContent += `\n## 今天 (${today})\n\n`;
    memoryContent += content.substring(0, 1000) + '...\n';
  }
  
  // 读取记忆图谱摘要
  if (fs.existsSync(GRAPH_FILE)) {
    try {
      const graph = JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf-8'));
      memoryContent += `\n## 记忆图谱\n\n`;
      memoryContent += `- 节点：${graph.nodes.length} 个\n`;
      memoryContent += `- 边：${graph.edges.length} 条\n`;
    } catch (error) {}
  }
  
  return memoryContent;
}

/**
 * 获取记忆系统状态
 * @returns {Object} - 状态信息
 */
function getMemoryStatus() {
  ensureMemoryDir();
  
  const status = {
    files: {},
    config: loadConfig(),
    stats: {}
  };
  
  // 检查文件
  const files = ['MEMORY.md', 'memory-graph.json', 'memory-state.json', getTodayMemoryFile()];
  files.forEach(file => {
    const filePath = path.join(MEMORY_DIR, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      status.files[file] = {
        size: `${(stats.size / 1024).toFixed(1)} KB`,
        lastModified: stats.mtime.toISOString()
      };
    } else {
      status.files[file] = { exists: false };
    }
  });
  
  // 读取状态
  if (fs.existsSync(STATE_FILE)) {
    try {
      status.stats = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch (error) {}
  }
  
  return status;
}

/**
 * 获取记忆图谱
 * @returns {Object} - 图谱数据
 */
function getMemoryGraph() {
  ensureMemoryDir();
  
  if (fs.existsSync(GRAPH_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf-8'));
    } catch (error) {
      console.error('[Memory-Master] 读取图谱失败:', error);
    }
  }
  
  return { nodes: [], edges: [], lastUpdated: null };
}

/**
 * 定期整理记忆
 */
async function organizeMemories() {
  const config = loadConfig();
  console.log('[Memory-Master] 开始定期整理记忆...');
  
  // 这里实现记忆整理逻辑
  // 1. 合并相似记忆
  // 2. 提炼长期记忆
  // 3. 删除过期信息
  // 4. 更新记忆图谱
  
  updateMemoryState({ lastOrganize: new Date().toISOString() });
  console.log('[Memory-Master] 定期整理完成');
}

/**
 * 捕获对话记忆
 * @param {Object[]} messages - 对话消息数组
 */
async function captureMemories(messages) {
  const config = loadConfig();
  console.log(`[Memory-Master] 开始捕获记忆，共 ${messages.length} 条消息`);
  
  let capturedCount = 0;
  
  for (const msg of messages) {
    const score = scoreImportance(msg.content || msg.text || '');
    
    if (score >= config.importanceThreshold) {
      console.log(`[Memory-Master] 捕获重要消息 (分数：${score}): ${msg.content?.substring(0, 50)}...`);
      
      // 写入 daily note
      writeToDailyNote(`- [${score}分] ${msg.content || msg.text}`);
      
      capturedCount++;
    }
  }
  
  updateMemoryState({ 
    lastCapture: new Date().toISOString(),
    totalMemories: capturedCount
  });
  
  console.log(`[Memory-Master] 捕获完成，共保存 ${capturedCount} 条记忆`);
  return capturedCount;
}

// 导出函数
module.exports = {
  loadConfig,
  ensureMemoryDir,
  scoreImportance,
  compressConversation,
  writeToDailyNote,
  updateLongTermMemory,
  updateMemoryGraph,
  updateMemoryState,
  loadMemory,
  getMemoryStatus,
  getMemoryGraph,
  organizeMemories,
  captureMemories
};

// 如果是直接运行，执行测试
if (require.main === module) {
  console.log('[Memory-Master] 测试运行...');
  console.log('重要性评分测试:', scoreImportance('记住这个项目很重要'));
  console.log('记忆目录:', MEMORY_DIR);
  ensureMemoryDir();
  console.log('测试完成');
}
