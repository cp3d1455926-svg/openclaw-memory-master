const http = require('http');

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

// 使用 eval 获取所有题目
const script = `
  const questions = document.querySelectorAll('.question, .exercise-item, .homework-question');
  const result = {
    totalQuestions: questions.length,
    questions: Array.from(questions).map((q, i) => ({
      index: i,
      text: q.innerText.slice(0, 200),
      options: Array.from(q.querySelectorAll('.option, .choice, .answer-option, .radio-item')).map(o => o.innerText)
    }))
  };
  JSON.stringify(result)
`;

http.get(`http://localhost:3456/eval?target=${target}&script=${encodeURIComponent(script)}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('All questions:', data);
    
    // 截图整个页面
    http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/full-page.png`, (res) => {
      console.log('Full page screenshot saved');
    });
  });
});
