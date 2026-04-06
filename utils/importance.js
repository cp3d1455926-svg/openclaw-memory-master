/**
 * 重要性评分算法模块
 * 
 * 基于多维度评分判断对话是否值得记录
 */

/**
 * 评分配置
 */
const SCORING_CONFIG = {
  // 关键词匹配（+10 分/个）
  keywords: [
    '项目', '决定', '待办', '记住', '重要', '偏好', '习惯',
    '任务', '计划', '目标', '需求', '功能', '设计', '开发',
    '部署', '上线', '测试', '修复', '优化', '重构'
  ],
  
  // 用户明确指令（+30 分）
  explicitCommands: /记住 | 记下来 | 别忘了 | 记录 | 保存 | 写到记忆 | 添加到记忆/,
  
  // 日期格式（+5 分）
  datePattern: /\d{4}-\d{2}-\d{2}/,
  
  // URL（+5 分）
  urlPattern: /https?:\/\/[^\s]+/,
  
  // 数字（+3 分）
  numberPattern: /\d+\.?\d*/,
  
  // 文件名（+5 分）
  filePattern: /[^\s]+\.(md|js|py|json|txt|doc|pdf|png|jpg|svg)/,
  
  // 总结性语句（+15 分）
  summaryWords: /总之 | 所以 | 决定 | 结论 | 综上所述 | 总的来说 | 简而言之/,
  
  // 问题/答案（+8 分）
  qaPattern: /[？?]|^答：|^回答：/,
  
  // 代码内容（+10 分）
  codePattern: /```|function|const|let|var|import|export|class|return|if|else|for|while/,
  
  // 人名/称呼（+5 分）
  namePattern: /@[\w]+|[A-Z][a-z]+ [A-Z][a-z]+|先生 | 女士 | 同学 | 老师/,
  
  // 情感表达（+5 分）
  emotionPattern: /太棒了 | 太好了 | 完美 | 厉害 | 牛逼 | 卧槽 | Amazing|Great|Perfect/
};

/**
 * 评分权重
 */
const WEIGHTS = {
  keywords: 10,
  explicitCommands: 30,
  date: 5,
  url: 5,
  number: 3,
  file: 5,
  summary: 15,
  qa: 8,
  code: 10,
  name: 5,
  emotion: 5
};

/**
 * 计算重要性分数
 * @param {string} message - 对话消息
 * @param {Object} options - 可选配置
 * @returns {Object} - { score: number, reasons: string[] }
 */
function calculateImportance(message, options = {}) {
  const { debug = false } = options;
  let score = 0;
  const reasons = [];
  
  if (!message || typeof message !== 'string') {
    return { score: 0, reasons: ['消息为空'] };
  }
  
  // 1. 关键词匹配
  let keywordCount = 0;
  SCORING_CONFIG.keywords.forEach(kw => {
    if (message.includes(kw)) {
      keywordCount++;
    }
  });
  if (keywordCount > 0) {
    const points = keywordCount * WEIGHTS.keywords;
    score += points;
    reasons.push(`关键词匹配 (${keywordCount}个, +${points}分)`);
  }
  
  // 2. 用户明确指令
  if (SCORING_CONFIG.explicitCommands.test(message)) {
    score += WEIGHTS.explicitCommands;
    reasons.push(`用户明确指令 (+${WEIGHTS.explicitCommands}分)`);
  }
  
  // 3. 日期
  if (SCORING_CONFIG.datePattern.test(message)) {
    score += WEIGHTS.date;
    reasons.push(`包含日期 (+${WEIGHTS.date}分)`);
  }
  
  // 4. URL
  if (SCORING_CONFIG.urlPattern.test(message)) {
    score += WEIGHTS.url;
    reasons.push(`包含 URL (+${WEIGHTS.url}分)`);
  }
  
  // 5. 数字
  const numberMatches = message.match(SCORING_CONFIG.numberPattern);
  if (numberMatches && numberMatches.length > 0) {
    score += WEIGHTS.number;
    reasons.push(`包含数字 (+${WEIGHTS.number}分)`);
  }
  
  // 6. 文件名
  if (SCORING_CONFIG.filePattern.test(message)) {
    score += WEIGHTS.file;
    reasons.push(`包含文件名 (+${WEIGHTS.file}分)`);
  }
  
  // 7. 总结性语句
  if (SCORING_CONFIG.summaryWords.test(message)) {
    score += WEIGHTS.summary;
    reasons.push(`总结性语句 (+${WEIGHTS.summary}分)`);
  }
  
  // 8. 问题/答案
  if (SCORING_CONFIG.qaPattern.test(message)) {
    score += WEIGHTS.qa;
    reasons.push(`问题/答案 (+${WEIGHTS.qa}分)`);
  }
  
  // 9. 代码内容
  if (SCORING_CONFIG.codePattern.test(message)) {
    score += WEIGHTS.code;
    reasons.push(`代码内容 (+${WEIGHTS.code}分)`);
  }
  
  // 10. 人名/称呼
  if (SCORING_CONFIG.namePattern.test(message)) {
    score += WEIGHTS.name;
    reasons.push(`包含人名 (+${WEIGHTS.name}分)`);
  }
  
  // 11. 情感表达
  if (SCORING_CONFIG.emotionPattern.test(message)) {
    score += WEIGHTS.emotion;
    reasons.push(`情感表达 (+${WEIGHTS.emotion}分)`);
  }
  
  // 12. 消息长度奖励（超过 50 字 +5 分，超过 100 字 +10 分）
  const length = message.length;
  if (length > 100) {
    score += 10;
    reasons.push(`长消息 (+10 分)`);
  } else if (length > 50) {
    score += 5;
    reasons.push(`中等消息 (+5 分)`);
  }
  
  // 13. 上下文连续性奖励（如果包含"继续"、"然后"、"接下来"等词）
  const continuityPattern = /继续 | 然后 | 接下来 | 下一步 | 随后 | 接着/;
  if (continuityPattern.test(message)) {
    score += 5;
    reasons.push(`上下文连续 (+5 分)`);
  }
  
  if (debug) {
    console.log('[Importance] 评分详情:', {
      message: message.substring(0, 100) + '...',
      score,
      reasons
    });
  }
  
  return { score, reasons };
}

/**
 * 判断消息是否重要
 * @param {string} message - 对话消息
 * @param {number} threshold - 阈值（默认 50）
 * @returns {boolean}
 */
function isImportant(message, threshold = 50) {
  const { score } = calculateImportance(message);
  return score >= threshold;
}

/**
 * 批量评分
 * @param {string[]} messages - 消息数组
 * @param {Object} options - 可选配置
 * @returns {Array} - [{ message, score, reasons, isImportant }]
 */
function scoreBatch(messages, options = {}) {
  const { threshold = 50, debug = false } = options;
  
  return messages.map(msg => {
    const { score, reasons } = calculateImportance(msg, { debug });
    return {
      message: msg,
      score,
      reasons,
      isImportant: score >= threshold
    };
  });
}

/**
 * 获取评分统计
 * @param {string[]} messages - 消息数组
 * @param {number} threshold - 阈值
 * @returns {Object} - 统计信息
 */
function getScoreStats(messages, threshold = 50) {
  const scores = messages.map(msg => calculateImportance(msg).score);
  const importantCount = scores.filter(s => s >= threshold).length;
  
  return {
    total: messages.length,
    important: importantCount,
    unimportant: messages.length - importantCount,
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    maxScore: Math.max(...scores),
    minScore: Math.min(...scores),
    importantRate: (importantCount / messages.length * 100).toFixed(2) + '%'
  };
}

module.exports = {
  calculateImportance,
  isImportant,
  scoreBatch,
  getScoreStats,
  SCORING_CONFIG,
  WEIGHTS
};
