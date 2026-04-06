/**
 * 测试实体提取优化
 */

const { extractFromText } = require('./utils/entity-extractor');

console.log('🧪 实体提取优化测试\n');
console.log('='.repeat(60));

const testCases = [
  {
    text: '记住我下周要参加数学竞赛，时间是 4 月 13 日',
    expected: ['人名/实体', '事件：数学竞赛', '日期：4 月 13 日']
  },
  {
    text: '待办事项：完成 Memory-Master 的测试报告',
    expected: ['任务：完成...测试报告', '项目：Memory-Master']
  },
  {
    text: 'Jake 同学负责开发这个项目',
    expected: ['人名：Jake', '关系：负责', '项目']
  },
  {
    text: '晚上 8 点提醒我去京东月黑风高秒杀',
    expected: ['时间：晚上 8 点', '事件：秒杀', 'URL/平台：京东']
  },
  {
    text: '记住要修复这个 bug，文件在 utils/test.js',
    expected: ['任务：修复 bug', '文件：utils/test.js']
  }
];

testCases.forEach((test, i) => {
  console.log(`\n测试 ${i+1}: "${test.text}"\n`);
  
  const { entities, relations } = extractFromText(test.text);
  
  console.log('提取的实体:');
  entities.forEach((e, j) => {
    console.log(`  ${j+1}. [${e.type}] ${e.name}`);
  });
  
  if (relations.length > 0) {
    console.log('\n提取的关系:');
    relations.forEach((r, j) => {
      console.log(`  ${j+1}. ${r.from} -[${r.relation}]-> ${r.to}`);
    });
  } else {
    console.log('\n关系：无');
  }
  
  console.log('-'.repeat(60));
});

console.log('\n✅ 实体提取测试完成！\n');
