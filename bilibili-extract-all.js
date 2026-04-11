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
  
  // 回到 AI Agent 记忆框架搜索页
  console.log('回到 AI Agent 记忆框架搜索页...');
  await makeRequest(`/navigate?target=${target}&url=https://search.bilibili.com/all?keyword=AI%20Agent%20%E8%AE%B0%E5%BF%86%E6%A1%86%E6%9E%B6`);
  
  // 等待加载
  await new Promise(r => setTimeout(r, 4000));
  
  // 滚动页面
  await makeRequest(`/scroll?target=${target}&direction=bottom`);
  await new Promise(r => setTimeout(r, 2000));
  
  // 提取所有视频链接和播放量
  console.log('提取视频信息...\n');
  const result = await makeRequest(
    `/eval?target=${target}`,
    `
    (() => {
      const cards = document.querySelectorAll('[class*="video-card"], .video-card-common');
      const videos = [];
      for (let i = 0; i < Math.min(cards.length, 30); i++) {
        const card = cards[i];
        const link = card.querySelector('a[href*="/video/BV"]');
        const title = card.querySelector('[class*="tit"], .title');
        const up = card.querySelector('[class*="up"], .up-name');
        // 播放量通常在 card 的某个位置
        const playElem = Array.from(card.querySelectorAll('span')).find(s => {
          const t = s.innerText.trim();
          return t.match(/^[0-9.]+[万千万]?$/);
        });
        
        if (link && title) {
          const titleText = title.innerText.trim();
          if (titleText.length > 5 && titleText.length < 150) {
            videos.push({
              href: link.href,
              title: titleText,
              up: up ? up.innerText.trim() : '未知',
              play: playElem ? playElem.innerText.trim() : '未知'
            });
          }
        }
      }
      return videos;
    })()
    `
  );
  
  const videos = result.value || [];
  console.log(`找到 ${videos.length} 个视频:\n`);
  
  // 按播放量排序（简单解析）
  videos.forEach((v, i) => {
    console.log(`${i + 1}. ${v.title}`);
    console.log(`   UP: ${v.up} | 播放：${v.play}`);
    console.log(`   链接：${v.href}\n`);
  });
}

main().catch(console.error);
