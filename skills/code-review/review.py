#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Code Review - 代码审查
代码质量检查、最佳实践建议、常见问题检测
"""

import re
from typing import List, Dict

# 代码检查规则
CHECK_RULES = {
    'python': [
        {'name': '函数长度', 'pattern': r'def \w+\([^)]*\):', 'max_lines': 50, 'message': '函数过长，建议拆分'},
        {'name': '行长度', 'max_chars': 120, 'message': '行超过 120 字符'},
        {'name': '魔法数字', 'pattern': r'\b[2-9]\d+\b', 'message': '避免魔法数字，使用常量'},
        {'name': 'TODO 注释', 'pattern': r'#\s*TODO', 'message': '存在待办事项'},
        {'name': 'print 调试', 'pattern': r'print\s*\(', 'message': '生产代码应移除 print'},
        {'name': '导入顺序', 'pattern': r'^import', 'message': '导入应按标准库、第三方、本地排序'},
    ],
    'javascript': [
        {'name': 'var 使用', 'pattern': r'\bvar\b', 'message': '建议使用 let 或 const'},
        {'name': '回调地狱', 'pattern': r'\}\);', 'message': '考虑使用 Promise 或 async/await'},
        {'name': 'console.log', 'pattern': r'console\.log', 'message': '生产代码应移除 console.log'},
        {'name': '== 比较', 'pattern': r'==', 'message': '建议使用 === 严格比较'},
        {'name': '行长度', 'max_chars': 120, 'message': '行超过 120 字符'},
    ]
}

# 最佳实践建议
BEST_PRACTICES = {
    'python': [
        '遵循 PEP 8 编码规范',
        '使用类型注解提高可读性',
        '编写文档字符串 (docstring)',
        '使用列表推导式简化代码',
        '避免在循环中修改列表',
        '使用 context manager 处理资源',
    ],
    'javascript': [
        '使用 ES6+ 语法 (箭头函数、解构等)',
        '避免全局变量',
        '使用模板字符串',
        '使用 async/await 处理异步',
        '添加错误处理 (try-catch)',
        '使用 ESLint 检查代码',
    ]
}


def detect_language(code: str) -> str:
    """检测代码语言"""
    if re.search(r'def \w+|import \w+|from \w+ import', code):
        return 'python'
    elif re.search(r'function\s+\w+|const\s+\w+|let\s+\w+|require\(', code):
        return 'javascript'
    elif re.search(r'public\s+class|System\.out\.print', code):
        return 'java'
    else:
        return 'unknown'


def check_code(code: str, language: str = None) -> List[Dict]:
    """检查代码"""
    if not language:
        language = detect_language(code)
    
    rules = CHECK_RULES.get(language, [])
    issues = []
    
    lines = code.split('\n')
    
    for rule in rules:
        # 行长度检查
        if 'max_chars' in rule:
            for i, line in enumerate(lines, 1):
                if len(line) > rule['max_chars']:
                    issues.append({
                        'type': 'warning',
                        'line': i,
                        'rule': rule['name'],
                        'message': f"{rule['message']} ({len(line)}字符)"
                    })
        
        # 函数长度检查
        if 'max_lines' in rule and 'pattern' in rule:
            matches = list(re.finditer(rule['pattern'], code))
            for match in matches:
                start = match.start()
                # 简单估算函数长度
                func_code = code[start:start+1000]
                func_lines = func_code.count('\n')
                if func_lines > rule['max_lines']:
                    line_num = code[:start].count('\n') + 1
                    issues.append({
                        'type': 'warning',
                        'line': line_num,
                        'rule': rule['name'],
                        'message': rule['message']
                    })
        
        # 模式匹配检查
        if 'pattern' in rule and 'max_lines' not in rule:
            matches = re.finditer(rule['pattern'], code)
            for match in matches:
                line_num = code[:match.start()].count('\n') + 1
                issues.append({
                    'type': 'info',
                    'line': line_num,
                    'rule': rule['name'],
                    'message': rule['message']
                })
    
    return issues


def get_suggestions(language: str) -> List[str]:
    """获取最佳实践建议"""
    return BEST_PRACTICES.get(language, [])


def calculate_score(code: str, issues: List[Dict]) -> int:
    """计算代码质量分数"""
    base_score = 100
    
    for issue in issues:
        if issue['type'] == 'warning':
            base_score -= 5
        elif issue['type'] == 'info':
            base_score -= 2
    
    return max(0, base_score)


def format_code(code: str, language: str = 'python') -> str:
    """简单格式化代码"""
    lines = code.split('\n')
    formatted = []
    
    for line in lines:
        # 移除行尾空格
        line = line.rstrip()
        formatted.append(line)
    
    return '\n'.join(formatted)


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'check' or command == '检查':
        code = ' '.join(args) if args else ''
        
        if not code:
            return """
