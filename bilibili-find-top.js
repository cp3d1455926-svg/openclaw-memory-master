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
  
  // 先搜索"沧海九粟 记忆管理"
  console.log('搜索沧海九粟的记忆管理视频...');
  await makeRequest(`/navigate?target=${target}&url=https://search.bilibili.com/all?keyword=%E6%B2%A7%E6%B5%B7%E4%B9%9D%E8%82%83%20%E8%AE%B0%E5%BF%86%E7%AE%A1%E7%90%86`);
  
  // 等待加载
  await new Promise(r => setTimeout(r, 4000));
  
  // 滚动页面
  await makeRequest(`/scroll?target=${target}&direction=bottom`);
  await new Promise(r => setTimeout(r, 2000));
  
  // 提取视频链接
  console.log('提取视频链接...\n');
  const result = await makeRequest(
    `/eval?target=${target}`,
    `
    (() => {
      const cards = document.querySelectorAll('[class*="video-card"], .video-card-common');
      const videos = [];
      for (let i = 0; i < Math.min(cards.length, 10); i++) {
        const card = cards[i];
        const link = card.querySelector('a[href*="/video/BV"]');
        const title = card.querySelector('[class*="tit"], .title');
        const up = card.querySelector('[class*="up"], .up-name');
        const play = card.querySelector('[class*="play"], .play');
        
        if (link && title) {
          const titleText = title.innerText.trim();
          if (titleText.includes('记忆') || titleText.includes('Agent')) {
            videos.push({
              href: link.href,
              title: titleText.substring(0, 80),
              up: up ? up.innerText.trim() : '未知',
              play: play ? play.innerText.trim() : '未知'
            });
          }
        }
      }
      return videos;
    })()
    `
  );
  
  const videos = result.value || [];
  console.log(`找到 ${videos.length} 个相关视频:\n`);
  videos.forEach((v, i) => {
    console.log(`${i + 1}. ${v.title}`);
    console.log(`   UP: ${v.up} | 播放：${v.play}`);
    console.log(`   链接：${v.href}\n`);
  });
}

main().catch(console.error);
