/**
 * 实体提取模块 v3 - 智能去重 + 上下文理解
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
 * 智能提取实体 - 避免重复，提取最相关的实体
 */
function extractEntities(text) {
  const entities = [];
  
  // 1. 提取人名（最高优先级）
  const personPatterns = [
    /([A-Z][a-z]+) 同学/,
    /([A-Z][a-z]+) 先生/,
    /([A-Z][a-z]+) 女士/,
    /([A-Z][a-z]+) 老师/,
    /(Jake|Alice|Bob|Tom|Mary|John)/,
    /@([a-zA-Z0-9_]+)/
  ];
  
  for (const pattern of personPatterns) {
    const match = text.match(pattern);
    if (match) {
      const name = match[1] || match[0];
      entities.push({
        type: ENTITY_TYPES.PERSON,
        name: name.replace(/同学 | 先生 | 女士 | 老师 | @/g, ''),
        confidence: 0.95
      });
      break; // 只取第一个人名
    }
  }
  
  // 2. 提取 URL（精确匹配，不会重复）
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    entities.push({
      type: ENTITY_TYPES.URL,
      name: urlMatch[0],
      confidence: 1.0
    });
  }
  
  // 3. 提取文件名（精确匹配）
  const fileMatch = text.match(/[^\s]+\.(md|js|py|json|txt|doc|pdf|png|jpg|svg)/);
  if (fileMatch) {
    entities.push({
      type: ENTITY_TYPES.FILE,
      name: fileMatch[0],
      confidence: 1.0
    });
  }
  
  // 4. 提取日期
  const datePatterns = [
    /\d{4}年\d{1,2}月\d{1,2}日/,
    /\d{4}-\d{2}-\d{2}/,
    /\d{1,2}月\d{1,2}日/,
    /(今天 | 明天 | 后天 | 昨天 | 下周 | 上周 | 本周)/
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      entities.push({
        type: ENTITY_TYPES.DATE,
        name: match[0],
        confidence: 0.9
      });
      break;
    }
  }
  
  // 5. 提取事件和时间
  const timeMatch = text.match(/(早上 | 上午 | 中午 | 下午 | 晚上 | 凌晨)\d{1,2}点/);
  if (timeMatch) {
    entities.push({
      type: ENTITY_TYPES.DATE,
      name: timeMatch[0],
      confidence: 0.85
    });
  }
  
  // 事件关键词（只提取一次）
  const eventKeywords = ['竞赛', '比赛', '考试', '会议', '活动', '聚会', '旅行', '面试', '演讲', '秒杀', '考试'];
  for (const keyword of eventKeywords) {
    if (text.includes(keyword)) {
      // 提取完整事件名：关键词前后各 10 个字
      const index = text.indexOf(keyword);
      const start = Math.max(0, index - 10);
      const end = Math.min(text.length, index + keyword.length + 10);
      let eventName = text.substring(start, end).trim();
      
      // 清理 eventName，去掉标点
      eventName = eventName.replace(/^[，。！？,\.!?\s]+/, '').replace(/[，。！？,\.!?\s]+$/, '');
      
      entities.push({
        type: ENTITY_TYPES.EVENT,
        name: eventName || keyword,
        confidence: 0.85
      });
      break; // 只取第一个事件
    }
  }
  
  // 6. 提取项目（避免与事件重复）
  const projectKeywords = ['项目', '技能', 'skill', '计划', '系统', '平台', '应用', 'APP'];
  for (const keyword of projectKeywords) {
    if (text.includes(keyword)) {
      const index = text.indexOf(keyword);
      const start = Math.max(0, index - 10);
      const end = Math.min(text.length, index + keyword.length + 10);
      let projectName = text.substring(start, end).trim();
      projectName = projectName.replace(/^[，。！？,\.!?\s]+/, '').replace(/[，。！？,\.!?\s]+$/, '');
      
      // 检查是否与已有实体重复
      const isDuplicate = entities.some(e => e.name === projectName);
      if (!isDuplicate && projectName !== keyword) {
        entities.push({
          type: ENTITY_TYPES.PROJECT,
          name: projectName,
          confidence: 0.8
        });
      }
      break;
    }
  }
  
  // 7. 提取任务（智能去重）
  const taskKeywords = ['待办', 'todo', '要', '完成', '实现', '开发', '测试', '修复', '优化'];
  const hasTaskKeyword = taskKeywords.some(kw => text.includes(kw));
  
  if (hasTaskKeyword) {
    // 提取整个句子作为任务
    const sentenceEnd = text.search(/[。！？!?]/) || text.length;
    const taskSentence = text.substring(0, sentenceEnd).trim();
    
    // 避免与已有实体重复
    const isDuplicate = entities.some(e => e.name === taskSentence);
    if (!isDuplicate && taskSentence.length > 3) {
      entities.push({
        type: ENTITY_TYPES.TASK,
        name: taskSentence,
        confidence: 0.75
      });
    }
  }
  
  return entities;
}

/**
 * 智能识别关系
 */
function extractRelations(text, entities) {
  if (entities.length < 2) return [];
  
  const relations = [];
  
  // 关系模式
  const relationPatterns = [
    { 
      pattern: /参加 | 参与/, 
      relation: 'participates_in',
      label: '参加'
    },
    { 
      pattern: /创建 | 开发 | 制作 | 做 | 写/, 
      relation: 'creates',
      label: '创建'
    },
    { 
      pattern: /负责 | 主管 | 主导/, 
      relation: 'leads',
      label: '负责'
    },
    { 
      pattern: /依赖 | 基于 | 使用/, 
      relation: 'depends_on',
      label: '依赖'
    },
    { 
      pattern: /提醒 | 通知 | 记得/, 
      relation: 'reminds_about',
      label: '提醒'
    },
    { 
      pattern: /去 | 到 | 往/, 
      relation: 'goes_to',
      label: '去'
    }
  ];
  
  for (const { pattern, relation, label } of relationPatterns) {
    if (pattern.test(text)) {
      // 找到关系词的位置
      const match = text.match(pattern);
      if (match) {
        const relationIndex = match.index;
        
        // 关系词之前的实体作为主语，之后的作为宾语
        const beforeText = text.substring(0, relationIndex);
        const afterText = text.substring(relationIndex + match[0].length);
        
        // 在前后文本中找实体
        let fromEntity = null;
        let toEntity = null;
        
        for (const entity of entities) {
          if (beforeText.includes(entity.name) && !fromEntity) {
            fromEntity = entity;
          }
          if (afterText.includes(entity.name) && !toEntity) {
            toEntity = entity;
          }
        }
        
        // 如果前后没找到，使用第一个和最后一个实体
        if (!fromEntity && entities.length > 0) {
          fromEntity = entities[0];
        }
        if (!toEntity && entities.length > 1) {
          toEntity = entities[entities.length - 1];
        }
        
        if (fromEntity && toEntity && fromEntity !== toEntity) {
          relations.push({
            from: `${fromEntity.type}-${normalizeId(fromEntity.name)}`,
            to: `${toEntity.type}-${normalizeId(toEntity.name)}`,
            relation,
            relationLabel: label,
            text,
            confidence: 0.8
          });
        }
      }
    }
  }
  
  return relations;
}

/**
 * 标准化 ID
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
