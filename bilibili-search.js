const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3456,
  path: '/eval?target=24E3ECDAFC5F43E47DE81437B63BBB95',
  method: 'POST'
};

const js = `
(() => {
  const videos = document.querySelectorAll('.video-card-common');
  const results = [];
  for (let i = 0; i < Math.min(videos.length, 15); i++) {
    const v = videos[i];
    const title = v.querySelector('.bili-video-card__info--tit');
    const up = v.querySelector('.bili-video-card__info--up');
    const play = v.querySelector('.bili-video-card__info--play');
    const time = v.querySelector('.bili-video-card__info--date');
    if (title && title.innerText) {
      results.push({
        title: title.innerText.trim(),
        up: up ? up.innerText.trim() : '未知',
        play: play ? play.innerText.trim() : '未知',
        time: time ? time.innerText.trim() : '未知'
      });
    }
  }
  return results;
})()
`;

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log(JSON.stringify(result.value, null, 2));
    } catch (e) {
      console.log('Error:', data);
    }
  });
});

req.write(js);
req.end();
