/**
 * 实际场景测试 - 在 Jake 的电脑上运行
 */

const { autoCaptureMemories } = require('./auto-capture');
const { loadMemory, getMemoryStatus } = require('./index');

console.log('🎬 Memory-Master 实际场景测试 - Jake 的电脑\n');
console.log('='.repeat(60));

// 真实对话场景：Jake 和小鬼的对话
const realConversation = [
  { role: 'user', content: '小鬼，帮我测试一下 Memory-Master 的实际效果' },
  { role: 'assistant', content: '好的！我们来模拟一段真实对话。你想测试什么场景？' },
  { role: 'user', content: '记住我下周要参加数学竞赛，时间是 4 月 13 日' },
  { role: 'assistant', content: '收到！这个重要信息已经记住了。还有什么要记录的吗？' },
  { role: 'user', content: '待办事项：完成 Memory-Master 的测试报告' },
  { role: 'assistant', content: '好的，待办已记录。需要设置提醒吗？' },
  { role: 'user', content: '总之，今天要把所有功能测试完' },
  { role: 'assistant', content: '明白！我会自动捕捉这些重要信息。' }
];

async function runLiveTest() {
  console.log('\n📝 真实对话:\n');
  realConversation.forEach((msg, i) => {
    const icon = msg.role === 'user' ? '👤 Jake' : '🤖 小鬼';
    console.log(`${i+1}. ${icon}: ${msg.content.substring(0, 60)}${msg.content.length > 60 ? '...' : ''}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('\n开始自动记忆捕捉...\n');
  
  const result = await autoCaptureMemories(realConversation, {
    threshold: 40,
    updateGraph: true,
    debug: true
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ 测试结果:\n');
  console.log(`成功：${result.success}`);
  console.log(`捕获记忆数：${result.importantMessages.length}`);
  
  if (result.importantMessages.length > 0) {
    console.log('\n重要消息列表:\n');
    result.importantMessages.forEach((msg, i) => {
      console.log(`${i+1}. [${msg.score}分] ${msg.role === 'user' ? '👤 Jake' : '🤖 小鬼'}`);
      console.log(`   "${msg.content}"`);
      console.log(`   原因：${msg.reasons.join(', ')}\n`);
    });
  }
  
  console.log('='.repeat(60));
  console.log('\n💾 记忆系统状态:\n');
  const status = getMemoryStatus();
  console.log(`阈值：${status.config.importanceThreshold}`);
  console.log(`自动加载：${status.config.autoLoadOnStart}`);
  console.log(`记忆图谱：${status.config.enableGraph ? '✅ 启用' : '❌ 禁用'}`);
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📂 检查生成的文件:\n');
  
  const fs = require('fs');
  const path = require('path');
  const memoryDir = path.join(process.env.USERPROFILE, '.openclaw/workspace/memory');
  
  const today = new Date().toISOString().split('T')[0];
  const todayFile = path.join(memoryDir, `${today}.md`);
  
  if (fs.existsSync(todayFile)) {
    const stats = fs.statSync(todayFile);
    console.log(`✅ ${today}.md`);
    console.log(`   大小：${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   最后修改：${stats.mtime.toLocaleString('zh-CN')}`);
  } else {
    console.log(`❌ ${today}.md 不存在`);
  }
  
  const graphFile = path.join(memoryDir, 'memory-graph.json');
  if (fs.existsSync(graphFile)) {
    const graph = JSON.parse(fs.readFileSync(graphFile, 'utf-8'));
    console.log(`✅ memory-graph.json`);
    console.log(`   节点数：${graph.nodes.length}`);
    console.log(`   边数：${graph.edges.length}`);
  } else {
    console.log(`❌ memory-graph.json 不存在`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n🎉 实际场景测试完成！\n');
  
  console.log('下一步操作:\n');
  console.log('1. 查看记忆文件：Get-Content C:\\Users\\shenz\\.openclaw\\workspace\\memory\\2026-04-06.md');
  console.log('2. 查看记忆图谱：Get-Content C:\\Users\\shenz\\.openclaw\\workspace\\memory\\memory-graph.json');
  console.log('3. 测试加载记忆：在 OpenClaw 中输入 /load-memory');
  console.log('4. 查看记忆状态：在 OpenClaw 中输入 /memory-status\n');
}

runLiveTest().catch(console.error);
