#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Interview Prep - 面试准备
常见问题、模拟面试、答题技巧
"""

import random
from typing import List, Dict

# 面试题库
INTERVIEW_QUESTIONS = {
    'Python': [
        {'q': 'Python 中 list 和 tuple 有什么区别？', 'a': 'list 可变，tuple 不可变。list 用 []，tuple 用 ()。tuple 可用作字典的 key。', 'level': 'easy'},
        {'q': '解释一下 Python 的装饰器', 'a': '装饰器是修改其他函数功能的函数，使用@语法。常用于日志、权限验证等。', 'level': 'medium'},
        {'q': 'Python 的 GIL 是什么？', 'a': '全局解释器锁，同一时刻只有一个线程执行 Python 字节码，影响多线程性能。', 'level': 'hard'},
        {'q': '深拷贝和浅拷贝的区别？', 'a': '浅拷贝只复制引用，深拷贝递归复制所有对象。copy() 是浅拷贝，deepcopy() 是深拷贝。', 'level': 'medium'},
    ],
    '前端': [
        {'q': '解释一下 CSS 盒模型', 'a': 'content + padding + border + margin。box-sizing: border-box 包含 padding 和 border。', 'level': 'easy'},
        {'q': 'JavaScript 闭包是什么？', 'a': '函数能访问其外部作用域的变量，即使外部函数已执行完毕。用于数据隐藏和函数工厂。', 'level': 'medium'},
        {'q': 'React 的生命周期有哪些？', 'a': '挂载 (constructor, render, componentDidMount)、更新、卸载 (componentWillUnmount)。', 'level': 'medium'},
        {'q': '解释一下事件委托', 'a': '利用事件冒泡，将事件监听器放在父元素上，通过 event.target 判断实际触发元素。', 'level': 'medium'},
    ],
    '通用': [
        {'q': '介绍一下你自己', 'a': '简短介绍背景、技能、项目经验，突出与岗位匹配的亮点。', 'level': 'easy'},
        {'q': '你的优缺点是什么？', 'a': '优点结合岗位需求，缺点要真实但可改进，说明改进计划。', 'level': 'easy'},
        {'q': '为什么选择我们公司？', 'a': '结合公司发展、文化、岗位匹配度，展示你的了解和热情。', 'level': 'easy'},
        {'q': '遇到技术难题怎么解决？', 'a': '1.分析问题 2.搜索文档/StackOverflow 3.请教同事 4.总结记录。', 'level': 'medium'},
    ]
}

# 面试技巧
INTERVIEW_TIPS = [
    '提前研究公司和岗位',
    '准备 3-5 个项目的详细介绍',
    '用 STAR 法则回答问题 (Situation, Task, Action, Result)',
    '准备几个问题问面试官',
    '穿着得体，提前 10 分钟到达',
    '保持眼神交流，语速适中',
    '不会的问题诚实承认，但展示思考过程',
    '面试后发感谢邮件',
]

# 薪资谈判技巧
SALARY_TIPS = [
    '提前调研市场薪资水平',
    '给出薪资范围而非具体数字',
    '强调你的价值和贡献',
    '考虑整体薪酬包 (股票、奖金、福利)',
    '不要过早透露期望薪资',
    '学会说"我需要考虑一下"',
]


def get_questions(category: str, level: str = None, count: int = 5) -> List[Dict]:
    """获取面试题"""
    questions = INTERVIEW_QUESTIONS.get(category, [])
    
    if level:
        questions = [q for q in questions if q.get('level') == level]
    
    return random.sample(questions, min(count, len(questions)))


def get_random_question() -> Dict:
    """随机获取一道题"""
    all_questions = []
    for questions in INTERVIEW_QUESTIONS.values():
        all_questions.extend(questions)
    
    return random.choice(all_questions)


def get_tips() -> List[str]:
    """获取面试技巧"""
    return INTERVIEW_TIPS


def get_salary_tips() -> List[str]:
    """获取薪资谈判技巧"""
    return SALARY_TIPS


def simulate_interview(category: str = '通用', count: int = 3) -> List[Dict]:
    """模拟面试"""
    return get_questions(category, count=count)


def format_question(question: Dict, show_answer: bool = False) -> str:
    """格式化问题"""
    level_icons = {'easy': '🟢', 'medium': '🟡', 'hard': '🔴'}
    
    lines = [
        f"❓ {question['q']}",
        f"难度：{level_icons.get(question['level'], '⚪')} {question['level']}"
    ]
    
    if show_answer:
        lines.append(f"\n💡 参考答案:\n{question['a']}")
    
    return '\n'.join(lines)


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'question' or command == '题目':
        category = args[0] if args else '通用'
        questions = get_questions(category, count=1)
        
        if questions:
            return format_question(questions[0])
        else:
            return f"😅 未找到 {category} 的面试题"
    
    elif command == 'practice' or command == '练习':
        category = args[0] if args else '通用'
        count = int(args[1]) if len(args) > 1 and args[1].isdigit() else 3
        
        questions = get_questions(category, count=count)
        
        if not questions:
            return f"😅 未找到 {category} 的面试题"
        
        lines = [f"📝 {category} 面试练习 ({len(questions)} 题):\n"]
        
        for i, q in enumerate(questions, 1):
            lines.append(f"{i}. {q['q']} [{q['level']}]")
        
        lines.append("\n💡 查看答案：answer [题号]")
        
        return '\n'.join(lines)
    
    elif command == 'answer' or command == '答案':
        if not args:
            return "❌ 请提供题号"
        
        try:
            question_num = int(args[0])
            # 这里简化，实际需要保存题目状态
            return "💡 请查看练习时保存的题目"
        except ValueError:
            return "❌ 题号必须是数字"
    
    elif command == 'tips' or command == '技巧':
        tips = get_tips()
        
        lines = ["💡 面试技巧:"]
        for tip in tips:
            lines.append(f"├─ {tip}")
        
        return '\n'.join(lines)
    
    elif command == 'salary' or command == '薪资':
        tips = get_salary_tips()
        
        lines = ["💰 薪资谈判技巧:"]
        for tip in tips:
            lines.append(f"├─ {tip}")
        
        return '\n'.join(lines)
    
    elif command == 'mock' or command == '模拟':
        category = args[0] if args else '通用'
        questions = simulate_interview(category, 3)
        
        lines = [f"🎭 模拟面试 ({category})\n"]
        lines.append("请逐一回答以下问题:\n")
        
        for i, q in enumerate(questions, 1):
            lines.append(f"{i}. {q['q']}")
        
        lines.append("\n回答后输入 next 查看参考答案")
        
        return '\n'.join(lines)
    
    elif command == 'categories' or command == '分类':
        categories = list(INTERVIEW_QUESTIONS.keys())
        
        lines = ["📂 面试题库分类:"]
        for cat in categories:
            count = len(INTERVIEW_QUESTIONS[cat])
            lines.append(f"├─ {cat} ({count}题)")
        
        return '\n'.join(lines)
    
    elif command == 'help' or command == '帮助':
        return """
💼 Interview Prep - 面试准备

可用命令:
  question/题目 [分类]         - 随机题目
  practice/练习 [分类] [数量]   - 练习模式
  mock/模拟 [分类]             - 模拟面试
  answer/答案 [题号]           - 查看答案
  tips/技巧                   - 面试技巧
  salary/薪资                 - 薪资谈判
  categories/分类              - 题库分类
  help/帮助                   - 显示帮助

题库分类:
- Python
- 前端
- 通用

难度等级:
🟢 easy | 🟡 medium | 🔴 hard
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
