const http = require('http');

function makeRequest(path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3456,
      path: path,
      method: body ? 'POST' : 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const target = '24E3ECDAFC5F43E47DE81437B63BBB95';
  
  // 先滚动到顶部
  console.log('滚动到顶部...');
  await makeRequest(`/scroll?target=${target}&y=0`);
  await new Promise(r => setTimeout(r, 1000));
  
  // 尝试点击第一个视频（吴恩达的那个）
  console.log('尝试提取视频链接...');
  const linksResult = await makeRequest(
    `/eval?target=${target}`,
    `
    (() => {
      const cards = document.querySelectorAll('[class*="video-card"]');
      const links = [];
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const link = card.querySelector('a[href*="/video/"]');
        const title = card.querySelector('[class*="tit"]');
        if (link && title && title.innerText.includes('吴恩达')) {
          links.push({
            href: link.href,
            title: title.innerText.substring(0, 50)
          });
        }
      }
      return links.slice(0, 3);
    })()
    `
  );
  
  console.log('找到吴恩达视频链接:');
  console.log(JSON.stringify(linksResult.value || linksResult.raw, null, 2));
}

main().catch(console.error);
