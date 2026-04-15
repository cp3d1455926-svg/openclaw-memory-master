const http = require('http');

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

// 滚动到底部加载所有内容
http.get(`http://localhost:3456/scroll?target=${target}&direction=bottom`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Scrolled to bottom');
    
    setTimeout(() => {
      // 获取完整页面内容
      const script = `
        JSON.stringify({
          title: document.title,
          allText: document.body.innerText,
          questions: document.querySelectorAll('.question, .exercise, .item').length,
          content: document.querySelector('.content, .main, .homework-content')?.innerText || ''
        })
      `;
      http.get(`http://localhost:3456/eval?target=${target}&script=${encodeURIComponent(script)}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log('Content:', data));
      });
    }, 1000);
  });
});
