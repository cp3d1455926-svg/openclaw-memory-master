// 测试正则表达式
const explicitCommands = /记住 | 记下来 | 别忘了 | 记录 | 保存 | 写到记忆 | 添加到记忆 | 务必 | 一定/;
const summaryWords = /(总之 | 所以 | 决定 | 结论 | 综上所述 | 总的来说 | 简而言之 | 最终 | 确定 | 敲定)/;
const datePattern = /(\d{4}-\d{2}-\d{2}|\d{1,2}月\d{1,2}日 | 今天 | 明天 | 后天 | 昨天 | 下周 | 上周 | 本周)/;
const namePattern = /@[\w]+|[A-Z][a-z]+ [A-Z][a-z]+|先生 | 女士 | 同学 | 老师 | 朋友 | 家人 | Jake|Alice|Bob/;

const tests = [
  { text: '记住这个项目很重要', regex: explicitCommands, name: 'explicitCommands' },
  { text: '决定下周上线这个项目', regex: summaryWords, name: 'summaryWords' },
  { text: '决定下周上线这个项目', regex: datePattern, name: 'datePattern' },
  { text: '总之，我们决定用方案 A', regex: summaryWords, name: 'summaryWords' },
  { text: 'Jake 同学完成了 40 章小说', regex: namePattern, name: 'namePattern' },
];

tests.forEach(test => {
  const match = test.regex.test(test.text);
  console.log(`${test.name}: "${test.text}" => ${match ? '✅ 匹配' : '❌ 不匹配'}`);
});