❌ 请提供代码

用法：check [代码]

示例：check def hello(): print('hi')
            """.strip()
        
        language = detect_language(code)
        issues = check_code(code, language)
        score = calculate_score(code, issues)
        
        if not issues:
            return f"""
✅ 代码质量检查通过！

语言：{language.upper()}
评分：{score}/100
问题数：0

🎉 代码质量优秀！
            """.strip()
        
        # 按类型分组
        warnings = [i for i in issues if i['type'] == 'warning']
        infos = [i for i in issues if i['type'] == 'info']
        
        lines = [
            f"📊 代码质量报告",
            "",
            f"语言：{language.upper()}",
            f"评分：{score}/100",
            f"问题数：{len(issues)}",
            "",
        ]
        
        if warnings:
            lines.append(f"⚠️ 警告 ({len(warnings)}):")
            for w in warnings[:5]:
                lines.append(f"├─ 第{w['line']}行：{w['message']}")
            if len(warnings) > 5:
                lines.append(f"└─ ... 还有{len(warnings) - 5}个")
            lines.append("")
        
        if infos:
            lines.append(f"ℹ️ 建议 ({len(infos)}):")
            for i in infos[:5]:
                lines.append(f"├─ 第{i['line']}行：{i['message']}")
            if len(infos) > 5:
                lines.append(f"└─ ... 还有{len(infos) - 5}个")
        
        return '\n'.join(lines)
    
    elif command == 'practice' or command == '实践':
        language = args[0] if args else 'python'
        practices = get_suggestions(language)
        
        lines = [f"💡 {language.upper()} 最佳实践:"]
        for p in practices:
            lines.append(f"├─ {p}")
        
        return '\n'.join(lines)
    
    elif command == 'format' or command == '格式化':
        code = ' '.join(args) if args else ''
        
        if not code:
            return "❌ 请提供代码"
        
        language = detect_language(code)
        formatted = format_code(code, language)
        
        return f"""
📝 格式化后的代码 ({language}):

{formatted}
        """.strip()
    
    elif command == 'rules' or command == '规则':
        lines = ["📋 代码检查规则:"]
        
        for lang, rules in CHECK_RULES.items():
            lines.append(f"\n{lang.upper()}:")
            for rule in rules:
                lines.append(f"├─ {rule['name']}")
        
        return '\n'.join(lines)
    
    elif command == 'help' or command == '帮助':
        return """
💻 Code Review - 代码审查

可用命令:
  check/检查 [代码]           - 检查代码质量
  practice/实践 [语言]         - 最佳实践建议
  format/格式化 [代码]         - 格式化代码
  rules/规则                 - 查看检查规则
  help/帮助                  - 显示帮助

示例:
  检查代码：check def hello(): print('hi')
  最佳实践：practice python
  格式化：format const x = 1;
  
支持语言:
- Python
- JavaScript
- Java (基础)

检查项目:
- 代码规范
- 最佳实践
- 常见问题
- 代码风格
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
