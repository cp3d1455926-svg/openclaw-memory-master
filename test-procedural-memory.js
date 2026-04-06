/**
 * 测试程序记忆模块
 */

const { ProceduralMemory } = require('./procedural-memory');

console.log('🧪 程序记忆模块测试\n');
console.log('='.repeat(60));

async function runTest() {
  const pm = new ProceduralMemory();
  
  // 测试 1: 列出所有经验
  console.log('\n1️⃣ 列出所有经验\n');
  const experiences = await pm.listExperiences();
  
  if (experiences.length === 0) {
    console.log('  (暂无经验)');
  } else {
    experiences.forEach(e => {
      console.log(`  - ${e.platform}: ${(e.size / 1024).toFixed(2)} KB`);
      console.log(`    文件：${e.file}`);
      console.log(`    最后更新：${e.lastModified}`);
    });
  }
  
  // 测试 2: 获取统计
  console.log('\n2️⃣ 统计信息\n');
  const stats = await pm.getStats();
  console.log(`  总数：${stats.total}`);
  console.log(`  总大小：${(stats.totalSize / 1024).toFixed(2)} KB`);
  console.log(`  平台：${stats.platforms.join(', ') || '无'}`);
  console.log(`  最后更新：${stats.lastUpdated || '无'}`);
  
  // 测试 3: 搜索经验
  console.log('\n3️⃣ 搜索经验\n');
  const keywords = ['PR', '发布', 'xsec_token'];
  
  for (const keyword of keywords) {
    console.log(`搜索 "${keyword}":`);
    const results = await pm.searchExperience(keyword);
    
    if (results.length === 0) {
      console.log('  (无结果)');
    } else {
      results.forEach(r => {
        console.log(`  - ${r.platform}`);
        console.log(`    上下文: ${r.context.length} 处`);
      });
    }
  }
  
  // 测试 4: 读取经验
  console.log('\n4️⃣ 读取经验\n');
  const platforms = ['github', 'xiaohongshu'];
  
  for (const platform of platforms) {
    console.log(`${platform}:`);
    const has = await pm.hasExperience(platform);
    
    if (has) {
      const content = await pm.getExperience(platform);
      const lines = content.split('\n');
      console.log(`  ✅ 存在`);
      console.log(`  行数：${lines.length}`);
      console.log(`  前 5 行:`);
      lines.slice(0, 5).forEach(line => {
        console.log(`    ${line.substring(0, 50)}${line.length > 50 ? '...' : ''}`);
      });
    } else {
      console.log(`  ❌ 不存在`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ 程序记忆模块测试完成！\n');
  
  console.log('📂 经验文件位置:');
  console.log(`  ${require('path').join(process.env.HOME || process.env.USERPROFILE, '.openclaw/workspace/memory/hooks/')}\n`);
}

runTest().catch(console.error);
