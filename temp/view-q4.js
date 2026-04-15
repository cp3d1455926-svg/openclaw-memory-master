const http = require('http');

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

// 滚动到第 4 题位置
http.get(`http://localhost:3456/scroll?target=${target}&y=2000`, (res) => {
  setTimeout(() => {
    http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/q4-clear.png`, (res) => {
      console.log('Q4 screenshot:', res);
      
      // 获取第 4 题文本
      const script = `
        JSON.stringify({
          q4: document.querySelectorAll('.question, .exercise-item')[3]?.innerText || 'not found'
        })
      `;
      http.get(`http://localhost:3456/eval?target=${target}&script=${encodeURIComponent(script)}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log('Q4 text:', data));
      });
    });
  }, 1000);
});
