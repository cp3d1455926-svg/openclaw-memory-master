const http = require('http');

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

// 滚动到第 4 题
http.get(`http://localhost:3456/scroll?target=${target}&y=2000`, (res) => {
  setTimeout(() => {
    // 截图第 4 题
    http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/question4.png`, (res) => {
      console.log('第 4 题截图已保存');
      
      // 选择第 3 题答案 A（a card）
      const q3script = `
        const q3 = document.querySelectorAll('.question, .exercise-item')[2];
        const options = q3.querySelectorAll('.option, .choice, .answer-option, .radio-item');
        if (options[0]) {
          options[0].click();
          console.log('Question 3 answered: A');
        }
        JSON.stringify({q3answered: true})
      `;
      http.get(`http://localhost:3456/eval?target=${target}&script=${encodeURIComponent(q3script)}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('Q3 result:', data);
          
          // 等待一下查看第 4 题
          setTimeout(() => {
            http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/q4-final.png`, (res) => {
              console.log('Q4 screenshot saved');
            });
          }, 1000);
        });
      });
    });
  }, 1000);
});
