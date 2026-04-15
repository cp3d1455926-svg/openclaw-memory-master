const http = require('http');

function apiCall(endpoint, callback) {
  http.get(`http://localhost:3456/${endpoint}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => callback(data));
  });
}

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

// 修复缩放
const script = 'document.body.style.zoom = "100%"; document.documentElement.style.zoom = "100%"; window.scrollTo(0, 0);';
apiCall(`eval?target=${target}&script=${encodeURIComponent(script)}`, (result) => {
  console.log('Zoom fixed:', result);
  
  // 等待页面重新渲染
  setTimeout(() => {
    // 获取页面内容
    const contentScript = 'JSON.stringify({title: document.title, url: window.location.href, text: document.body.innerText.slice(0, 5000)})';
    apiCall(`eval?target=${target}&script=${encodeURIComponent(contentScript)}`, (result) => {
      console.log('Page content:', result);
    });
  }, 2000);
});
