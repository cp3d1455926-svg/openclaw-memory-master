# Cron 配置示例

## 定期记忆整理（每天凌晨 3 点）

在 OpenClaw 中创建 cron 任务：

```bash
openclaw cron add --name "memory-organize" --schedule "0 3 * * *" --text "运行记忆整理任务"
```

或者在配置文件中添加：

```json
{
  "cron": {
    "jobs": [
      {
        "name": "memory-organize-daily",
        "schedule": {
          "kind": "cron",
          "expr": "0 3 * * *"
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

## 每小时记忆捕捉（可选）

```json
{
  "name": "memory-capture-hourly",
  "schedule": {
    "kind": "every",
    "everyMs": 3600000
  },
  "payload": {
    "kind": "systemEvent",
    "text": "/memory-capture"
  },
  "enabled": true
}
```

## 命令说明

- `/memory-capture` - 手动触发记忆捕捉
- `/memory-organize` - 手动触发记忆整理
- `/memory-status` - 查看记忆系统状态
- `/load-memory` - 加载上次会话记忆
- `/save-memory` - 保存当前会话记忆
