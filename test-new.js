// 测试新文件
const { calculateImportance, isImportant } = require('./utils/importance-new');

const tests = [
  '记住这个项目很重要',
  '决定下周上线这个项目',
  '待办：完成记忆捕捉模块',
  '用户偏好：喜欢深色主题',
  '会议链接：https://zoom.us/j/123456',
  '总之，我们决定用方案 A',
  '你好啊',
  '嗯嗯',
  'function test() { return true; }',
  'Jake 同学完成了 40 章小说'
];

console.log('测试新的重要性评分算法:\n');
tests.forEach((text, i) => {
  const { score, reasons } = calculateImportance(text);
  const important = score >= 50 ? '✅ 重要' : '⚪ 普通';
  console.log(`${i+1}. "${text}"`);
  console.log(`   分数：${score} | ${important}`);
  console.log(`   原因：${reasons.join(', ') || '无'}`);
  console.log('');
});
