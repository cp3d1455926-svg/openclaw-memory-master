// Vocab Builder - 每日单词学习
// 主程序

const fs = require('fs');
const path = require('path');

class VocabBuilder {
    constructor() {
        this.configPath = path.join(__dirname, 'config.json');
        this.progressPath = path.join(__dirname, 'user-progress.json');
        this.vocabPath = path.join(__dirname, 'vocab-db.json');
        
        this.config = this.loadConfig();
        this.progress = this.loadProgress();
        this.vocab = this.loadVocab();
    }

    loadConfig() {
        try {
            return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        } catch {
            return { language: 'en', level: 3, dailyCount: 5, notifyTime: '09:00' };
        }
    }

    loadProgress() {
        try {
            return JSON.parse(fs.readFileSync(this.progressPath, 'utf8'));
        } catch {
            return { learned: [], streak: 0, lastLearned: null, totalWords: 0 };
        }
    }

    loadVocab() {
        try {
            return JSON.parse(fs.readFileSync(this.vocabPath, 'utf8'));
        } catch {
            return this.getDefaultVocab();
        }
    }

    getDefaultVocab() {
        return {
            en: [
                {
                    word: "Epiphany",
                    pronunciation: "/ɪˈpɪfəni/",
                    type: "n.",
                    meaning: "顿悟；突然的领悟",
                    example: "She had an epiphany about her career direction.",
                    exampleCN: "她对自己的职业方向有了顿悟。",
                    memoryTip: "epi-(上面) + phany(显示) → 突然显现 → 顿悟",
                    level: 3
                },
                {
                    word: "Serendipity",
                    pronunciation: "/ˌserənˈdɪpəti/",
                    type: "n.",
                    meaning: "意外发现珍奇事物的本领；机缘凑巧",
                    example: "Finding this book was pure serendipity.",
                    exampleCN: "找到这本书纯属机缘凑巧。",
                    memoryTip: "来自斯里兰卡古名 Serendip + ity → 意外发现",
                    level: 4
                },
                {
                    word: "Resilience",
                    pronunciation: "/rɪˈzɪliəns/",
                    type: "n.",
                    meaning: "韧性；恢复力；弹力",
                    example: "The team showed great resilience after the defeat.",
                    exampleCN: "团队在失败后展现了强大的韧性。",
                    memoryTip: "re(回) + sil(跳) + ience → 弹回来 → 恢复力",
                    level: 3
                },
                {
                    word: "Eloquent",
                    pronunciation: "/ˈeləkwənt/",
                    type: "adj.",
                    meaning: "雄辩的；有说服力的；动人的",
                    example: "She gave an eloquent speech at the conference.",
                    exampleCN: "她在会议上发表了动人的演讲。",
                    memoryTip: "e(出) + loqu(说) + ent → 说出来的 → 雄辩的",
                    level: 3
                },
                {
                    word: "Pragmatic",
                    pronunciation: "/præɡˈmætɪk/",
                    type: "adj.",
                    meaning: "务实的；实用的； pragmatism 的形容词",
                    example: "We need a pragmatic approach to solve this problem.",
                    exampleCN: "我们需要务实的方法来解决这个问题。",
                    memoryTip: "pragm(做) + atic → 做的 → 务实的",
                    level: 4
                }
            ],
            jp: [
                {
                    word: "桜",
                    pronunciation: "さくら (sakura)",
                    type: "n.",
                    meaning: "樱花",
                    example: "桜が咲きました。",
                    exampleCN: "樱花开了。",
                    memoryTip: "日本国花，春天象征",
                    level: 1
                },
                {
                    word: "頑張る",
                    pronunciation: "がんばる (ganbaru)",
                    type: "v.",
                    meaning: "努力；加油；坚持",
                    example: "試験を頑張ります！",
                    exampleCN: "考试加油！",
                    memoryTip: "根張る → 扎根 → 坚持",
                    level: 2
                }
            ]
        };
    }

    async sendDailyWord() {
        const today = new Date().toISOString().split('T')[0];
        
        if (this.progress.lastLearned === today) {
            return "✅ 今日单词已学习过，明天再见！";
        }

        const vocabList = this.vocab[this.config.language] || this.vocab.en;
        const unlearnedWords = vocabList.filter(w => !this.progress.learned.includes(w.word));
        
        if (unlearnedWords.length === 0) {
            return "🎉 恭喜！所有单词已学完！词库更新中...";
        }

        const word = unlearnedWords[Math.floor(Math.random() * unlearnedWords.length)];
        
        this.progress.learned.push(word.word);
        this.progress.lastLearned = today;
        this.progress.totalWords++;
        this.progress.streak++;
        
        this.saveProgress();

        return `📖 今日单词 #${today}

**${word.word}** ${word.pronunciation}
${word.type} ${word.meaning}

📝 例句：
"${word.example}"
${word.exampleCN ? `_${word.exampleCN}_` : ''}

💡 记忆技巧：
${word.memoryTip}

🎯 难度：${'⭐'.repeat(word.level)}
🔥 学习天数：${this.progress.streak}天
📚 已学单词：${this.progress.totalWords}个

回复"复习单词"来巩固记忆！`
        ;
    }

