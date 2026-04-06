/**
 * 测试智能压缩管道
 */

const { ContextCompactionManager } = require('./context-compaction');

console.log('🧪 测试智能压缩管道\n');
console.log('='.repeat(60));

async function runTest() {
  const manager = new ContextCompactionManager();
  
  console.log('1️⃣ 检查是否需要压缩\n');
  const status = await manager.needsCompaction();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n2️⃣ 测试压缩管道\n');
  
  // 创建测试数据
  const testContext = `
# 测试记忆

## 重复内容 1
这是重复的内容
这是重复的内容
这是重复的内容

## 重复内容 2
这是重复的内容

## 长段落
第一行
第二行
第三行
第四行
第五行
第六行
第七行
第八行
第九行
第十行
第十一行
第十二行
第十三行
第十四行
第十五行
第十六行
第十七行
第十八行
第十九行
第二十行

## 重要信息
**这是重点内容**
- [ ] 待办事项 1
- [ ] 待办事项 2

## 旧记忆 (2025-01-01)
这是很旧的记忆，应该被删除

## 新记忆 (${new Date().toISOString()})
这是新的记忆，应该保留
`;
  
  console.log('原始内容长度:', testContext.length, '字符\n');
  
  const { compressed, stats } = await manager.compact(testContext);
  
  console.log('\n压缩后内容预览:\n');
  console.log(compressed.substring(0, 500) + '...\n');
  
  console.log('='.repeat(60));
  console.log('\n📊 压缩统计:\n');
  console.log(`原始长度：${stats.originalLength} 字符`);
  console.log(`最终长度：${stats.finalLength} 字符`);
  console.log(`总减少：${stats.totalReduction}`);
  console.log('\n各阶段效果:');
  stats.stages.forEach(stage => {
    if (stage.error) {
      console.log(`  ❌ ${stage.stage}: ${stage.error}`);
    } else {
      console.log(`  ✅ ${stage.stage}: ${stage.inputLength} → ${stage.outputLength} (${stage.reduction})`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ 智能压缩管道测试完成！\n');
}

runTest().catch(console.error);
