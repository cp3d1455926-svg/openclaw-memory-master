const http = require('http');

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

// 继续滚动查看第 4 题
http.get(`http://localhost:3456/scroll?target=${target}&y=2500`, (res) => {
  setTimeout(() => {
    http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/q4-complete.png`, (res) => {
      console.log('Q4 complete screenshot saved');
      
      // 获取第 4 题文本
      const script = `
        const q4 = document.querySelectorAll('.question, .exercise-item')[3];
        if (q4) {
          JSON.stringify({
            question: q4.innerText,
            options: Array.from(q4.querySelectorAll('.option, .choice, .answer-option')).map(o => o.innerText)
          })
        } else {
          JSON.stringify({error: 'Q4 not found'})
        }
      `;
      http.get(`http://localhost:3456/eval?target=${target}&script=${encodeURIComponent(script)}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log('Q4 content:', data));
      });
    });
  }, 1500);
});
