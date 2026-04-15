const http = require('http');

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

// 先滚动到顶部
http.get(`http://localhost:3456/scroll?target=${target}&y=0`, (res) => {
  setTimeout(() => {
    // 截图完整页面
    http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/17zuoye-full.png&fullPage=true`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Full screenshot saved:', data);
        
        // 获取所有可见文本
        const script = `
          JSON.stringify({
            visibleText: document.body.innerText,
            homeworkContent: document.querySelector('.homework-content, .content, .main-content, .exercise-content')?.innerText || 'not found',
            articleText: document.querySelector('.article, .reading-passage, .passage, .text-content')?.innerText || ''
          })
        `;
        http.get(`http://localhost:3456/eval?target=${target}&script=${encodeURIComponent(script)}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => console.log('Text content:', data));
        });
      });
    });
  }, 500);
});
