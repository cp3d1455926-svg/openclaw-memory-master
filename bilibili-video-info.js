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
  
  console.log('提取视频详细信息...\n');
  
  const result = await makeRequest(
    `/eval?target=${target}`,
    `
    (() => {
      // 获取标题
      const titleElem = document.querySelector('h1, [class*="tit"], .video-title, [class*="title"]');
      const title = titleElem ? titleElem.innerText.trim().substring(0, 200) : '未找到';
      
      // 获取 UP 主
      const upElem = document.querySelector('[class*="up"] [class*="name"], .up-name, a[class*="up"]');
      const upName = upElem ? upElem.innerText.trim() : '未找到';
      
      // 获取播放量、弹幕等
      const allSpans = document.querySelectorAll('span');
      const stats = Array.from(allSpans).map(s => s.innerText.trim()).filter(t => {
        return t.length > 0 && t.length < 50 && (t.match(/[0-9]/) || t.includes('万') || t.includes('点赞') || t.includes('收藏'));
      });
      
      // 获取简介
      const descElem = document.querySelector('[class*="desc"], .desc, [class*="content"]');
      const desc = descElem ? descElem.innerText.trim().substring(0, 500) : '未找到';
      
      return {
        title: title,
        upName: upName,
        stats: stats.slice(0, 15),
        desc: desc
      };
    })()
    `
  );
  
  const info = result.value || {};
  
  console.log('=== 视频详情 ===\n');
  console.log('📺 标题:', info.title || '未找到');
  console.log('\n👤 UP 主:', info.upName || '未找到');
  console.log('\n📊 统计信息:');
  (info.stats || []).forEach((stat, i) => console.log(`   ${i + 1}. ${stat}`));
  console.log('\n📝 简介:');
  console.log(info.desc || '未找到');
}

main().catch(console.error);
