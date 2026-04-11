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
  
  console.log('获取视频统计信息...\n');
  
  const result = await makeRequest(
    `/eval?target=${target}`,
    `
    (() => {
      // 获取所有包含数字和中文的统计信息
      const stats = document.querySelectorAll('[class*="stat"] span, .stat-item span, [class*="info"] span');
      const allText = Array.from(stats).map(s => s.innerText.trim()).filter(t => t.length > 0 && t.length < 50);
      
      // 获取标题
      const titleElem = document.querySelector('h1, [class*="title"], .video-title');
      const title = titleElem ? titleElem.innerText.trim().substring(0, 200) : '未知';
      
      // 获取 UP 主
      const upElem = document.querySelector('[class*="up"] [class*="name"], .up-name, a[class*="up"]');
      const upName = upElem ? upElem.innerText.trim() : '未知';
      
      return {
        title: title,
        upName: upName,
        allStats: allText.slice(0, 20)
      };
    })()
    `
  );
  
  console.log('标题:', result.value?.title);
  console.log('UP 主:', result.value?.upName);
  console.log('\n统计信息:');
  (result.value?.allStats || []).forEach((stat, i) => console.log(`  ${i + 1}. ${stat}`));
}

main().catch(console.error);
