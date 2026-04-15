const http = require('http');

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

// 先回答第 1 题：Aunt Jane 的年龄是 40（选项 B）
// 查找选项 B 的按钮并点击
const script = `
  const options = document.querySelectorAll('.option, .choice, .answer-option');
  console.log('Found options:', options.length);
  // 第 1 题的选项 B（40 岁）
  if (options[1]) {
    options[1].click();
    console.log('Clicked option 1-B');
  }
  JSON.stringify({clicked: true, optionsFound: options.length})
`;

http.get(`http://localhost:3456/eval?target=${target}&script=${encodeURIComponent(script)}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Click result:', data);
    
    // 截图查看效果
    setTimeout(() => {
      http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/after-click.png`, (res) => {
        console.log('Screenshot after click saved');
      });
    }, 1000);
  });
});
