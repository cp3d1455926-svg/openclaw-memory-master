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
  
  // 先导航到 22.2 万播放的视频（沧海九粟的记忆管理）
  // 从搜索结果看，这个视频在列表中，需要找到它的 BV 号
  // 先用搜索关键词找到这个视频
  console.log('导航到沧海九粟的记忆管理视频...');
  await makeRequest(`/navigate?target=${target}&url=https://www.bilibili.com/video/BV1KtPbeCEcX/`);
  
  // 等待加载
  await new Promise(r => setTimeout(r, 5000));
  
  // 提取视频详情
  console.log('提取视频详情...\n');
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
