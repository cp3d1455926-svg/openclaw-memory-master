const http = require('http');

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

// 继续滚动到底部查看第 4 题
http.get(`http://localhost:3456/scroll?target=${target}&direction=bottom`, (res) => {
  setTimeout(() => {
    http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/bottom-view.png`, (res) => {
      console.log('Bottom view saved');
      
      // 获取所有题目数量
      const script = `
        const questions = document.querySelectorAll('.question, .exercise-item');
        JSON.stringify({
          totalQuestions: questions.length,
          allText: document.body.innerText.slice(-2000)
        })
      `;
      http.get(`http://localhost:3456/eval?target=${target}&script=${encodeURIComponent(script)}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log('Questions info:', data));
      });
    });
  }, 1500);
});
