#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Log Analyzer - 日志分析器
日志解析、异常检测、统计分析
"""

import re
from typing import List, Dict
from datetime import datetime

# 日志模式
LOG_PATTERNS = {
    'generic': r'(?P<timestamp>\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2})\s+(?P<level>\w+)\s+(?P<message>.*)',
    'nginx': r'(?P<ip>[\d.]+)\s+-\s+-\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>\w+)\s+(?P<path>[^\s]+)\s+[^"]+"\s+(?P<status>\d+)',
    'python': r'(?P<level>\w+):\s*(?P<message>.*)\s+at\s+(?P<location>.*)',
}

# 日志级别
LOG_LEVELS = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']


def parse_log_line(line: str, pattern_name: str = 'generic') -> Dict:
    """解析日志行"""
    pattern = LOG_PATTERNS.get(pattern_name, LOG_PATTERNS['generic'])
    match = re.search(pattern, line)
    
    if match:
        return match.groupdict()
    return {'raw': line, 'parsed': False}


def analyze_logs(logs: List[str]) -> Dict:
    """分析日志"""
    stats = {
        'total': len(logs),
        'by_level': {},
        'errors': [],
        'warnings': [],
        'time_range': {'start': None, 'end': None}
    }
    
    for line in logs:
        parsed = parse_log_line(line)
        
        # 统计级别
        level = parsed.get('level', 'UNKNOWN').upper()
        stats['by_level'][level] = stats['by_level'].get(level, 0) + 1
        
        # 收集错误和警告
        if 'ERROR' in level or 'CRITICAL' in level:
            stats['errors'].append(parsed)
        elif 'WARNING' in level or 'WARN' in level:
            stats['warnings'].append(parsed)
    
    return stats


def filter_logs(logs: List[str], level: str = None, keyword: str = None) -> List[str]:
    """过滤日志"""
    results = logs
    
    if level:
        results = [l for l in results if level.upper() in l.upper()]
    
    if keyword:
        results = [l for l in results if keyword.lower() in l.lower()]
    
    return results


def get_error_summary(logs: List[str]) -> List[Dict]:
    """获取错误摘要"""
    errors = []
    
    for line in logs:
        if any(level in line.upper() for level in ['ERROR', 'CRITICAL', 'FATAL']):
            parsed = parse_log_line(line)
            errors.append({
                'message': parsed.get('message', line[:100]),
                'level': parsed.get('level', 'ERROR'),
                'timestamp': parsed.get('timestamp', 'N/A')
            })
    
    return errors


def format_stats(stats: Dict) -> str:
    """格式化统计"""
    lines = [
        "📊 日志统计:",
        "",
        f"总行数：{stats['total']}",
        "",
        "按级别统计:"
    ]
    
    for level, count in sorted(stats['by_level'].items()):
        bar = '█' * min(count, 50)
        lines.append(f"├─ {level}: {count} {bar}")
    
    lines.append("")
    lines.append(f"错误数：{len(stats['errors'])}")
    lines.append(f"警告数：{len(stats['warnings'])}")
    
    return '\n'.join(lines)


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'parse' or command == '解析':
        if not args:
            return "❌ 请提供日志行"
        
        line = ' '.join(args)
        pattern = args[0] if args[0] in LOG_PATTERNS.keys() else 'generic'
        
        if pattern == 'generic':
            line = ' '.join(args)
        
        parsed = parse_log_line(line, pattern)
        
        lines = ["📝 解析结果:"]
        for key, value in parsed.items():
            lines.append(f"├─ {key}: {value}")
        
        return '\n'.join(lines)
    
    elif command == 'analyze' or command == '分析':
        # 示例日志
        sample_logs = [
            "2026-03-20 10:00:00 INFO Application started",
            "2026-03-20 10:01:00 DEBUG Loading configuration",
            "2026-03-20 10:02:00 WARNING Config file not found, using defaults",
            "2026-03-20 10:03:00 ERROR Database connection failed",
            "2026-03-20 10:04:00 INFO Retrying database connection",
            "2026-03-20 10:05:00 INFO Database connected successfully",
        ]
        
        stats = analyze_logs(sample_logs)
        
        return format_stats(stats) + "\n\n(使用实际日志文件进行分析)"
    
    elif command == 'filter' or command == '过滤':
        level = args[0] if args else None
        keyword = args[1] if len(args) > 1 else None
        
        sample_logs = [
            "2026-03-20 10:00:00 INFO Application started",
            "2026-03-20 10:01:00 DEBUG Loading configuration",
            "2026-03-20 10:02:00 WARNING Config file not found",
            "2026-03-20 10:03:00 ERROR Database connection failed",
        ]
        
        filtered = filter_logs(sample_logs, level, keyword)
        
        lines = [f"📝 过滤结果 ({len(filtered)} 条):\n"]
        for log in filtered:
            lines.append(f"├─ {log}")
        
        return '\n'.join(lines)
    
    elif command == 'errors' or command == '错误':
        sample_logs = [
            "2026-03-20 10:00:00 INFO Application started",
            "2026-03-20 10:03:00 ERROR Database connection failed",
            "2026-03-20 10:05:00 CRITICAL System out of memory",
        ]
        
        errors = get_error_summary(sample_logs)
        
        if not errors:
            return "✅ 未发现错误"
        
        lines = [f"🚨 错误摘要 ({len(errors)} 条):\n"]
        for err in errors:
            lines.append(f"├─ [{err['level']}] {err['message']}")
            lines.append(f"│  时间：{err['timestamp']}")
        
        return '\n'.join(lines)
    
    elif command == 'patterns' or command == '模式':
        lines = ["📝 支持的日志模式:"]
        for name, pattern in LOG_PATTERNS.items():
            lines.append(f"\n{name}:")
            lines.append(f"├─ {pattern}")
        
        return '\n'.join(lines)
    
    elif command == 'help' or command == '帮助':
        return """
📝 Log Analyzer - 日志分析器

可用命令:
  parse/解析 [日志行]          - 解析日志行
  analyze/分析                - 分析示例日志
  filter/过滤 [级别] [关键词]   - 过滤日志
  errors/错误                 - 错误摘要
  patterns/模式               - 日志模式
  help/帮助                   - 显示帮助

日志级别:
DEBUG | INFO | WARNING | ERROR | CRITICAL

示例:
  解析日志：parse 2026-03-20 10:00:00 ERROR Database failed
  过滤 ERROR: filter ERROR
  查看错误：errors
  查看模式：patterns
  
支持格式:
- generic (通用格式)
- nginx (Nginx 访问日志)
- python (Python 日志)
        """.strip()
    
    else:
        return "❌ 未知命令，输入 help 查看帮助"


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print(run('help'))
    else:
        command = sys.argv[1]
        args = sys.argv[2:]
        print(run(command, args))
