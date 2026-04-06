# 🧠 OpenClaw Memory-Master

**OpenClaw 超级记忆增强 Skill - 让 AI 拥有跨会话记忆连续性**

[![ClawHub](https://img.shields.io/badge/ClawHub-skill-blue)](https://clawhub.ai)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-skill-green)](https://openclaw.ai)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ 特性

- 🎯 **智能记忆捕捉** - 自动识别对话中的重要信息（项目、决策、待办、用户偏好）
- 🧠 **重要性评分** - 基于规则和语义分析，只记住真正重要的内容
- 🗂️ **记忆关联图谱** - 自动链接相关记忆（人→项目→任务→文件）
- 🔄 **定期整理** - 像人睡觉一样，后台自动提炼/合并/删除过期记忆
- ⚡ **重启自动加载** - 新会话开始时自动恢复关键上下文
- 📊 **记忆可视化** - Markdown 格式的记忆图谱，可浏览/搜索

---

## 🚀 快速开始

### 安装

```bash
# 通过 ClawHub 安装（推荐）
npx clawhub install openclaw-memory-master

# 或手动安装
git clone https://github.com/cp3d1455926/openclaw-memory-master.git
cp -r openclaw-memory-master ~/.openclaw/workspace/skills/memory-master
```

### 使用

安装后自动激活，无需额外配置。

**手动命令**（可选）：
```
/load-memory    # 手动加载上次会话记忆
/save-memory    # 手动保存当前会话记忆
/memory-status  # 查看记忆系统状态
/memory-graph   # 查看记忆关联图谱
```

---

## 📁 项目结构

```
memory-master/
├── README.md           # 本文件
├── SKILL.md            # OpenClaw Skill 定义
├── index.js            # 主入口
├── memory-capture.js   # 记忆捕捉模块
├── memory-filter.js    # 智能过滤模块
├── memory-organize.js  # 定期整理模块
├── memory-graph.js     # 记忆图谱模块
├── utils/
│   └── importance.js   # 重要性评分算法
└── DESIGN.md           # 设计文档
```

---

## 🧠 工作原理

### 1. 记忆捕捉
监控对话历史，自动识别重要信息：
- 项目进展和决策
- 待办事项和任务
- 用户偏好和习惯
- 重要数据（日期、URL、数字）

### 2. 重要性评分
基于多维度评分决定是否写入记忆：
```javascript
评分维度：
- 关键词匹配（项目、决定、待办...）+10 分
- 用户明确指令（"记住这个"）+30 分
- 包含具体数据（日期、URL）+5 分
- 总结性语句（"总之"、"所以"）+15 分

阈值：> 50 分 → 写入记忆
```

### 3. 记忆压缩
使用 LLM 生成结构化摘要：
```markdown
## 主题
[1 句话总结]

## 关键信息
- [要点 1]
- [要点 2]

## 待办
- [ ] [任务 1]
- [ ] [任务 2]
```

### 4. 记忆图谱
JSON 格式存储关联关系：
```json
{
  "nodes": [
    { "id": "person-jake", "type": "person", "name": "Jake" },
    { "id": "project-novel", "type": "project", "name": "觉醒之鬼" }
  ],
  "edges": [
    { "from": "person-jake", "to": "project-novel", "relation": "created" }
  ]
}
```

### 5. 定期整理
Cron 定时任务（每天凌晨 3 点）：
- 合并相似记忆
- 提炼长期记忆
- 删除过期信息
- 更新记忆图谱

---

## 📊 记忆文件位置

```
~/.openclaw/workspace/memory/
├── MEMORY.md              # 长期记忆（主文件）
├── memory-graph.json      # 记忆关联图谱
├── memory-state.json      # 记忆系统状态
└── YYYY-MM-DD.md          # 每日记忆（自动创建）
```

---

## 🔧 配置（可选）

在 `~/.openclaw/workspace/skills/memory-master/config.json` 中配置：

```json
{
  "importanceThreshold": 50,    // 重要性阈值（默认 50）
  "autoLoadOnStart": true,      // 启动时自动加载记忆（默认 true）
  "organizeSchedule": "0 3 * * *", // 定期整理时间（默认每天 3 点）
  "maxMemoryAge": 30,           // 记忆最大保存天数（默认 30 天）
  "enableGraph": true           // 启用记忆图谱（默认 true）
}
```

---

## 🧪 开发

### 本地测试

```bash
cd ~/.openclaw/workspace/skills/memory-master
npm install  # 如果有依赖
```

### 调试模式

在 OpenClaw 配置中启用调试日志：
```json
{
  "skills": {
    "memory-master": {
      "debug": true
    }
  }
}
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 更新日志

### v0.1.0 (2026-04-06)
- ✨ 初始版本
- ✅ 智能记忆捕捉
- ✅ 重要性评分
- ✅ 定期整理
- ✅ 记忆图谱

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [OpenClaw](https://openclaw.ai) - 强大的 AI 助手框架
- [ClawHub](https://clawhub.ai) - Skill 市场平台
- [ontology skill](https://clawhub.ai/ontology) - 知识图谱灵感

---

**Made with 👻 by 小鬼 × Jake**
