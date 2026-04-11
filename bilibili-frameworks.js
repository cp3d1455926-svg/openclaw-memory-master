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

async function searchFramework(keyword, target) {
  console.log(`\n搜索：${keyword}...`);
  await makeRequest(`/navigate?target=${target}&url=https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`);
  await new Promise(r => setTimeout(r, 4000));
  await makeRequest(`/scroll?target=${target}&direction=bottom`);
  await new Promise(r => setTimeout(r, 2000));
  
  const result = await makeRequest(
    `/eval?target=${target}`,
    `
    (() => {
      const cards = document.querySelectorAll('[class*="video-card"], .video-card-common');
      const videos = [];
      for (let i = 0; i < Math.min(cards.length, 15); i++) {
        const card = cards[i];
        const link = card.querySelector('a[href*="/video/BV"]');
        const title = card.querySelector('[class*="tit"], .title');
        const up = card.querySelector('[class*="up"], .up-name');
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
      return videos.slice(0, 5);
    })()
    `
  );
  
  return result.value || [];
}

async function main() {
  const target = 'B0C72C682DDA81249A8784C2EAFE2052';
  
  const frameworks = ['mem0', 'OpenViking', 'MemGPT', 'Letta', '记忆宫殿'];
  const results = {};
  
  for (const fw of frameworks) {
    const videos = await searchFramework(fw, target);
    results[fw] = videos;
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n========================================');
  console.log('📊 AI Agent 记忆框架搜索结果汇总');
  console.log('========================================\n');
  
  for (const [fw, videos] of Object.entries(results)) {
    console.log(`\n### 🔹 ${fw} (${videos.length} 个视频)`);
    if (videos.length === 0) {
      console.log('   暂无相关视频');
    } else {
      videos.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.title}`);
        console.log(`      UP: ${v.up} | 播放：${v.play}`);
      });
    }
  }
}

main().catch(console.error);
