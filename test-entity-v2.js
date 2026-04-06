const { extractFromText } = require('./utils/entity-extractor-v2');

console.log('🧪 实体提取 v2 测试（去重优化）\n');

const tests = [
  '记住我下周要参加数学竞赛，时间是 4 月 13 日',
  '待办事项：完成 Memory-Master 的测试报告',
  'Jake 同学负责开发这个项目',
  '晚上 8 点提醒我去京东月黑风高秒杀',
  '记住要修复这个 bug，文件在 utils/test.js'
];

tests.forEach((text, i) => {
  console.log(`\n${i+1}. "${text}"\n`);
  const { entities, relations } = extractFromText(text);
  
  console.log('实体:');
  entities.forEach((e, j) => {
    console.log(`  ${j+1}. [${e.type}] ${e.name}`);
  });
  
  if (relations.length > 0) {
    console.log('关系:');
    relations.forEach((r, j) => {
      console.log(`  ${j+1}. ${r.from} -[${r.relation}]-> ${r.to}`);
    });
  }
});

console.log('\n✅ 测试完成！\n');
