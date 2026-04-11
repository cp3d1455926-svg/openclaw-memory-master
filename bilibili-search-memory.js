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
  // 先获取新 tab 列表
  const targetsResult = await makeRequest('/targets');
  const targets = JSON.parse(targetsResult.raw || targetsResult.value);
  
  // 找到最新的 tab（应该是刚才打开的搜索结果页）
  const newTarget = targets[targets.length - 1];
  console.log('使用 target:', newTarget.targetId);
  
  // 等待页面加载
  await new Promise(r => setTimeout(r, 3000));
  
  // 滚动页面
  await makeRequest(`/scroll?target=${newTarget.targetId}&direction=bottom`);
  await new Promise(r => setTimeout(r, 2000));
  
  // 提取视频列表
  console.log('\n提取搜索结果...\n');
  const result = await makeRequest(
    `/eval?target=${newTarget.targetId}`,
    `
    (() => {
      const cards = document.querySelectorAll('[class*="video-card"], .video-card-common, [class*="result-item"]');
      const videos = [];
      for (let i = 0; i < Math.min(cards.length, 20); i++) {
        const card = cards[i];
        const title = card.querySelector('[class*="tit"], .title, [class*="title"]');
        const up = card.querySelector('[class*="up"], .up-name');
        const play = card.querySelector('[class*="play"], .play');
        const time = card.querySelector('[class*="time"], .time');
        
        if (title && title.innerText.trim().length > 0) {
          videos.push({
            title: title.innerText.trim().substring(0, 100),
            up: up ? up.innerText.trim() : '未知',
            play: play ? play.innerText.trim() : '未知',
            time: time ? time.innerText.trim() : '未知'
          });
        }
      }
      return videos;
    })()
    `
  );
  
  const videos = result.value || [];
  console.log(`找到 ${videos.length} 个视频:\n`);
  videos.forEach((v, i) => {
    console.log(`${i + 1}. ${v.title}`);
    console.log(`   UP: ${v.up} | 播放：${v.play} | 时长：${v.time}\n`);
  });
}

main().catch(console.error);
