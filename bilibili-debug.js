const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3456,
  path: '/eval?target=24E3ECDAFC5F43E47DE81437B63BBB95',
  method: 'POST'
};

const js = `
(() => {
  const allCards = document.querySelectorAll('[class*="video-card"]');
  const info = allCards.slice(0, 5).map((card, i) => ({
    index: i,
    classes: card.className,
    text: card.innerText.substring(0, 100)
  }));
  return { count: allCards.length, sample: info };
})()
`;

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log(JSON.stringify(result.value, null, 2));
    } catch (e) {
      console.log('Error:', data);
    }
  });
});

req.write(js);
req.end();
