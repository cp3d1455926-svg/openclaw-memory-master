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
  
  console.log('提取视频详情...\n');
  
  const result = await makeRequest(
    `/eval?target=${target}`,
    `
    (() => {
      const info = {
        title: document.querySelector('[class*="tit"]')?.innerText || '未知',
        upName: document.querySelector('[class*="up-name"]')?.innerText || '未知',
        fans: document.querySelector('[class*="fans"]')?.innerText || '未知',
        play: document.querySelector('[class*="play"]')?.innerText || '未知',
        coins: document.querySelector('[class*="coin"]')?.innerText || '未知',
        likes: document.querySelector('[class*="like"]')?.innerText || '未知',
        pubdate: document.querySelector('[class*="pubdate"]')?.innerText || '未知',
        desc: document.querySelector('[class*="desc"]')?.innerText?.substring(0, 500) || '未知'
      };
      
      // 获取分 P 信息
      const episodes = document.querySelectorAll('[class*="episode"]');
      info.episodeCount = episodes.length;
      info.episodes = Array.from(episodes).slice(0, 10).map(ep => ({
        title: ep.querySelector('[class*="title"]')?.innerText || '未知',
        play: ep.querySelector('[class*="play"]')?.innerText || '未知'
      }));
      
      return info;
    })()
    `
  );
  
  console.log(JSON.stringify(result.value, null, 2));
}

main().catch(console.error);
