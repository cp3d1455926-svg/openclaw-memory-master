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
  // 使用之前的搜索结果页 target
  const target = 'B0C72C682DDA81249A8784C2EAFE2052';
  
  // 先导航到新的搜索 URL
  console.log('导航到 AI Agent 记忆框架搜索页...');
  await makeRequest(`/navigate?target=${target}&url=https://search.bilibili.com/all?keyword=AI%20Agent%20%E8%AE%B0%E5%BF%86%E6%A1%86%E6%9E%B6`);
  
  // 等待加载
  await new Promise(r => setTimeout(r, 4000));
  
  // 滚动页面
  console.log('滚动页面...');
  await makeRequest(`/scroll?target=${target}&direction=bottom`);
  await new Promise(r => setTimeout(r, 2000));
  
  // 提取视频列表
  console.log('\n提取搜索结果...\n');
  const result = await makeRequest(
    `/eval?target=${target}`,
    `document.body.innerText`
  );
  
  const text = result.value || result.raw || '';
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  console.log('页面文本前 150 行:\n');
  lines.slice(0, 150).forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length < 200) {
      console.log(`${i + 1}. ${trimmed}`);
    }
  });
}

main().catch(console.error);
