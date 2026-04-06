const { calculateImportance } = require('./utils/importance-v2');

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

console.log('测试 v2 版本 (使用 includes):\n');
tests.forEach((text, i) => {
  const { score, reasons } = calculateImportance(text);
  const important = score >= 50 ? '重要' : '普通';
  const icon = score >= 50 ? '' : '⚪';
  console.log(`${i+1}. "${text}"`);
  console.log(`   分数：${score} | ${icon} ${important}`);
  console.log(`   原因：${reasons.join(', ') || '无'}`);
  console.log('');
});
