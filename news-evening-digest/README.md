# 全球新闻晚报 - 企业微信推送版

## ✅ 安装状态

| 组件 | 状态 | 备注 |
|------|------|------|
| 技能目录 | ✅ 已创建 | `skills/news-evening-digest/` |
| 推送脚本 | ✅ 已创建 | `scripts/fetch_and_digest.py` |
| 企业微信支持 | ✅ 已配置 | WeCom Webhook |
| 脚本测试 | ✅ 通过 | 运行正常 |
| 企业微信配置 | ⚠️ 待配置 | 需要 Webhook Key |
| 定时任务 | ⚠️ 待设置 | 需要手动添加 cron |

---

## 📋 快速开始

### 1️⃣ 获取企业微信机器人 Webhook

**步骤：**
1. 打开企业微信群聊
2. 点击右上角菜单 → 添加群机器人
3. 新建机器人 → 复制 Webhook 地址
4. 格式：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### 2️⃣ 配置到 .env 文件

```bash
# 编辑 .env 文件
notepad "$env:USERPROFILE\.openclaw\.env"

# 添加企业微信 Webhook（替换为你的实际 key）
WECOM_WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=你的 key"
QQ_ENABLED="true"
```

### 3️⃣ 设置定时任务

**方法 A：使用 OpenClaw cron**
```bash
# 查看 cron 帮助
openclaw cron --help

# 添加定时任务（每天晚上 8 点）
openclaw cron add "全球新闻晚报" "0 20 * * *" "python $env:USERPROFILE\.openclaw\workspace\skills\news-evening-digest\scripts\fetch_and_digest.py"
```

**方法 B：手动测试**
```bash
# 测试脚本
python "$env:USERPROFILE\.openclaw\workspace\skills\news-evening-digest\scripts\fetch_and_digest.py"
```

---

## 📊 推送内容示例

```
[Global News Evening Digest] 03/13 20:00

============================================================

WORLD HOTSPOTS (7-Day Focus)
* Iran Situation: Day 13 of military conflict
  Iran missile strike on northern Israel, 30+ injured
* US refueling plane crashes in Iraq
  4 crew members killed
* Oil price breaks $100/barrel
  Global stocks decline, US releases strategic reserve

TECHNOLOGY
* OpenClaw skill ecosystem expands
  New Ontology and Humanize AI Text skills installed
* AI model competition intensifies
  Major vendors launch new models

FINANCE
* Global stocks decline
  Affected by Middle East tensions
* Crypto market volatility
  Bitcoin follows market trend

============================================================

Sources: World Monitor, Tavily Search, News Aggregation
Powered by OpenClaw AI
Live Intel: worldmonitor.app
```

---

## 🔧 故障排查

### 问题：企业微信推送失败

**检查：**
1. Webhook URL 是否正确
2. 企业微信机器人是否已启用
3. 网络连接是否正常

**解决：**
```bash
# 检查 .env 文件是否配置
cat "$env:USERPROFILE\.openclaw\.env" | findstr WECOM
```

### 问题：定时任务未执行

**检查：**
```bash
# 查看已设置的 cron 任务
openclaw cron list
```

---

## 📁 文件结构

```
skills/news-evening-digest/
├── SKILL.md              # 技能说明
├── INSTALL.md            # 安装指南
├── README.md             # 本文档
└── scripts/
    └── fetch_and_digest.py  # 推送脚本
```

---

## 🎯 下一步

1. **立即完成：** 配置企业微信 Webhook
2. **今晚测试：** 手动运行一次脚本
3. **设置 cron：** 添加定时任务
4. **明晚验证：** 确认晚上 8 点自动推送

---

**创建时间：** 2026-03-13 22:37
**状态：** 等待配置企业微信 Webhook
