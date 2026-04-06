/**
 * Memory-Master 测试脚本
 */

const { calculateImportance, isImportant, scoreBatch, getScoreStats } = require('./utils/importance');
const { loadConfig, ensureMemoryDir, getMemoryStatus, loadMemory } = require('./index');

console.log('🧪 Memory-Master 测试开始\n');
console.log('=' .repeat(50));

// 测试用例
const testCases = [
  { message: '记住这个项目很重要', expected: '高分（用户指令）' },
  { message: '决定下周上线这个项目', expected: '高分（决策 + 项目 + 日期）' },
  { message: '待办：完成记忆捕捉模块', expected: '高分（待办 + 任务）' },
  { message: '用户偏好：喜欢深色主题', expected: '高分（偏好）' },
  { message: '会议链接：https://zoom.us/j/123456', expected: '中高分（URL）' },
  { message: '总之，我们决定用方案 A', expected: '高分（总结 + 决定）' },
  { message: '你好啊', expected: '低分（日常对话）' },
  { message: '嗯嗯', expected: '低分（无意义）' },
  { message: 'function test() { return true; }', expected: '中分（代码）' },
  { message: 'Jake 同学完成了 40 章小说', expected: '高分（人名 + 数字 + 成就）' }
];

console.log('\n📊 测试用例评分:\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const { score, reasons } = calculateImportance(test.message, { debug: false });
  const important = isImportant(test.message, 50);
  
  const status = score >= 50 ? '✅ 重要' : '⚪ 普通';
  console.log(`${index + 1}. "${test.message}"`);
  console.log(`   分数：${score} | ${status} | 预期：${test.expected}`);
  console.log(`   原因：${reasons.join(', ') || '无'}`);
  console.log('');
  
  // 简单验证
  if ((test.expected.includes('高分') && score >= 50) ||
      (test.expected.includes('中分') && score >= 30 && score < 50) ||
      (test.expected.includes('低分') && score < 30)) {
    passed++;
  } else {
    failed++;
  }
});

console.log('=' .repeat(50));
console.log(`\n✅ 通过：${passed}/${testCases.length}`);
console.log(`❌ 失败：${failed}/${testCases.length}`);

// 批量测试
console.log('\n\n📈 批量测试统计:\n');
const messages = testCases.map(t => t.message);
const stats = getScoreStats(messages, 50);
console.log(`总消息数：${stats.total}`);
console.log(`重要消息：${stats.important} (${stats.importantRate})`);
console.log(`平均分数：${stats.averageScore.toFixed(2)}`);
console.log(`最高分数：${stats.maxScore}`);
console.log(`最低分数：${stats.minScore}`);

// 测试记忆系统
console.log('\n\n💾 记忆系统测试:\n');
ensureMemoryDir();
console.log('✅ 记忆目录已创建');

const status = getMemoryStatus();
console.log('✅ 记忆系统状态:');
console.log(`   配置文件：${JSON.stringify(status.config, null, 2).replace(/\n/g, '\n   ')}`);

const memory = loadMemory();
console.log('\n✅ 记忆加载测试完成');

console.log('\n' + '=' .repeat(50));
console.log('🎉 测试完成！\n');
