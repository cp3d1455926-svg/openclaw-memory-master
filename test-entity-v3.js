const { extractFromText } = require('./utils/entity-extractor-v3');

console.log('🧪 实体提取 v3 测试（智能去重 + 关系识别）\n');
console.log('='.repeat(70));

const tests = [
  {
    text: '记住我下周要参加数学竞赛，时间是 4 月 13 日',
    expect: '应该有：事件（数学竞赛）、日期（4 月 13 日/下周）'
  },
  {
    text: '待办事项：完成 Memory-Master 的测试报告',
    expect: '应该有：任务（待办事项...）'
  },
  {
    text: 'Jake 同学负责开发这个项目',
    expect: '应该有：人名（Jake）、关系（负责）、项目'
  },
  {
    text: '晚上 8 点提醒我去京东月黑风高秒杀',
    expect: '应该有：时间（晚上 8 点）、事件（秒杀）、关系（提醒）'
  },
  {
    text: '记住要修复这个 bug，文件在 utils/test.js',
    expect: '应该有：任务（修复 bug）、文件（utils/test.js）'
  }
];

tests.forEach((test, i) => {
  console.log(`\n测试 ${i+1}:`);
  console.log(`"${test.text}"`);
  console.log(`预期：${test.expect}\n`);
  
  const { entities, relations } = extractFromText(test.text);
  
  console.log('提取的实体:');
  if (entities.length === 0) {
    console.log('  (无)');
  } else {
    entities.forEach((e, j) => {
      console.log(`  ${j+1}. [${e.type}] "${e.name}" (置信度：${(e.confidence * 100).toFixed(0)}%)`);
    });
  }
  
  console.log('\n提取的关系:');
  if (relations.length === 0) {
    console.log('  (无)');
  } else {
    relations.forEach((r, j) => {
      console.log(`  ${j+1}. ${r.from} -[${r.relationLabel}]-> ${r.to}`);
      console.log(`     置信度：${(r.confidence * 100).toFixed(0)}%`);
    });
  }
  
  console.log('-'.repeat(70));
});

console.log('\n✅ v3 测试完成！\n');
