#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Regex Builder - 正则生成器
可视化正则表达式、常用模式、在线测试
"""

import re
from typing import List, Dict

# 常用正则模式
REGEX_PATTERNS = {
    '邮箱': r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
    '手机号': r'1[3-9]\d{9}',
    '身份证': r'\d{17}[\dXx]',
    'URL': r'https?://[^\s]+',
    'IP 地址': r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}',
    '日期': r'\d{4}-\d{2}-\d{2}',
    '时间': r'\d{2}:\d{2}:\d{2}',
    '中文': r'[\u4e00-\u9fa5]+',
    '数字': r'\d+',
    '字母': r'[a-zA-Z]+',
    '单词': r'\b\w+\b',
    '空白字符': r'\s+',
    'HTML 标签': r'<[^>]+>',
}

# 正则语法说明
REGEX_SYNTAX = {
    '.': '匹配任意字符 (除换行)',
    '^': '匹配字符串开头',
    '$': '匹配字符串结尾',
    '*': '匹配前一个字符 0 次或多次',
    '+': '匹配前一个字符 1 次或多次',
    '?': '匹配前一个字符 0 次或 1 次',
    '{n}': '匹配前一个字符恰好 n 次',
    '{n,}': '匹配前一个字符至少 n 次',
    '{n,m}': '匹配前一个字符 n 到 m 次',
    '[abc]': '匹配 a、b 或 c',
    '[^abc]': '匹配除 a、b、c 外的字符',
    '[a-z]': '匹配 a 到 z 的字符',
    '\\d': '匹配数字 (0-9)',
    '\\w': '匹配字母、数字、下划线',
    '\\s': '匹配空白字符',
    '()': '分组',
    '|': '或操作',
}


def test_pattern(pattern: str, text: str) -> Dict:
    """测试正则表达式"""
    try:
        matches = re.findall(pattern, text)
        
        return {
            'success': True,
            'pattern': pattern,
            'matches': matches,
            'count': len(matches)
        }
    except re.error as e:
        return {
            'success': False,
            'error': str(e)
        }


def get_pattern(name: str) -> str:
    """获取预定义模式"""
    return REGEX_PATTERNS.get(name, None)


def explain_pattern(pattern: str) -> List[str]:
    """解释正则模式（简化版）"""
    explanations = []
    
    if '.' in pattern:
        explanations.append('. 匹配任意字符')
    if '\\d' in pattern:
        explanations.append('\\d 匹配数字')
    if '\\w' in pattern:
        explanations.append('\\w 匹配字母数字下划线')
    if '+' in pattern:
        explanations.append('+ 匹配 1 次或多次')
    if '*' in pattern:
        explanations.append('* 匹配 0 次或多次')
    if '?' in pattern:
        explanations.append('? 匹配 0 次或 1 次')
    if '^' in pattern:
        explanations.append('^ 匹配开头')
    if '$' in pattern:
        explanations.append('$ 匹配结尾')
    if '[' in pattern:
        explanations.append('[] 字符组')
    if '(' in pattern:
        explanations.append('() 分组')
    
    return explanations


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'patterns' or command == '模式':
        lines = ["🔤 常用正则模式:"]
        for name, pattern in REGEX_PATTERNS.items():
            lines.append(f"├─ {name}: {pattern}")
        
        return '\n'.join(lines)
    
    elif command == 'test' or command == '测试':
        if len(args) < 2:
            return "❌ 用法：test [正则] [文本]"
        
        pattern = args[0]
        text = ' '.join(args[1:])
        
        result = test_pattern(pattern, text)
        
        if result['success']:
            lines = [
                f"✅ 正则有效",
                f"",
                f"模式：{result['pattern']}",
                f"匹配数：{result['count']}",
                f"",
                f"匹配结果:"
            ]
            
            for match in result['matches'][:10]:
                lines.append(f"├─ {match}")
            
            if len(result['matches']) > 10:
                lines.append(f"└─ ... 还有{len(result['matches']) - 10}个")
            
            # 解释模式
            explanations = explain_pattern(pattern)
            if explanations:
                lines.append("")
                lines.append("📖 模式说明:")
                for exp in explanations:
                    lines.append(f"├─ {exp}")
        else:
            lines = [
                f"❌ 正则无效",
                f"",
                f"错误：{result['error']}"
            ]
        
        return '\n'.join(lines)
    
    elif command == 'match' or command == '匹配':
        # 使用预定义模式
        if len(args) < 2:
            return "❌ 用法：match [模式名] [文本]"
        
        pattern_name = args[0]
        text = ' '.join(args[1:])
        
        pattern = get_pattern(pattern_name)
        
        if not pattern:
            available = ', '.join(REGEX_PATTERNS.keys())
            return f"❌ 未知模式 '{pattern_name}'\n可用：{available}"
        
        result = test_pattern(pattern, text)
        
        if result['success']:
            lines = [
                f"✅ {pattern_name} 匹配结果",
                f"",
                f"模式：{pattern}",
                f"匹配数：{result['count']}",
                f"",
                f"匹配:"
            ]
            
            for match in result['matches'][:10]:
                lines.append(f"├─ {match}")
            
            return '\n'.join(lines)
        else:
            return f"❌ 匹配失败：{result.get('error', '未知错误')}"
    
    elif command == 'syntax' or command == '语法':
        lines = ["🔤 正则语法速查:"]
        for syntax, desc in REGEX_SYNTAX.items():
            lines.append(f"├─ {syntax:10} {desc}")
        
        return '\n'.join(lines)
    
    elif command == 'build' or command == '构建':
        return """
🔤 正则构建向导

请描述你要匹配的内容:

示例:
- "匹配邮箱地址" → 使用模式：邮箱
- "匹配 11 位手机号" → 使用模式：手机号
- "匹配 2026-03-20 格式日期" → 使用模式：日期

命令：match [模式名] [文本]

常用模式:
- 邮箱：匹配电子邮件
- 手机号：匹配中国手机号
- URL: 匹配网址
- IP 地址：匹配 IP
- 日期：匹配 YYYY-MM-DD
- 中文：匹配中文字符
        """.strip()
    
    elif command == 'help' or command == '帮助':
        return """
🔤 Regex Builder - 正则生成器

可用命令:
  patterns/模式              - 常用正则模式
  test/测试 [正则] [文本]      - 测试正则
  match/匹配 [模式名] [文本]   - 使用预定义模式
  syntax/语法                - 语法速查
  build/构建                 - 构建向导
  help/帮助                  - 显示帮助

示例:
  查看所有：patterns
  测试正则：test \\d+ abc123def
  匹配邮箱：match 邮箱 test@example.com
  匹配手机：match 手机号 13800138000
  查看语法：syntax
  
预定义模式:
邮箱 | 手机号 | 身份证 | URL | IP 地址
日期 | 时间 | 中文 | 数字 | 字母 | HTML 标签
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
