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
  
  // 先滚动页面
  console.log('滚动页面...');
  await makeRequest(`/scroll?target=${target}&direction=bottom`);
  
  // 等待一下
  await new Promise(r => setTimeout(r, 2000));
  
  // 获取页面结构
  console.log('获取页面结构...');
  const result = await makeRequest(
    `/eval?target=${target}`,
    `document.body.innerText.substring(0, 2000)`
  );
  
  console.log('页面文本预览:');
  console.log(result.value || result.raw);
}

main().catch(console.error);
