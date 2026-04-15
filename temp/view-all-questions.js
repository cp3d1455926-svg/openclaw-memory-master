const http = require('http');

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

// 滚动查看所有题目
async function scrollAndCapture() {
  const positions = [0, 500, 1000, 1500, 2000, 2500];
  
  for (let i = 0; i < positions.length; i++) {
    await new Promise((resolve) => {
      http.get(`http://localhost:3456/scroll?target=${target}&y=${positions[i]}`, (res) => {
        setTimeout(() => {
          http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/q${i+1}.png`, (res) => {
            console.log(`Screenshot ${i+1} saved at position ${positions[i]}`);
            resolve();
          });
        }, 800);
      });
    });
  }
  
  console.log('All questions captured!');
}

scrollAndCapture();
