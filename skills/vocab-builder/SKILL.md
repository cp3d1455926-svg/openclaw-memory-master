# Vocab Builder - 每日单词

📚 每日学习新单词，提升词汇量！

## 功能

- 每日推送新单词（支持英语、日语等）
- 单词详情：释义、例句、发音
- 单词卡片复习
- 学习进度追踪
- 支持自定义词库

## 使用方法

### 设置每日单词
```
每日单词 英语
每日单词 日语
每日单词 关闭
```

### 查询单词
```
查单词 apple
单词详情 programming
```

### 复习模式
```
复习单词
测试我
```

## 配置

在 `config.json` 中设置：
- `language`: 目标语言（en/jp/kr 等）
- `level`: 难度等级（1-5）
- `dailyCount`: 每日单词数
- `notifyTime`: 推送时间

## 文件结构

```
vocab-builder/
├── SKILL.md          # 技能说明
├── skill.json        # 技能配置
├── main.js           # 主程序
├── vocab-db.json     # 词库
└── user-progress.json # 用户进度
```

## 示例输出

```
📖 今日单词 #2024-03-21

**Epiphany** /ɪˈpɪfəni/
n. 顿悟；突然的领悟

📝 例句：
"She had an epiphany about her career direction."

💡 记忆技巧：
epi-(上面) + phany(显示) → 突然显现 → 顿悟

🎯 难度：⭐⭐⭐
```

## 开发者

小鬼 👻

## 版本

v1.0.0
