const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3456,
  path: '/eval?target=24E3ECDAFC5F43E47DE81437B63BBB95',
  method: 'POST'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});

req.write('document.title');
req.end();
