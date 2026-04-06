# Memory-Master 安装和配置指南

## 快速开始

### 1. 安装 Skill

```bash
# 方法 1: 从 Gitee 克隆
cd ~/.openclaw/workspace/skills
git clone https://gitee.com/Jake26602/openclaw-memory-master.git
mv openclaw-memory-master memory-master

# 方法 2: 手动下载
# 下载 https://gitee.com/Jake26602/openclaw-memory-master 并解压到 skills/memory-master
```

### 2. 启用自动记忆捕捉

在 OpenClaw 配置中添加（位置：`~/.openclaw/config.json` 或网关配置）：

```json
{
  "skills": {
    "memory-master": {
      "enabled": true,
      "autoCapture": {
        "enabled": true,
        "threshold": 50
      }
    }
  }
}
```

### 3. 配置 Cron 定期整理

```bash
# 添加每天凌晨 3 点的整理任务
openclaw cron add --name "memory-organize" --schedule "0 3 * * *" --text "运行记忆整理任务"
```

或在配置中添加：

```json
{
  "cron": {
    "jobs": [
      {
        "name": "memory-organize-daily",
        "schedule": {
          "kind": "cron",
          "expr": "0 3 * * *",
          "tz": "Asia/Shanghai"
        },
        "payload": {
          "kind": "systemEvent",
          "text": "/memory-organize"
        },
        "enabled": true
      }
    ]
  }
}
```

### 4. 重启 OpenClaw

```bash
openclaw gateway restart
```

---

## 使用手册

### 手动命令

| 命令 | 功能 | 示例 |
|------|------|------|
| `/memory-capture` | 手动触发记忆捕捉 | `/memory-capture` |
| `/memory-organize` | 手动触发记忆整理 | `/memory-organize` |
| `/memory-status` | 查看记忆系统状态 | `/memory-status` |
| `/load-memory` | 加载上次会话记忆 | `/load-memory` |
| `/save-memory` | 保存当前会话记忆 | `/save-memory` |
| `/memory-graph` | 查看记忆关联图谱 | `/memory-graph` |

### 自动功能

启用后，Memory-Master 会自动：

1. **监控对话** - 每次对话后分析重要性
2. **自动保存** - 重要对话自动写入 daily notes
3. **更新图谱** - 自动提取人名、项目、任务
4. **定期整理** - 每天凌晨 3 点删除过期记忆

---

## 配置选项

### 完整配置示例

```json
{
  "skills": {
    "memory-master": {
      "enabled": true,
      "autoCapture": {
        "enabled": true,        // 自动捕捉（默认 true）
        "threshold": 50,        // 重要性阈值（默认 50）
        "updateGraph": true,    // 更新记忆图谱（默认 true）
        "debug": false          // 调试模式（默认 false）
      },
      "autoLoad": {
        "enabled": true,        // 启动时自动加载（默认 true）
        "maxAge": 1             // 加载最近 N 天的记忆（默认 1）
      },
      "organize": {
        "enabled": true,        // 定期整理（默认 true）
        "schedule": "0 3 * * *", // Cron 表达式（默认每天 3 点）
        "maxAge": 30            // 记忆最大保存天数（默认 30）
      }
    }
  }
}
```

### 配置说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | true | 是否启用 skill |
| `autoCapture.enabled` | boolean | true | 是否自动捕捉对话 |
| `autoCapture.threshold` | number | 50 | 重要性阈值（0-100） |
| `autoCapture.updateGraph` | boolean | true | 是否更新记忆图谱 |
| `autoCapture.debug` | boolean | false | 是否输出调试日志 |
| `autoLoad.enabled` | boolean | true | 启动时是否自动加载记忆 |
| `autoLoad.maxAge` | number | 1 | 加载最近 N 天的记忆 |
| `organize.enabled` | boolean | true | 是否启用定期整理 |
| `organize.schedule` | string | "0 3 * * *" | Cron 表达式 |
| `organize.maxAge` | number | 30 | 记忆最大保存天数 |

---

## 记忆文件位置

```
~/.openclaw/workspace/memory/
├── MEMORY.md              # 长期记忆（主文件）
├── memory-graph.json      # 记忆关联图谱
├── memory-state.json      # 记忆系统状态
├── 2026-04-06.md          # 每日记忆（自动创建）
└── ...
```

---

## 重要性评分说明

Memory-Master 使用多维度评分判断对话是否重要：

| 维度 | 分数 | 说明 |
|------|------|------|
| 关键词匹配 | +10 分/个 | 项目、决定、待办、记住等 |
| 用户明确指令 | +30 分 | "记住这个"、"记下来"等 |
| 包含日期 | +8 分 | 2026-04-06、下周、明天等 |
| 包含 URL | +8 分 | https://... |
| 包含数字 | +5 分 | 数量、金额等 |
| 包含文件名 | +8 分 | .md、.js、.py 等 |
| 总结性语句 | +20 分 | 总之、所以、决定等 |
| 问题/答案 | +8 分 | 包含问号 |
| 代码内容 | +15 分 | function、const 等 |
| 人名/称呼 | +8 分 | Jake、先生、同学等 |
| 情感表达 | +8 分 | 太棒了、完美等 |
| 长消息 | +10 分 | 超过 100 字 |
| 上下文连续 | +8 分 | 继续、然后等 |

**阈值说明**：
- ≥50 分：重要，自动保存
- 30-49 分：中等，可选择保存
- <30 分：普通对话，不保存

---

## 故障排查

### 记忆没有自动保存？

1. 检查配置中 `autoCapture.enabled` 是否为 `true`
2. 检查阈值是否太高（可以尝试降到 40）
3. 查看调试日志：设置 `autoCapture.debug: true`
4. 手动测试：`/memory-capture`

### 重启后没有自动加载记忆？

1. 检查配置中 `autoLoad.enabled` 是否为 `true`
2. 检查 `autoLoad.maxAge` 是否设置合理
3. 手动测试：`/load-memory`

### 定期整理没有执行？

1. 检查 cron 任务是否创建成功：`openclaw cron list`
2. 检查 cron 表达式是否正确
3. 查看 `memory-state.json` 中的 `lastOrganize` 时间
4. 手动测试：`/memory-organize`

### 记忆图谱为空？

1. 检查配置中 `enableGraph` 是否为 `true`
2. 记忆图谱需要累积一定对话后才会生成
3. 手动查看：`/memory-graph`

---

## 卸载

```bash
# 1. 删除 skill
rm -rf ~/.openclaw/workspace/skills/memory-master

# 2. 删除 cron 任务
openclaw cron remove --name "memory-organize"

# 3. 删除记忆文件（可选）
rm -rf ~/.openclaw/workspace/memory/

# 4. 重启 OpenClaw
openclaw gateway restart
```

---

## 更新

```bash
# 从 Gitee 拉取最新代码
cd ~/.openclaw/workspace/skills/memory-master
git pull origin main

# 重启 OpenClaw
openclaw gateway restart
```

---

## 反馈与支持

- **Gitee Issues**: https://gitee.com/Jake26602/openclaw-memory-master/issues
- **作者**: 小鬼 👻 × Jake
- **许可证**: MIT

---

*最后更新：2026-04-06*
