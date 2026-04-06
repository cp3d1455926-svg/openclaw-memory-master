/**
 * 测试记忆巩固任务
 */

const { MemoryConsolidationManager } = require('./memory-consolidation');

console.log('🧪 测试记忆巩固任务\n');
console.log('='.repeat(60));

async function runTest() {
  const manager = new MemoryConsolidationManager();
  
  console.log('开始记忆巩固...\n');
  
  const result = await manager.run();
  
  console.log('='.repeat(60));
  console.log('\n📊 巩固结果:\n');
  console.log(`状态：${result.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`耗时：${result.duration}ms`);
  console.log(`处理记忆：${result.memoriesProcessed} 条`);
  console.log(`提取洞察：${result.insightsExtracted} 条`);
  
  if (result.error) {
    console.log(`错误：${result.error}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ 记忆巩固测试完成！\n');
}

runTest().catch(console.error);
