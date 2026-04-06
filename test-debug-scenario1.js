const { calculateImportance } = require('./utils/importance');

const tests = [
  '记住，这个 skill 要解决 OpenClaw 重启后失忆的问题',
  '待办：1. 自动捕捉重要对话 2. 智能过滤 3. 记忆图谱 4. 定期整理',
  '决定分 3 个阶段：MVP → 完整版 → 10 倍愿景',
  '总之先实现自动捕捉和重要性评分，下周上线'
];

console.log('调试场景 1 的消息:\n');
tests.forEach((text, i) => {
  const { score, reasons } = calculateImportance(text);
  console.log(`${i+1}. "${text}"`);
  console.log(`   分数：${score}`);
  console.log(`   原因：${reasons.join(', ') || '无'}`);
  console.log('');
});
