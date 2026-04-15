const http = require('http');

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

// 截图
http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/17zuoye2.png`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Screenshot saved:', data));
});
