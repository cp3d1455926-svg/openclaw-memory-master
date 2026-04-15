const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\shenz\\.openclaw\\workspace\\skills\\memory-master\\src\\memory-classifier.js';
const fixedPath = 'C:\\Users\\shenz\\.openclaw\\workspace\\skills\\memory-master\\src\\memory-classifier-fixed.js';
const backupPath = 'C:\\Users\\shenz\\.openclaw\\workspace\\skills\\memory-master\\src\\memory-classifier.js.bak';

// 1. 备份原文件
console.log('📦 备份原文件...');
fs.copyFileSync(filePath, backupPath);
console.log('✓ 备份完成：' + backupPath);

// 2. 复制修复文件
console.log('\n🔧 应用修复...');
fs.copyFileSync(fixedPath, filePath);
console.log('✓ 修复完成：' + filePath);

// 3. 验证修复
const content = fs.readFileSync(filePath, 'utf8');
const hasOldKeywords = content.includes('ClassificationKeywords') || content.includes('scoreByKeywords');
const hasNewFeatures = content.includes('ClassificationFeatures') || content.includes('scoreByFeatures');

console.log('\n✅ 验证结果:');
console.log('  - 旧变量名 (Keywords):', hasOldKeywords ? '❌ 仍存在' : '✓ 已移除');
console.log('  - 新变量名 (Features):', hasNewFeatures ? '✓ 已更新' : '❌ 未找到');

console.log('\n✨ 修复完成！可以重新发布到 ClawHub 了');
