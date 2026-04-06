// 直接测试
const text1 = '记住这个项目很重要';
const text2 = '决定下周上线这个项目';
const text3 = '总之，我们决定用方案 A';

console.log('测试文本 1:', text1, '长度:', text1.length);
console.log('测试文本 2:', text2, '长度:', text2.length);
console.log('测试文本 3:', text3, '长度:', text3.length);

// 简单匹配
console.log('\n简单匹配测试:');
console.log('记住 in text1:', text1.includes('记住'));
console.log('决定 in text2:', text2.includes('决定'));
console.log('总之 in text3:', text3.includes('总之'));

// 正则匹配
console.log('\n正则匹配测试:');
console.log('/记住/.test(text1):', /记住/.test(text1));
console.log('/决定/.test(text2):', /决定/.test(text2));
console.log('/总之/.test(text3):', /总之/.test(text3));

// 完整正则
console.log('\n完整正则测试:');
console.log('/(记住 | 记录)/.test(text1):', /(记住 | 记录)/.test(text1));
console.log('/(决定 | 所以)/.test(text2):', /(决定 | 所以)/.test(text2));
console.log('/(总之 | 所以)/.test(text3):', /(总之 | 所以)/.test(text3));
