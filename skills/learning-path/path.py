#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Learning Path - 学习路径
技能学习路线规划、阶段目标、资源推荐
"""

from typing import List, Dict

# 学习路径数据
LEARNING_PATHS = {
    'Python': {
        'duration': '3-6 个月',
        'levels': [
            {
                'name': '入门阶段',
                'duration': '2-4 周',
                'topics': ['基础语法', '数据类型', '控制流程', '函数'],
                'resources': ['Python 官方教程', '菜鸟教程', '廖雪峰 Python'],
                'project': '制作一个计算器'
            },
            {
                'name': '进阶阶段',
                'duration': '4-8 周',
                'topics': ['面向对象', '模块和包', '文件操作', '异常处理'],
                'resources': ['流畅的 Python', 'Python Cookbook'],
                'project': '制作一个待办事项应用'
            },
            {
                'name': '高级阶段',
                'duration': '8-12 周',
                'topics': ['并发编程', '网络编程', '数据库', 'Web 框架'],
                'resources': ['Python 核心编程', 'Flask/Django 文档'],
                'project': '制作一个博客系统'
            },
            {
                'name': '实战阶段',
                'duration': '持续',
                'topics': ['项目实战', '代码优化', '测试', '部署'],
                'resources': ['GitHub 开源项目', '技术博客'],
                'project': '参与开源项目或独立开发'
            }
        ]
    },
    '前端开发': {
        'duration': '4-8 个月',
        'levels': [
            {
                'name': 'HTML/CSS 基础',
                'duration': '2-4 周',
                'topics': ['HTML 标签', 'CSS 选择器', '布局', '响应式设计'],
                'resources': ['MDN Web Docs', 'freeCodeCamp'],
                'project': '制作个人简历页面'
            },
            {
                'name': 'JavaScript 基础',
                'duration': '4-6 周',
                'topics': ['语法基础', 'DOM 操作', '事件', 'AJAX'],
                'resources': ['JavaScript 高级程序设计', 'Eloquent JavaScript'],
                'project': '制作一个待办事项应用'
            },
            {
                'name': '框架学习',
                'duration': '6-8 周',
                'topics': ['React/Vue', '组件化', '状态管理', '路由'],
                'resources': ['官方文档', 'Vue/React 教程'],
                'project': '制作一个电商网站'
            },
            {
                'name': '工程化',
                'duration': '4-6 周',
                'topics': ['Webpack', 'TypeScript', '测试', '性能优化'],
                'resources': ['Webpack 官方文档', '性能优化指南'],
                'project': '优化现有项目'
            }
        ]
    },
    '数据分析': {
        'duration': '4-6 个月',
        'levels': [
            {
                'name': 'Python 基础',
                'duration': '4 周',
                'topics': ['Python 语法', '数据结构', '函数'],
                'resources': ['Python 入门教程'],
                'project': '基础练习'
            },
            {
                'name': '数据处理',
                'duration': '6-8 周',
                'topics': ['NumPy', 'Pandas', '数据清洗'],
                'resources': ['利用 Python 进行数据分析'],
                'project': '分析某数据集'
            },
            {
                'name': '数据可视化',
                'duration': '4-6 周',
                'topics': ['Matplotlib', 'Seaborn', 'Tableau'],
                'resources': ['Python 数据可视化'],
                'project': '制作数据仪表板'
            },
            {
                'name': '机器学习',
                'duration': '8-12 周',
                'topics': ['Scikit-learn', '算法原理', '模型评估'],
                'resources': ['机器学习实战', '吴恩达课程'],
                'project': '预测模型'
            }
        ]
    }
}


def get_path(skill: str) -> Dict:
    """获取学习路径"""
    return LEARNING_PATHS.get(skill, None)


def get_all_paths() -> List[str]:
    """获取所有路径"""
    return list(LEARNING_PATHS.keys())


def get_level_detail(skill: str, level_index: int) -> Dict:
    """获取阶段详情"""
    path = get_path(skill)
    if not path:
        return None
    
    levels = path.get('levels', [])
    if level_index < 0 or level_index >= len(levels):
        return None
    
    return levels[level_index]


def get_progress_summary(skill: str, current_level: int) -> str:
    """获取进度摘要"""
    path = get_path(skill)
    if not path:
        return None
    
    total = len(path.get('levels', []))
    percent = (current_level / total) * 100
    
    return f"进度：{current_level}/{total} ({percent:.1f}%)"


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'path' or command == '路径':
        if not args:
            return "❌ 请提供技能名称"
        
        skill = args[0]
        path = get_path(skill)
        
        if not path:
            available = ', '.join(get_all_paths())
            return f"❌ 未找到技能 '{skill}'\n可用：{available}"
        
        lines = [
            f"🎯 {skill} 学习路径",
            "",
            f"📅 总时长：{path['duration']}",
            "",
            "📚 学习阶段:"
        ]
        
        for i, level in enumerate(path['levels'], 1):
            lines.append(f"\n{i}. {level['name']} ({level['duration']})")
            lines.append(f"   主题：{', '.join(level['topics'])}")
            lines.append(f"   资源：{', '.join(level['resources'][:2])}")
            lines.append(f"   项目：{level['project']}")
        
        return '\n'.join(lines)
    
    elif command == 'level' or command == '阶段':
        if len(args) < 2:
            return "❌ 用法：level [技能] [阶段号]"
        
        skill = args[0]
        try:
            level_index = int(args[1]) - 1
        except ValueError:
            return "❌ 阶段号必须是数字"
        
        level = get_level_detail(skill, level_index)
        
        if not level:
            return f"❌ 未找到阶段 {level_index + 1}"
        
        return f"""
📖 {level['name']}

⏱️ 时长：{level['duration']}

📚 主题:
{chr(10).join(f'├─ {t}' for t in level['topics'])}

📖 资源:
{chr(10).join(f'├─ {r}' for r in level['resources'])}

🎯 项目：{level['project']}
        """.strip()
    
    elif command == 'list' or command == '列表':
        paths = get_all_paths()
        
        lines = ["🎯 可用学习路径:"]
        for path in paths:
            duration = LEARNING_PATHS[path]['duration']
            levels = len(LEARNING_PATHS[path]['levels'])
            lines.append(f"├─ {path} - {duration} | {levels}个阶段")
        
        return '\n'.join(lines)
    
    elif command == 'compare' or command == '对比':
        if len(args) < 2:
            return "❌ 用法：compare [技能 1] [技能 2]"
        
        skill1 = args[0]
        skill2 = args[1]
        
        path1 = get_path(skill1)
        path2 = get_path(skill2)
        
        if not path1 or not path2:
            return "❌ 未找到技能路径"
        
        return f"""
📊 学习路径对比

{skill1}:
  时长：{path1['duration']}
  阶段：{len(path1['levels'])}个

{skill2}:
  时长：{path2['duration']}
  阶段：{len(path2['levels'])}个
        """.strip()
    
    elif command == 'help' or command == '帮助':
        return """
🎯 Learning Path - 学习路径

可用命令:
  path/路径 [技能]             - 查看学习路径
  level/阶段 [技能] [阶段号]     - 查看阶段详情
  list/列表                   - 所有路径
  compare/对比 [技能 1] [技能 2]  - 对比路径
  help/帮助                   - 显示帮助

示例:
  查看路径：path Python
  阶段详情：level Python 1
  所有路径：list
  路径对比：compare Python 前端开发
  
可用技能:
{skills}
        """.replace('{skills}', ', '.join(get_all_paths()))
    
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
