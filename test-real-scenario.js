/**
 * 真实场景测试脚本
 * 模拟真实的 OpenClaw 对话
 */

const { autoCaptureMemories } = require('./auto-capture');
const { loadMemory, getMemoryStatus } = require('./index');

console.log('🎬 真实场景测试 - 模拟 Jake 的日常对话\n');
console.log('='.repeat(60));

// 场景 1: 项目开发讨论
const scenario1 = [
  { role: 'user', content: '小鬼，帮我创建一个 memory-master skill' },
  { role: 'assistant', content: '好的！我来帮你设计这个技能。你想实现什么功能？' },
  { role: 'user', content: '记住，这个 skill 要解决 OpenClaw 重启后失忆的问题' },
  { role: 'assistant', content: '明白了！跨会话记忆连续性，这个需求很棒。具体要实现哪些功能？' },
  { role: 'user', content: '待办：1. 自动捕捉重要对话 2. 智能过滤 3. 记忆图谱 4. 定期整理' },
  { role: 'assistant', content: '收到！这四个功能很全面。我们分几个阶段开发？' },
  { role: 'user', content: '决定分 3 个阶段：MVP → 完整版 → 10 倍愿景' },
  { role: 'assistant', content: '很好的迭代策略！MVP 包含哪些功能？' },
  { role: 'user', content: '总之先实现自动捕捉和重要性评分，下周上线' },
  { role: 'assistant', content: '好的！我来创建项目结构。' }
];

// 场景 2: 日常聊天
const scenario2 = [
  { role: 'user', content: '早上好' },
  { role: 'assistant', content: '早上好！今天有什么计划？' },
  { role: 'user', content: '嗯嗯，随便聊聊' },
  { role: 'assistant', content: '好的，有什么有趣的事吗？' },
  { role: 'user', content: '还行吧' }
];

// 场景 3: 技术讨论
const scenario3 = [
  { role: 'user', content: '这个代码有问题：function test() { return undefined; }' },
  { role: 'assistant', content: '这个函数确实有问题，应该返回什么值？' },
  { role: 'user', content: '记住要修复这个 bug，文件在 utils/test.js' },
  { role: 'assistant', content: '好的，我来修复。' },
  { role: 'user', content: 'Jake 同学说这个功能很重要，用户反馈很多次了' },
  { role: 'assistant', content: '明白了，优先级很高。' }
];

async function runTest() {
  console.log('\n📝 场景 1: 项目开发讨论\n');
  const result1 = await autoCaptureMemories(scenario1, { threshold: 40, debug: true });
  console.log(`✅ 捕捉到 ${result1.importantMessages.length} 条重要记忆\n`);
  
  console.log('='.repeat(60));
  console.log('\n📝 场景 2: 日常聊天\n');
  const result2 = await autoCaptureMemories(scenario2, { threshold: 40, debug: true });
  console.log(`✅ 捕捉到 ${result2.importantMessages.length} 条重要记忆\n`);
  
  console.log('='.repeat(60));
  console.log('\n📝 场景 3: 技术讨论\n');
  const result3 = await autoCaptureMemories(scenario3, { threshold: 40, debug: true });
  console.log(`✅ 捕捉到 ${result3.importantMessages.length} 条重要记忆\n`);
  
  console.log('='.repeat(60));
  console.log('\n📊 测试结果汇总\n');
  console.log(`场景 1（项目）: ${result1.importantMessages.length} 条 - 应该多`);
  console.log(`场景 2（日常）: ${result2.importantMessages.length} 条 - 应该少`);
  console.log(`场景 3（技术）: ${result3.importantMessages.length} 条 - 应该中等`);
  
  console.log('\n' + '='.repeat(60));
  console.log('\n💾 记忆系统状态:\n');
  const status = getMemoryStatus();
  console.log(`配置文件：${JSON.stringify(status.config, null, 2).replace(/\n/g, '\n            ')}`);
  
  console.log('\n' + '='.repeat(60));
  console.log('\n🎉 真实场景测试完成！\n');
}

runTest().catch(console.error);
