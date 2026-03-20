#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Git Helper - Git 助手
常用命令速查、冲突解决指南、最佳实践
"""

from typing import List, Dict

# Git 命令库
GIT_COMMANDS = {
    '基础': [
        {'cmd': 'git init', 'desc': '初始化仓库'},
        {'cmd': 'git clone <url>', 'desc': '克隆仓库'},
        {'cmd': 'git status', 'desc': '查看状态'},
        {'cmd': 'git add <file>', 'desc': '添加文件到暂存区'},
        {'cmd': 'git commit -m "msg"', 'desc': '提交更改'},
        {'cmd': 'git push', 'desc': '推送到远程'},
        {'cmd': 'git pull', 'desc': '拉取远程更改'},
    ],
    '分支': [
        {'cmd': 'git branch', 'desc': '查看分支'},
        {'cmd': 'git branch <name>', 'desc': '创建分支'},
        {'cmd': 'git checkout <name>', 'desc': '切换分支'},
        {'cmd': 'git checkout -b <name>', 'desc': '创建并切换'},
        {'cmd': 'git merge <name>', 'desc': '合并分支'},
        {'cmd': 'git branch -d <name>', 'desc': '删除分支'},
    ],
    '撤销': [
        {'cmd': 'git checkout -- <file>', 'desc': '撤销工作区更改'},
        {'cmd': 'git reset HEAD <file>', 'desc': '撤销暂存'},
        {'cmd': 'git commit --amend', 'desc': '修改上次提交'},
        {'cmd': 'git reset --soft HEAD~1', 'desc': '撤销提交 (保留更改)'},
        {'cmd': 'git reset --hard HEAD~1', 'desc': '撤销提交 (删除更改)'},
    ],
    '远程': [
        {'cmd': 'git remote -v', 'desc': '查看远程仓库'},
        {'cmd': 'git remote add <name> <url>', 'desc': '添加远程仓库'},
        {'cmd': 'git fetch <remote>', 'desc': '获取远程更改'},
        {'cmd': 'git push -u origin <branch>', 'desc': '推送并设置上游'},
    ],
    '日志': [
        {'cmd': 'git log', 'desc': '查看提交历史'},
        {'cmd': 'git log --oneline', 'desc': '简洁历史'},
        {'cmd': 'git log --graph', 'desc': '图形化历史'},
        {'cmd': 'git show <commit>', 'desc': '查看提交详情'},
        {'cmd': 'git diff', 'desc': '查看差异'},
    ],
}

# 冲突解决指南
CONFLICT_GUIDE = """
🔧 Git 冲突解决指南

1. 找到冲突文件
   git status

2. 编辑冲突文件，找到冲突标记:
   <<<<<<< HEAD
   你的更改
   =======
   他人的更改
   >>>>>>> branch-name

3. 选择保留的更改，删除冲突标记

4. 标记为解决:
   git add <file>

5. 完成合并:
   git commit
"""

# 最佳实践
BEST_PRACTICES = [
    '提交信息要清晰描述更改内容',
    '小步提交，大步推送',
    '功能开发使用独立分支',
    '推送前 pull 最新代码',
    '敏感信息不要提交 (密码、密钥)',
    '使用 .gitignore 忽略不必要文件',
    '定期清理无用分支',
    '重要操作前备份',
]


def get_commands(category: str = None) -> Dict:
    """获取 Git 命令"""
    if category:
        return {category: GIT_COMMANDS.get(category, [])}
    return GIT_COMMANDS


def search_commands(keyword: str) -> List[Dict]:
    """搜索命令"""
    results = []
    
    for category, commands in GIT_COMMANDS.items():
        for cmd in commands:
            if keyword.lower() in cmd['cmd'].lower() or keyword.lower() in cmd['desc'].lower():
                results.append({
                    'category': category,
                    'command': cmd
                })
    
    return results


def get_quick_command(action: str) -> str:
    """获取快捷命令"""
    quick_map = {
        '初始化': 'git init',
        '克隆': 'git clone <url>',
        '状态': 'git status',
        '添加': 'git add .',
        '提交': 'git commit -m "msg"',
        '推送': 'git push',
        '拉取': 'git pull',
        '分支': 'git branch',
        '切换': 'git checkout <branch>',
        '合并': 'git merge <branch>',
        '日志': 'git log --oneline',
        '差异': 'git diff',
    }
    
    return quick_map.get(action, None)


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'list' or command == '列表':
        category = args[0] if args else None
        
        if category:
            commands = get_commands(category)
            if not commands:
                return f"❌ 未知分类 '{category}'"
        else:
            commands = get_commands()
        
        lines = ["🔧 Git 命令速查:\n"]
        
        for cat, cmds in commands.items():
            lines.append(f"📁 {cat}:")
            for cmd in cmds:
                lines.append(f"├─ {cmd['cmd']}")
                lines.append(f"│  {cmd['desc']}")
            lines.append("")
        
        return '\n'.join(lines)
    
    elif command == 'search' or command == '搜索':
        keyword = ' '.join(args) if args else ''
        
        if not keyword:
            return "❌ 请提供搜索关键词"
        
        results = search_commands(keyword)
        
        if not results:
            return f"😅 未找到包含 '{keyword}' 的命令"
        
        lines = [f"🔍 搜索结果 ({len(results)} 条):"]
        for r in results:
            lines.append(f"├─ [{r['category']}] {r['command']['cmd']}")
            lines.append(f"│  {r['command']['desc']}")
        
        return '\n'.join(lines)
    
    elif command == 'quick' or command == '快捷':
        if not args:
            return "❌ 请提供操作名称"
        
        action = args[0]
        cmd = get_quick_command(action)
        
        if cmd:
            return f"🔧 {action}: {cmd}"
        else:
            available = ', '.join(get_quick_command(k) for k in ['初始化', '克隆', '状态', '提交', '推送'])
            return f"❌ 未知操作 '{action}'\n可用：初始化、克隆、状态、提交、推送..."
    
    elif command == 'conflict' or command == '冲突':
        return CONFLICT_GUIDE
    
    elif command == 'practices' or command == '实践':
        lines = ["💡 Git 最佳实践:"]
        for p in BEST_PRACTICES:
            lines.append(f"├─ {p}")
        
        return '\n'.join(lines)
    
    elif command == 'workflow' or command == '流程':
        return """
📋 Git 标准工作流程:

1. 开始新功能
   git checkout -b feature/new-feature

2. 开发并提交
   git add .
   git commit -m "feat: 添加新功能"

3. 同步主分支
   git checkout main
   git pull
   git checkout feature/new-feature
   git rebase main

4. 推送并创建 PR
   git push -u origin feature/new-feature
   # 在 GitHub/Gitee 创建 Pull Request

5. 合并后清理
   git checkout main
   git pull
   git branch -d feature/new-feature
        """
    
    elif command == 'help' or command == '帮助':
        return """
🔧 Git Helper - Git 助手

可用命令:
  list/列表 [分类]            - 查看命令
  search/搜索 [关键词]         - 搜索命令
  quick/快捷 [操作]           - 快捷命令
  conflict/冲突               - 冲突解决
  practices/实践              - 最佳实践
  workflow/流程               - 工作流程
  help/帮助                   - 显示帮助

命令分类:
- 基础 (init/clone/status/add/commit/push/pull)
- 分支 (branch/checkout/merge)
- 撤销 (checkout/reset/amend)
- 远程 (remote/fetch/push)
- 日志 (log/show/diff)

示例:
  查看基础：list 基础
  搜索提交：search commit
  快捷操作：quick 提交
  冲突解决：conflict
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
