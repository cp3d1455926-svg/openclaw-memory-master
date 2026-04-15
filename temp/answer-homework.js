const http = require('http');

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

// 获取文章内容
const script = `
  JSON.stringify({
    article: document.querySelector('.reading-passage, .article, .passage, .text-content')?.innerText || 
             document.querySelector('.scroll-content, .content-box')?.innerText || '',
    questions: Array.from(document.querySelectorAll('.question, .exercise-item')).map(q => q.innerText).slice(0, 10)
  })
`;

http.get(`http://localhost:3456/eval?target=${target}&script=${encodeURIComponent(script)}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Extracted content:', data);
    
    // 滚动查看所有题目
    http.get(`http://localhost:3456/scroll?target=${target}&y=1000`, (res) => {
      setTimeout(() => {
        http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/questions.png`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => console.log('Questions screenshot:', data));
        });
      }, 500);
    });
  });
});
