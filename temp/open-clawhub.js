const http = require('http');

http.get('http://localhost:3456/new?url=https://clawhub.ai/cp3d1455926-svg/openclaw-memory-master', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Opened ClawHub page:', data));
});
