/**
 * 实体提取模块 v4 - 最终版本
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

function extractEntities(text) {
  const entities = [];
  
  // 1. 人名
  const personMatch = text.match(/([A-Z][a-z]+)(?:同学 | 先生 | 女士 | 老师)?/);
  if (personMatch && !/(先生 | 女士|同学 | 老师)$/.test(text.substring(0, personMatch.index + personMatch[0].length))) {
    entities.push({
      type: ENTITY_TYPES.PERSON,
      name: personMatch[1],
      confidence: 0.95
    });
  }
  
  // 2. URL
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    entities.push({ type: ENTITY_TYPES.URL, name: urlMatch[0], confidence: 1.0 });
  }
  
  // 3. 文件名
  const fileMatch = text.match(/[^\s]+\.(md|js|py|json|txt|doc|pdf|png|jpg|svg)/);
  if (fileMatch) {
    entities.push({ type: ENTITY_TYPES.FILE, name: fileMatch[0], confidence: 1.0 });
  }
  
  // 4. 日期
  const dateMatch = text.match(/\d{4}-\d{2}-\d{2}|\d{1,2}月\d{1,2}日 | 今天 | 明天 | 后天 | 昨天 | 下周 | 上周/);
  if (dateMatch) {
    entities.push({ type: ENTITY_TYPES.DATE, name: dateMatch[0], confidence: 0.9 });
  }
  
  // 5. 时间
  const timeMatch = text.match(/(?:早上 | 上午 | 中午 | 下午 | 晚上 | 凌晨)\d{1,2}点/);
  if (timeMatch) {
    entities.push({ type: ENTITY_TYPES.DATE, name: timeMatch[0], confidence: 0.85 });
  }
  
  // 6. 事件
  const eventKw = ['竞赛', '比赛', '考试', '会议', '活动', '聚会', '旅行', '面试', '演讲', '秒杀'];
  for (const kw of eventKw) {
    if (text.includes(kw)) {
      const idx = text.indexOf(kw);
      const name = text.substring(Math.max(0, idx - 5), Math.min(text.length, idx + kw.length + 5));
      entities.push({ type: ENTITY_TYPES.EVENT, name: name.trim(), confidence: 0.85 });
      break;
    }
  }
  
  // 7. 项目
  const projKw = ['项目', '技能', 'skill', '计划', '系统', '平台'];
  for (const kw of projKw) {
    if (text.includes(kw)) {
      const idx = text.indexOf(kw);
      const name = text.substring(Math.max(0, idx - 5), Math.min(text.length, idx + kw.length + 5));
      entities.push({ type: ENTITY_TYPES.PROJECT, name: name.trim(), confidence: 0.8 });
      break;
    }
  }
  
  // 8. 任务
  const taskKw = ['待办', '要', '完成', '实现', '开发', '测试', '修复'];
  for (const kw of taskKw) {
    if (text.includes(kw)) {
      const sentence = text.split(/[。！？!?]/)[0].trim();
      if (sentence.length > 3 && !entities.find(e => e.name === sentence)) {
        entities.push({ type: ENTITY_TYPES.TASK, name: sentence, confidence: 0.75 });
      }
      break;
    }
  }
  
  return entities;
}

function extractRelations(text, entities) {
  const patterns = [
    { re: /参加 | 参与/, rel: 'participates_in', label: '参加' },
    { re: /创建 | 开发 | 制作/, rel: 'creates', label: '创建' },
    { re: /负责 | 主管/, rel: 'leads', label: '负责' },
    { re: /提醒 | 通知/, rel: 'reminds_about', label: '提醒' },
    { re: /去 | 到/, rel: 'goes_to', label: '去' }
  ];
  
  for (const { re, rel, label } of patterns) {
    if (re.test(text) && entities.length >= 1) {
      // 找第 1 个非 TASK 实体作为主语
      const from = entities.find(e => e.type !== ENTITY_TYPES.TASK) || entities[0];
      // 找第 1 个 EVENT/PROJECT 作为宾语
      const to = entities.find(e => [ENTITY_TYPES.EVENT, ENTITY_TYPES.PROJECT].includes(e.type)) || entities[entities.length - 1];
      
      if (from && to && from.name !== to.name) {
        return [{
          from: `${from.type}-${normalizeId(from.name)}`,
          to: `${to.type}-${normalizeId(to.name)}`,
          relation: rel,
          relationLabel: label,
          text,
          confidence: 0.75
        }];
      }
    }
  }
  
  return [];
}

function normalizeId(name) {
  return name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-').replace(/-+/g, '-').substring(0, 50);
}

function extractFromText(text) {
  const entities = extractEntities(text);
  const relations = extractRelations(text, entities);
  return { entities, relations };
}

module.exports = { extractEntities, extractRelations, extractFromText, normalizeId, ENTITY_TYPES };
