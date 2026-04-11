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
  const target = 'B0C72C682DDA81249A8784C2EAFE2052';
  
  // 搜索 mem0
  console.log('搜索 mem0 记忆框架...\n');
  await makeRequest(`/navigate?target=${target}&url=https://search.bilibili.com/all?keyword=mem0%20AI%20%E8%AE%B0%E5%BF%86`);
  await new Promise(r => setTimeout(r, 5000));
  await makeRequest(`/scroll?target=${target}&direction=bottom`);
  await new Promise(r => setTimeout(r, 2000));
  
  const result = await makeRequest(
    `/eval?target=${target}`,
    `document.body.innerText`
  );
  
  const text = result.value || result.raw || '';
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  console.log('mem0 搜索结果:\n');
  lines.slice(0, 100).forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length < 200 && !trimmed.match(/^(首页 | 番剧 | 直播 | 游戏 | 大会员 | 消息|动态 | 收藏 | 历史)$/)) {
      console.log(`${i + 1}. ${trimmed}`);
    }
  });
}

main().catch(console.error);
