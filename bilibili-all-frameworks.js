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

async function searchAndExtract(keyword, target) {
  console.log(`\n搜索：${keyword}...`);
  const encodedKeyword = encodeURIComponent(keyword);
  await makeRequest(`/navigate?target=${target}&url=https://search.bilibili.com/all?keyword=${encodedKeyword}`);
  await new Promise(r => setTimeout(r, 5000));
  await makeRequest(`/scroll?target=${target}&direction=bottom`);
  await new Promise(r => setTimeout(r, 2000));
  
  const result = await makeRequest(
    `/eval?target=${target}`,
    `document.body.innerText`
  );
  
  const text = result.value || result.raw || '';
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  // 提取视频信息（标题、UP 主、播放量、时长）
  const videos = [];
  let currentVideo = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过导航菜单
    if (line.match(/^(首页 | 番剧 | 直播 | 游戏 | 大会员 | 消息 | 动态 | 收藏 | 历史 | 创作中心 | 投稿 | 搜索 | 综合 | 视频 | 番剧 | 影视 | 专栏 | 用户 | 综合排序 | 最多播放 | 最新发布 | 最多弹幕 | 最多收藏 | 更多筛选)$/)) {
      continue;
    }
    
    // 播放量（数字 + 万）
    if (line.match(/^[0-9.]+[万千万]?$/)) {
      if (currentVideo.title) {
        currentVideo.play = line;
      }
    }
    // 弹幕数
    else if (line.match(/^[0-9]+$/) && parseInt(line) < 10000) {
      if (currentVideo.play) {
        currentVideo.danmaku = line;
      }
    }
    // 时长
    else if (line.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
      if (currentVideo.title) {
        currentVideo.duration = line;
      }
    }
    // UP 主（带·的）
    else if (line.includes('·') && line.match(/\d{2}-\d{2}/)) {
      if (currentVideo.title) {
        currentVideo.up = line.split('·')[0].trim();
        currentVideo.date = line.split('·')[1].trim();
      }
    }
    // 标题（较长的文本）
    else if (line.length > 10 && line.length < 150 && !currentVideo.title) {
      currentVideo = { title: line };
    }
    
    // 如果视频信息完整，保存并重置
    if (currentVideo.title && currentVideo.play && currentVideo.duration) {
      videos.push({...currentVideo});
      currentVideo = {};
    }
  }
  
  return videos.slice(0, 8);
}

async function main() {
  const target = 'B0C72C682DDA81249A8784C2EAFE2052';
  
  const keywords = [
    'mem0 AI 记忆',
    'OpenViking 记忆',
    'MemGPT',
    '记忆宫殿 AI'
  ];
  
  const allResults = {};
  
  for (const keyword of keywords) {
    const videos = await searchAndExtract(keyword, target);
    allResults[keyword] = videos;
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // 输出汇总
  console.log('\n========================================');
  console.log('📊 AI Agent 记忆框架 B 站搜索结果');
  console.log('========================================\n');
  
  for (const [keyword, videos] of Object.entries(allResults)) {
    console.log(`\n### 🔹 ${keyword} (${videos.length} 个视频)\n`);
    if (videos.length === 0) {
      console.log('   暂无相关视频\n');
    } else {
      videos.forEach((v, i) => {
        console.log(`${i + 1}. ${v.title}`);
        console.log(`   UP: ${v.up || '未知'} | 播放：${v.play || '未知'} | 时长：${v.duration || '未知'}`);
        if (v.danmaku) console.log(`   弹幕：${v.danmaku}`);
        console.log('');
      });
    }
  }
}

main().catch(console.error);
