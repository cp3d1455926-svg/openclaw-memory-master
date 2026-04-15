const http = require('http');

const target = 'DEB4D0F0B714C568D423BD761CCAC807';

async function answerQuestion(questionIndex, optionIndex) {
  return new Promise((resolve) => {
    const script = `
      const options = document.querySelectorAll('.question, .exercise-item')[${questionIndex}]
        .querySelectorAll('.option, .choice, .answer-option, .radio-item');
      if (options[${optionIndex}]) {
        options[${optionIndex}].click();
        JSON.stringify({success: true, question: ${questionIndex + 1}, option: ${optionIndex + 1}})
      } else {
        JSON.stringify({success: false, question: ${questionIndex + 1}, optionsFound: options.length})
      }
    `;
    
    http.get(`http://localhost:3456/eval?target=${target}&script=${encodeURIComponent(script)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Question ${questionIndex + 1}:`, data);
        resolve(data);
      });
    });
  });
}

async function submitHomework() {
  console.log('📚 开始答题...\n');
  
  // 第 1 题：选 B（索引 1）- 40 岁
  await answerQuestion(0, 1);
  await new Promise(r => setTimeout(r, 500));
  
  // 第 2 题：选 A（索引 0）- Friday
  await answerQuestion(1, 0);
  await new Promise(r => setTimeout(r, 500));
  
  // 第 3 题：选 A（索引 0）- a card
  await answerQuestion(2, 0);
  await new Promise(r => setTimeout(r, 500));
  
  // 第 4 题：根据文章，画的是 flowers and cat，选对应选项（假设是 A 或 B）
  // 先截图看看第 4 题的选项
  http.get(`http://localhost:3456/scroll?target=${target}&y=1500`, (res) => {
    setTimeout(() => {
      http.get(`http://localhost:3456/screenshot?target=${target}&file=C:/Users/shenz/Desktop/q4-options.png`, (res) => {
        console.log('第 4 题选项截图已保存，请查看后告诉我选哪个选项（A=0, B=1, C=2, D=3）');
        
        // 查找提交按钮
        const submitScript = `
          const submitBtn = document.querySelector('.submit, .submit-btn, .finish-homework, .btn-submit');
          JSON.stringify({submitBtnFound: !!submitBtn})
        `;
        http.get(`http://localhost:3456/eval?target=${target}&script=${encodeURIComponent(submitScript)}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => console.log('提交按钮状态:', data));
        });
      });
    }, 1000);
  });
}

submitHomework();
