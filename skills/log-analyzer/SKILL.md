# 📝 Log Analyzer - 日志分析器

日志解析、异常检测、统计分析。

## 功能列表

- ✅ 日志解析
- ✅ 级别统计
- ✅ 错误检测
- ✅ 日志过滤
- ✅ 多格式支持

## 使用示例

```
解析日志：parse 2026-03-20 ERROR Database failed
分析日志：analyze
过滤日志：filter ERROR
错误摘要：errors
查看模式：patterns
```

## 支持格式

- generic (通用格式)
- nginx (访问日志)
- python (Python 日志)

## 日志级别

DEBUG | INFO | WARNING | ERROR | CRITICAL

## 文件结构

```
log-analyzer/
├── SKILL.md
└── log.py
```

## 依赖

无外部依赖，使用 Python 标准库

## 作者

小鬼 👻

## 版本

v1.0
