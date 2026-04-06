/**
 * 重要性评分算法模块 - 使用 includes 替代正则（避免编码问题）
 */

const SCORING_CONFIG = {
  keywords: ['项目', '决定', '待办', '记住', '重要', '偏好', '习惯', '任务', '计划', '目标', '需求', '功能', '设计', '开发', '部署', '上线', '测试', '修复', '优化', '重构'],
  explicitCommandsList: ['记住', '记下来', '别忘了', '记录', '保存', '务必', '一定'],
  dateKeywords: ['今天', '明天', '后天', '昨天', '下周', '上周', '本周', '年', '月', '日'],
  summaryKeywords: ['总之', '所以', '决定', '结论', '总的来说', '最终', '确定', '敲定'],
  nameKeywords: ['先生', '女士', '同学', '老师', '朋友', '家人', 'Jake', 'Alice', 'Bob'],
  continuityKeywords: ['继续', '然后', '接下来', '下一步', '随后', '接着'],
  emotionKeywords: ['太棒了', '太好了', '完美', '厉害', '牛逼', '卧槽', 'Amazing', 'Great', 'Perfect']
};

const WEIGHTS = {
  keywords: 10,
  explicitCommands: 30,
  date: 8,
  url: 8,
  number: 5,
  file: 8,
  summary: 20,
  qa: 8,
  code: 15,
  name: 8,
  emotion: 8,
  length: 10,
  continuity: 8
};

function containsAny(text, list) {
  return list.some(word => text.includes(word));
}

function calculateImportance(message, options = {}) {
  const { debug = false } = options;
  let score = 0;
  const reasons = [];
  
  if (!message || typeof message !== 'string') {
    return { score: 0, reasons: ['消息为空'] };
  }
  
  // 1. 关键词匹配（上限 30 分）
  let keywordCount = 0;
  SCORING_CONFIG.keywords.forEach(kw => {
    if (message.includes(kw)) keywordCount++;
  });
  if (keywordCount > 0) {
    const points = Math.min(keywordCount * WEIGHTS.keywords, 30);
    score += points;
    reasons.push(`关键词匹配 (${keywordCount}个，+${points}分)`);
  }
  
  // 2. 用户明确指令
  if (containsAny(message, SCORING_CONFIG.explicitCommandsList)) {
    score += WEIGHTS.explicitCommands;
    reasons.push(`用户明确指令 (+${WEIGHTS.explicitCommands}分)`);
  }
  
  // 3. 日期
  if (containsAny(message, SCORING_CONFIG.dateKeywords)) {
    score += WEIGHTS.date;
    reasons.push(`包含日期 (+${WEIGHTS.date}分)`);
  }
  
  // 4. URL
  if (/https?:\/\/[^\s]+/.test(message)) {
    score += WEIGHTS.url;
    reasons.push(`包含 URL (+${WEIGHTS.url}分)`);
  }
  
  // 5. 数字
  if (/\d+\.?\d*/.test(message)) {
    score += WEIGHTS.number;
    reasons.push(`包含数字 (+${WEIGHTS.number}分)`);
  }
  
  // 6. 文件名
  if (/[^\s]+\.(md|js|py|json|txt|doc|pdf|png|jpg|svg)/.test(message)) {
    score += WEIGHTS.file;
    reasons.push(`包含文件名 (+${WEIGHTS.file}分)`);
  }
  
  // 7. 总结性语句
  if (containsAny(message, SCORING_CONFIG.summaryKeywords)) {
    score += WEIGHTS.summary;
    reasons.push(`总结性语句 (+${WEIGHTS.summary}分)`);
  }
  
  // 8. 问题
  if (/[？?]/.test(message)) {
    score += WEIGHTS.qa;
    reasons.push(`问题/答案 (+${WEIGHTS.qa}分)`);
  }
  
  // 9. 代码内容
  if (/```|function|const|let|var|import|export|class|return|if|else|for|while/.test(message)) {
    score += WEIGHTS.code;
    reasons.push(`代码内容 (+${WEIGHTS.code}分)`);
  }
  
  // 10. 人名/称呼
  if (containsAny(message, SCORING_CONFIG.nameKeywords)) {
    score += WEIGHTS.name;
    reasons.push(`包含人名 (+${WEIGHTS.name}分)`);
  }
  
  // 11. 情感表达
  if (containsAny(message, SCORING_CONFIG.emotionKeywords)) {
    score += WEIGHTS.emotion;
    reasons.push(`情感表达 (+${WEIGHTS.emotion}分)`);
  }
  
  // 12. 消息长度
  const length = message.length;
  if (length > 100) {
    score += WEIGHTS.length;
    reasons.push(`长消息 (+${WEIGHTS.length}分)`);
  } else if (length > 50) {
    score += Math.floor(WEIGHTS.length / 2);
    reasons.push(`中等消息 (+${Math.floor(WEIGHTS.length / 2)}分)`);
  }
  
  // 13. 上下文连续
  if (containsAny(message, SCORING_CONFIG.continuityKeywords)) {
    score += WEIGHTS.continuity;
    reasons.push(`上下文连续 (+${WEIGHTS.continuity}分)`);
  }
  
  if (debug) {
    console.log('[Importance] 评分详情:', { message: message.substring(0, 100) + '...', score, reasons });
  }
  
  return { score, reasons };
}

function isImportant(message, threshold = 50) {
  return calculateImportance(message).score >= threshold;
}

function scoreBatch(messages, options = {}) {
  const { threshold = 50, debug = false } = options;
  return messages.map(msg => {
    const { score, reasons } = calculateImportance(msg, { debug });
    return { message: msg, score, reasons, isImportant: score >= threshold };
  });
}

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

module.exports = { calculateImportance, isImportant, scoreBatch, getScoreStats, SCORING_CONFIG, WEIGHTS };
