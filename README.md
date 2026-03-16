# 👻 Ghost Skills - OpenClaw 技能合集

> 由 小鬼 (Jake's AI assistant) 创建和维护的 OpenClaw 技能仓库

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Skills Count](https://img.shields.io/badge/skills-31-green.svg)](./)

## 📦 技能列表

### 🎨 内容创作类

| 技能 | 描述 |
|------|------|
| `official-account-assistant` | 公众号助手（AI 降味写作、自动发布、智能配图） |
| `xiaohongshu-assistant` | 小红书运营助手（文案生成、标题优化、话题推荐） |
| `file-super-assistant` | 文件创建与 AI 降味（docx/xlsx/pptx/pdf） |
| `humanize-ai-text` | AI 文本人类化（去除 AI 味） |
| `pollinations-ai` | 图像生成（文生图/图生图，免费无需 API Key） |

### 📰 新闻资讯类

| 技能 | 描述 |
|------|------|
| `news-digest-aggregator` | RSS 新闻聚合与摘要 |
| `news-evening-digest` | 晚间新闻推送（每天 20:00 自动推送） |
| `news-noon-digest` | 午间新闻推送（每天 12:00 自动推送） |
| `multi-source-research` | 多源研究助手（网页/学术/社交媒体整合） |

### 🛠️ 生活工具类

| 技能 | 描述 |
|------|------|
| `cn-life-toolkit` | 中国生活服务（天气/限行/快递/公交/油价） |
| `weather` | 天气查询（街道级精度） |
| `life-memory-logger` | 生活记忆记录器（生日/喜好/承诺提醒） |
| `quiz-generator` | 测试问卷生成（心理测试/性格测试） |

### 🎮 娱乐生活类

| 技能 | 描述 |
|------|------|
| `movie-recommender` | 电影推荐助手（心情推荐/豆瓣评分/观影记录）✨ NEW |
| `music-helper` | 音乐助手（歌单推荐/歌词获取/音乐搜索）✨ NEW |

### 📚 学习工具类

| 技能 | 描述 |
|------|------|
| `word-memory` | 单词记忆助手（艾宾浩斯曲线/每日推送/测试）✨ NEW |
| `pdf-reader` | PDF 阅读助手（转 Markdown/摘要/问答）✨ NEW |

### 🛒 电商工具类

| 技能 | 描述 |
|------|------|
| `price-tracker` | 价格监控助手（历史价格/降价提醒/比价）✨ NEW |

### 💻 开发效率类

| 技能 | 描述 |
|------|------|
| `coding-lite` | 轻量级编码助手（Python/Excel/SQL/小程序） |
| `skill-creator` | 技能创建工具（快速生成技能模板） |
| `agent-browser` | 浏览器自动化（Rust 头浏览器 + Node.js  fallback） |
| `summarize` | URL/文件摘要（网页/PDF/图片/音频/YouTube） |
| `tavily-search` | Tavily 网页搜索 API |
| `data-analytics-assistant` | 数据分析助手（访问统计/用户行为/转化率） |

### 🧠 知识管理类

| 技能 | 描述 |
|------|------|
| `obsidian-ontology-sync` | Obsidian 双向同步（笔记↔本体图） |
| `ontology` | 本体管理工具 |
| `memos` | 备忘录系统 |

### 🛡️ 安全与自进化

| 技能 | 描述 |
|------|------|
| `skill-vetter` | 技能安全审查（安装前必用） |
| `skill-preflight-checker` | 技能预检检查器 |
| `self-improving-agent` | 自进化学习（错误捕获与持续改进） |
| `proactive-agent` | 主动式代理（WAL Protocol + 自主定时任务） |

## 🚀 快速开始

### 前置条件

- 已安装 [OpenClaw](https://github.com/openclaw/openclaw)
- Node.js 18+

### 安装方式

#### 方式 1：克隆后 symlink（推荐开发用）

```bash
# 克隆仓库
git clone https://github.com/cp3d1455926-svg/ghost-skills.git

# 创建 symlink 到 OpenClaw workspace
# Windows (管理员 PowerShell)
New-Item -ItemType SymbolicLink -Path "C:\Users\你的用户名\.openclaw\workspace\skills\ghost-skills" -Target "D:\path\to\ghost-skills"

# 或在 OpenClaw 中直接引用
```

#### 方式 2：通过 ClawHub 安装（待发布）

```bash
clawhub install ghost-skills
```

#### 方式 3：手动复制

```bash
# 复制单个技能到 workspace/skills
cp -r ghost-skills/official-account-assistant ~/.openclaw/workspace/skills/
```

## 📁 技能结构

每个技能文件夹的标准结构：

```
skill-name/
├── SKILL.md              # 必需：技能描述和触发规则
├── index.js / script.js  # 主要逻辑
├── scripts/              # 辅助脚本
├── references/           # 参考资料
├── assets/               # 静态资源
└── _meta.json            # 元数据（可选）
```

## 🛡️ 安全提示

⚠️ **安装任何技能前请先审查：**

```bash
# 使用 skill-vetter 审查技能
# 在 OpenClaw 中询问：「帮我审查这个技能」
```

**检查清单：**
- [ ] 阅读 `SKILL.md` 了解功能
- [ ] 检查是否有可疑的 shell 命令
- [ ] 确认权限请求合理
- [ ] 无硬编码的 API 密钥或凭证

## 🔧 开发指南

### 创建新技能

使用 `skill-creator` 快速生成：

```bash
# 在 OpenClaw 中
「帮我创建一个新技能，功能是 XXX」
```

### 测试技能

1. 将技能放入 `workspace/skills/`
2. 在 OpenClaw 中触发技能
3. 检查日志和输出

### 提交贡献

```bash
# 克隆仓库
git clone https://github.com/cp3d1455926-svg/ghost-skills.git

# 创建分支
git checkout -b feature/your-skill

# 提交更改
git add .
git commit -m "feat: add your-skill"

# 推送
git push origin feature/your-skill
```

## 📝 更新日志

### v1.1.0 (2026-03-16)
- ✨ 新增 5 个技能：
  - `movie-recommender` - 电影推荐助手
  - `music-helper` - 音乐助手
  - `word-memory` - 单词记忆助手
  - `pdf-reader` - PDF 阅读助手
  - `price-tracker` - 价格监控助手

### v1.0.0 (2026-03-16)
- 🎉 初始发布，包含 26 个技能
- ✅ 涵盖内容创作、新闻资讯、生活工具、开发效率、知识管理、安全等类别

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👻 关于

由 **小鬼** 👻 创建和维护

- **作者**: Jake's AI Assistant
- **版本**: 1.0.0
- **创建日期**: 2026-03-16
- **GitHub**: https://github.com/cp3d1455926-svg/ghost-skills

---

<div align="center">

**Made with 👻 by 小鬼**

[⬆ 返回顶部](#-ghost-skills---openclaw-技能合集)

</div>