    lookupWord(query) {
        const vocabList = this.vocab[this.config.language] || this.vocab.en;
        const word = vocabList.find(w => w.word.toLowerCase() === query.toLowerCase());
        
        if (!word) {
            return `❌ 未找到单词 "${query}"\n试试其他单词或回复"每日单词"学习新内容`;
        }

        return `📖 ${word.word} ${word.pronunciation}

${word.type} ${word.meaning}

📝 例句：
"${word.example}"
${word.exampleCN ? `_${word.exampleCN}_` : ''}

💡 记忆技巧：
${word.memoryTip}

🎯 难度：${'⭐'.repeat(word.level)}`
        ;
    }

    reviewWords() {
        const learnedWords = this.progress.learned.slice(-5);
        if (learnedWords.length === 0) {
            return "📚 还没有学过的单词，先学习每日单词吧！";
        }

        const vocabList = this.vocab[this.config.language] || this.vocab.en;
        const wordsToReview = vocabList.filter(w => learnedWords.includes(w.word));

        let reviewText = "📚 复习卡片\n\n";
        wordsToReview.forEach((w, i) => {
            reviewText += `${i + 1}. **${w.word}** - ${w.meaning}\n`;
        });
        reviewText += "\n回复"测试我"来进行小测验！";

        return reviewText;
    }

    quizUser() {
        const learnedWords = this.progress.learned;
        if (learnedWords.length < 3) {
            return "📚 至少学习 3 个单词后再测试哦！";
        }

        const vocabList = this.vocab[this.config.language] || this.vocab.en;
        const correctWord = vocabList.filter(w => learnedWords.includes(w.word))[Math.floor(Math.random() * learnedWords.length)];
        const options = vocabList.sort(() => 0.5 - Math.random()).slice(0, 4).map(w => w.meaning);
        
        if (!options.includes(correctWord.meaning)) {
            options[0] = correctWord.meaning;
        }

        this.currentQuiz = {
            word: correctWord.word,
            answer: correctWord.meaning,
            options: [...new Set(options)]
        };

        return `📝 小测试

"${this.currentQuiz.word}" 的意思是？

${this.currentQuiz.options.map((o, i) => `${i + 1}. ${o}`).join('\n')}

回复数字选择答案（1-4）`
        ;
    }

    checkQuizAnswer(answer) {
        if (!this.currentQuiz) {
            return "❌ 先回复"测试我"开始测验！";
        }

        const selected = this.currentQuiz.options[parseInt(answer) - 1];
        const isCorrect = selected === this.currentQuiz.answer;

        if (isCorrect) {
            this.progress.streak++;
            this.saveProgress();
            return `✅ 正确！"${this.currentQuiz.word}" 就是 ${this.currentQuiz.answer} 的意思\n🔥 连续答对：${this.progress.streak}次`;
        } else {
            this.progress.streak = 0;
            this.saveProgress();
            return `❌ 不对哦\n"${this.currentQuiz.word}" 的正确意思是：${this.currentQuiz.answer}\n继续加油！`;
        }
    }

    showProgress() {
        return `📊 学习进度

🔥 连续学习：${this.progress.streak}天
📚 已学单词：${this.progress.totalWords}个
📅 最近学习：${this.progress.lastLearned || '暂无'}
🎯 目标语言：${this.config.language === 'en' ? '英语' : this.config.language === 'jp' ? '日语' : this.config.language}
📖 词库总量：${(this.vocab[this.config.language] || this.vocab.en).length}个

回复"每日单词 [语言]"切换语言（英语/日语）`
        ;
    }

    setDailyWord(language) {
        const langMap = {
            '英语': 'en',
            '日语': 'jp',
            '韩语': 'kr',
            'en': 'en',
            'jp': 'jp',
            'kr': 'kr'
        };

        const langCode = langMap[language] || language;
        if (!this.vocab[langCode]) {
            return `❌ 不支持的语言：${language}\n支持：英语、日语、韩语`;
        }

        this.config.language = langCode;
        this.saveConfig();

        return `✅ 已设置为${language}单词\n回复"每日单词"开始学习！`
        ;
    }

    saveConfig() {
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    }

    saveProgress() {
        fs.writeFileSync(this.progressPath, JSON.stringify(this.progress, null, 2));
    }
}

module.exports = VocabBuilder;
