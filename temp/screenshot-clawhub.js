const http = require('http');

const target = '347FEA77C8640FDD209F82251135AD94';

http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/clawhub-status2.png`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Screenshot saved:', data));
});
