/**
 * 实体提取模块 - 智能识别人名、项目、事件、任务等
 */

/**
 * 实体类型定义
 */
const ENTITY_TYPES = {
  PERSON: 'person',
  PROJECT: 'project',
  EVENT: 'event',
  TASK: 'task',
  FILE: 'file',
  DATE: 'date',
  URL: 'url'
};

/**
 * 人名关键词
 */
const PERSON_PATTERNS = [
  /([A-Z][a-z]+) 同学/,
  /([A-Z][a-z]+) 先生/,
  /([A-Z][a-z]+) 女士/,
  /([A-Z][a-z]+) 老师/,
  /(Jake|Alice|Bob|Tom|Mary|John)/,
  /@([a-zA-Z0-9_]+)/
];

/**
 * 项目关键词
 */
const PROJECT_KEYWORDS = ['项目', '技能', 'skill', '计划', '任务', '系统', '平台', '应用', 'APP'];

/**
 * 事件关键词
 */
const EVENT_KEYWORDS = ['竞赛', '比赛', '考试', '会议', '活动', '聚会', '旅行', '面试', '演讲', '秒杀'];

/**
 * 任务关键词
 */
const TASK_KEYWORDS = ['待办', 'todo', '要做', '完成', '实现', '开发', '测试', '修复', '优化'];

/**
 * 提取实体
 * @param {string} text - 文本内容
 * @returns {Array} - 实体列表 [{ type, name, raw }]
 */
function extractEntities(text) {
  const entities = [];
  
  // 1. 提取人名
  PERSON_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      const name = matches[1] || matches[0];
      entities.push({
        type: ENTITY_TYPES.PERSON,
        name: name.replace(/同学 | 先生 | 女士 | 老师 | @/g, ''),
        raw: matches[0]
      });
    }
  });
  
  // 2. 提取事件（优先级高于项目）
  EVENT_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword)) {
      // 避免重复
      if (!entities.find(e => e.raw === keyword)) {
        // 尝试提取完整事件名
        const eventPattern = new RegExp(`([^，。！？]+${keyword}[^，。！？]{0,20})`, 'i');
        const match = text.match(eventPattern);
        const eventName = match ? match[1].trim() : keyword;
        
        entities.push({
          type: ENTITY_TYPES.EVENT,
          name: eventName,
          raw: keyword
        });
      }
    }
  });
  
  // 3. 提取项目
  PROJECT_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword)) {
      // 尝试提取完整项目名
      const projectPattern = new RegExp(`([^，。！？]+${keyword}[^，。！？]{0,20})`, 'i');
      const match = text.match(projectPattern);
      const projectName = match ? match[1].trim() : keyword;
      
      // 避免重复提取
      if (!entities.find(e => e.name === projectName)) {
        entities.push({
          type: ENTITY_TYPES.PROJECT,
          name: projectName,
          raw: keyword
        });
      }
    }
  });
  
  // 4. 提取任务
  TASK_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword)) {
      const taskPattern = new RegExp(`([^，。！？]+${keyword}[^，。！？]{0,30})`, 'i');
      const match = text.match(taskPattern);
      const taskName = match ? match[1].trim() : keyword;
      
      entities.push({
        type: ENTITY_TYPES.TASK,
        name: taskName,
        raw: keyword
      });
    }
  });
  
  // 5. 提取日期
  const datePatterns = [
    /\d{4}年\d{1,2}月\d{1,2}日/,
    /\d{4}-\d{2}-\d{2}/,
    /(\d{1,2}月\d{1,2}日)/,
    /(今天 | 明天 | 后天 | 昨天 | 下周 | 上周 | 本周)/,
    /(早上 | 上午 | 中午 | 下午 | 晚上|凌晨)\d{1,2}点/
  ];
  
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      entities.push({
        type: ENTITY_TYPES.DATE,
        name: matches[0],
        raw: matches[0]
      });
    }
  });
  
  // 6. 提取 URL
  const urlPattern = /https?:\/\/[^\s]+/;
  const urlMatch = text.match(urlPattern);
  if (urlMatch) {
    entities.push({
      type: ENTITY_TYPES.URL,
      name: urlMatch[0],
      raw: urlMatch[0]
    });
  }
  
  // 7. 提取文件名
  const filePattern = /[^\s]+\.(md|js|py|json|txt|doc|pdf|png|jpg|svg)/;
  const fileMatch = text.match(filePattern);
  if (fileMatch) {
    entities.push({
      type: ENTITY_TYPES.FILE,
      name: fileMatch[0],
      raw: fileMatch[0]
    });
  }
  
  return entities;
}

/**
 * 识别实体间关系
 * @param {string} text - 文本内容
 * @param {Array} entities - 实体列表
 * @returns {Array} - 关系列表 [{ from, to, relation }]
 */
function extractRelations(text, entities) {
  const relations = [];
  
  // 关系关键词
  const relationPatterns = [
    { pattern: /参加 | 参与/, relation: 'participates_in' },
    { pattern: /创建 | 开发 | 制作 | 做/, relation: 'creates' },
    { pattern: /负责 | 主管 | 主导/, relation: 'leads' },
    { pattern: /依赖 | 基于 | 使用/, relation: 'depends_on' },
    { pattern: /包含 | 包括 | 有/, relation: 'contains' },
    { pattern: /提醒 | 通知 | 记得/, relation: 'reminds_about' },
    { pattern: /去 | 到 | 往/, relation: 'goes_to' }
  ];
  
  // 找出匹配的关系
  relationPatterns.forEach(({ pattern, relation }) => {
    if (pattern.test(text)) {
      // 简单策略：第一个实体 → 第二个实体
      if (entities.length >= 2) {
        const from = entities[0];
        const to = entities[1];
        
        // 避免自环
        if (from.name !== to.name) {
          relations.push({
            from: `${from.type}-${normalizeId(from.name)}`,
            to: `${to.type}-${normalizeId(to.name)}`,
            relation,
            text
          });
        }
      }
    }
  });
  
  return relations;
}

/**
 * 标准化 ID
 * @param {string} name - 名称
 * @returns {string} - 标准化 ID
 */
function normalizeId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

/**
 * 从文本提取完整信息
 * @param {string} text - 文本内容
 * @returns {Object} - { entities, relations }
 */
function extractFromText(text) {
  const entities = extractEntities(text);
  const relations = extractRelations(text, entities);
  
  return { entities, relations };
}

module.exports = {
  extractEntities,
  extractRelations,
  extractFromText,
  normalizeId,
  ENTITY_TYPES
};
