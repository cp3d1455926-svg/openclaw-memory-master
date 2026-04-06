/**
 * 自动记忆捕捉测试脚本
 */

const { autoCaptureMemories, organizeMemories } = require('./auto-capture');

console.log('🧪 自动记忆捕捉测试\n');
console.log('='.repeat(50));

// 模拟对话历史
const mockMessages = [
  { role: 'user', content: '你好啊' },
  { role: 'assistant', content: '你好！有什么可以帮你的吗？' },
  { role: 'user', content: '记住这个项目很重要，下周要上线' },
  { role: 'assistant', content: '好的，我已经记住了。项目上线时间是什么时候？' },
  { role: 'user', content: '决定用方案 A，总之这个方案最稳妥' },
  { role: 'assistant', content: '明白了，方案 A 有什么优势？' },
  { role: 'user', content: 'Jake 同学负责开发，待办：完成记忆捕捉模块' },
  { role: 'assistant', content: '收到，待办事项已记录。' },
  { role: 'user', content: '嗯嗯' },
  { role: 'assistant', content: '还有其他需要帮助的吗？' }
];

console.log('\n📝 模拟对话历史:\n');
mockMessages.forEach((msg, i) => {
  const icon = msg.role === 'user' ? '👤' : '🤖';
  console.log(`${i+1}. ${icon} ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
});

console.log('\n' + '='.repeat(50));
console.log('\n开始自动捕捉...\n');

// 测试自动捕捉
autoCaptureMemories(mockMessages, {
  threshold: 50,
  compress: false,
  updateGraph: true,
  debug: true
})
.then(result => {
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ 捕捉结果:\n');
  console.log(`成功：${result.success}`);
  console.log(`捕获记忆数：${result.captured.length}`);
  console.log(`重要消息数：${result.importantMessages.length}`);
  
  if (result.importantMessages.length > 0) {
    console.log('\n重要消息列表:');
    result.importantMessages.forEach((msg, i) => {
      console.log(`\n${i+1}. [${msg.score}分] ${msg.role}`);
      console.log(`   内容：${msg.content.substring(0, 80)}...`);
      console.log(`   原因：${msg.reasons.join(', ')}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n测试完成！\n');
})
.catch(error => {
  console.error('❌ 测试失败:', error);
});
