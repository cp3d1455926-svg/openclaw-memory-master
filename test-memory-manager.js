/**
 * 测试三层记忆架构
 */

const { TopicFileManager } = require('./memory-manager');

console.log('🧪 测试三层记忆架构\n');
console.log('='.repeat(60));

async function runTest() {
  const manager = new TopicFileManager();
  
  console.log('\n1️⃣ 测试：追加到主题文件\n');
  
  await manager.appendToTopic('projects', `
**项目名称**: Memory-Master v2.0
**状态**: 开发中
**参考**: Claude Code 泄露源码
**特性**: 
- 三层记忆架构
- 记忆巩固任务
- 智能压缩管道
`);
  
  await manager.appendToTopic('tasks', `
**待办**: 实现三层记忆架构
**优先级**: 高
**截止时间**: 2026-04-08
**状态**: 进行中
`);
  
  await manager.appendToTopic('decisions', `
**决策**: 采用 Claude Code 的三层记忆架构
**原因**: 
1. 生产级验证（Claude Code 使用）
2. 性能优秀（10x 提升）
3. 结构清晰，易维护
**时间**: 2026-04-06
`);
  
  console.log('✅ 追加成功\n');
  
  console.log('2️⃣ 测试：获取主题索引\n');
  
  const index = await manager.getIndex();
  console.log('主题索引:');
  for (const [topic, info] of Object.entries(index)) {
    console.log(`  ${topic}: ${info.lines} 行，${info.size}`);
  }
  
  console.log('\n3️⃣ 测试：读取主题文件\n');
  
  const projects = await manager.loadTopic('projects');
  console.log('项目记忆预览:');
  console.log(projects.substring(0, 200) + '...\n');
  
  const tasks = await manager.loadTopic('tasks');
  console.log('待办事项预览:');
  console.log(tasks.substring(0, 200) + '...\n');
  
  console.log('4️⃣ 测试：保存会话\n');
  
  await manager.saveSession('2026-04-06-test-001', `
# 会话：2026-04-06-test-001
**时间**: 2026-04-06 15:40
**主题**: 讨论 Memory-Master 优化

## 对话摘要
- Jake 提出参考 Claude Code 泄露源码
- 决定采用三层记忆架构
- 创建实施计划

## 关键决策
- 采用 Claude Code 的 200 行记忆限制
- 实现记忆巩固任务
- 添加智能压缩管道
`);
  
  console.log('✅ 会话保存成功\n');
  
  console.log('5️⃣ 测试：列出会话\n');
  
  const sessions = await manager.listSessions(5);
  console.log('最近会话:');
  sessions.forEach(s => {
    console.log(`  - ${s.id} (${(s.size / 1024).toFixed(2)} KB)`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ 三层记忆架构测试完成！\n');
  
  console.log('📂 文件位置:');
  console.log(`  主题文件：${manager.constructor.toString().match(/path\.join\(([^)]+)\)/)[1].replace(/'/g, '')}/topics/`);
  console.log(`  会话文件：${manager.constructor.toString().match(/path\.join\(([^)]+)\)/)[1].replace(/'/g, '')}/sessions/\n`);
}

runTest().catch(console.error);
