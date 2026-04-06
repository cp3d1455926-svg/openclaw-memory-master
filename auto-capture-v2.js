/**
 * 自动记忆捕捉模块 v2 - 使用智能实体提取
 */

const fs = require('fs');
const path = require('path');
const { calculateImportance } = require('./utils/importance');
const { extractFromText, normalizeId } = require('./utils/entity-extractor');

const MEMORY_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw/workspace/memory');

/**
 * 获取今日记忆文件路径
 */
function getTodayMemoryFile() {
  const today = new Date().toISOString().split('T')[0];
  return path.join(MEMORY_DIR, `${today}.md`);
}

/**
 * 自动捕捉对话记忆 v2
 * @param {Object[]} messages - 对话消息数组
 * @param {Object} options - 配置选项
 */
async function autoCaptureMemories(messages, options = {}) {
  const {
    threshold = 40,
    updateGraph = true,
    debug = false
  } = options;

  console.log(`[Auto-Capture v2] 开始分析 ${messages.length} 条消息...`);
  
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  
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
        console.log(`[Auto-Capture v2] 发现重要消息 #${index}: ${score}分`);
      }
    }
  });
  
  console.log(`[Auto-Capture v2] 识别到 ${importantMessages.length} 条重要消息`);
  
  // 2. 写入记忆
  if (importantMessages.length > 0) {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const todayFile = getTodayMemoryFile();
    const today = new Date().toISOString().split('T')[0];
    const weekday = new Date().toLocaleDateString('zh-CN', { weekday: 'long' });
    
    // 读取或创建今日记忆文件
    let dailyContent = '';
    
    if (fs.existsSync(todayFile)) {
      dailyContent = fs.readFileSync(todayFile, 'utf8');
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
    const currentCount = parseInt(dailyContent.match(/- 重要记忆：(\d+) 条/)?.[1] || 0);
    dailyContent = dailyContent.replace(
      /- 重要记忆：\d+ 条/,
      `- 重要记忆：${currentCount + importantMessages.length} 条`
    );
    
    // 使用 UTF-8 无 BOM 编码写入
    fs.writeFileSync(todayFile, dailyContent, 'utf8');
    console.log(`[Auto-Capture v2] 已写入：${todayFile}`);
    
    // 3. 更新记忆图谱（使用智能实体提取）
    if (updateGraph) {
      const graphFile = path.join(MEMORY_DIR, 'memory-graph.json');
      let graph = { nodes: [], edges: [], lastUpdated: new Date().toISOString() };
      
      if (fs.existsSync(graphFile)) {
        try {
          graph = JSON.parse(fs.readFileSync(graphFile, 'utf8'));
        } catch (error) {
          console.error('[Auto-Capture v2] 读取图谱失败:', error);
        }
      }
      
      // 提取实体和关系
      importantMessages.forEach(msg => {
        const { entities, relations } = extractFromText(msg.content);
        
        // 添加实体节点
        entities.forEach(entity => {
          const nodeId = `${entity.type}-${normalizeId(entity.name)}`;
          
          if (!graph.nodes.find(n => n.id === nodeId)) {
            graph.nodes.push({
              id: nodeId,
              type: entity.type,
              name: entity.name,
              metadata: {
                source: msg.content.substring(0, 100),
                score: msg.score
              },
              createdAt: new Date().toISOString()
            });
            
            if (debug) {
              console.log(`[Auto-Capture v2] 添加节点：${nodeId} (${entity.type})`);
            }
          }
        });
        
        // 添加关系边
        relations.forEach(rel => {
          // 检查节点是否存在
          const fromExists = graph.nodes.find(n => n.id === rel.from);
          const toExists = graph.nodes.find(n => n.id === rel.to);
          
          if (fromExists && toExists) {
            const edgeExists = graph.edges.find(e => 
              e.from === rel.from && e.to === rel.to && e.relation === rel.relation
            );
            
            if (!edgeExists) {
              graph.edges.push({
                from: rel.from,
                to: rel.to,
                relation: rel.relation,
                text: rel.text,
                createdAt: new Date().toISOString()
              });
              
              if (debug) {
                console.log(`[Auto-Capture v2] 添加关系：${rel.from} -[${rel.relation}]-> ${rel.to}`);
              }
            }
          }
        });
      });
      
      graph.lastUpdated = new Date().toISOString();
      fs.writeFileSync(graphFile, JSON.stringify(graph, null, 2), 'utf8');
      console.log(`[Auto-Capture v2] 已更新记忆图谱：${graph.nodes.length} 个节点，${graph.edges.length} 条边`);
    }
    
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

module.exports = {
  autoCaptureMemories
};
