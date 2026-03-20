#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Workout Plan - 健身计划
定制训练方案、动作指导、进度追踪
"""

import random
from datetime import datetime
from typing import List, Dict

# 内置健身计划
WORKOUT_PLANS = {
    '减脂': {
        'duration': '4 周',
        'frequency': '每周 4-5 次',
        'exercises': [
            {'name': '开合跳', 'sets': 4, 'reps': '30 秒', 'rest': '30 秒'},
            {'name': '高抬腿', 'sets': 4, 'reps': '30 秒', 'rest': '30 秒'},
            {'name': '波比跳', 'sets': 3, 'reps': '10 次', 'rest': '60 秒'},
            {'name': '深蹲', 'sets': 4, 'reps': '15 次', 'rest': '60 秒'},
            {'name': '平板支撑', 'sets': 3, 'reps': '45 秒', 'rest': '45 秒'}
        ],
        'tips': '控制饮食，有氧 + 力量结合，保持充足睡眠'
    },
    '增肌': {
        'duration': '8 周',
        'frequency': '每周 4 次',
        'exercises': [
            {'name': '卧推', 'sets': 4, 'reps': '8-12 次', 'rest': '90 秒'},
            {'name': '深蹲', 'sets': 4, 'reps': '8-12 次', 'rest': '90 秒'},
            {'name': '硬拉', 'sets': 4, 'reps': '6-8 次', 'rest': '120 秒'},
            {'name': '引体向上', 'sets': 4, 'reps': '8-12 次', 'rest': '90 秒'},
            {'name': '推举', 'sets': 4, 'reps': '8-12 次', 'rest': '90 秒'}
        ],
        'tips': '高蛋白饮食，渐进超负荷，保证休息'
    },
    '塑形': {
        'duration': '6 周',
        'frequency': '每周 3-4 次',
        'exercises': [
            {'name': '箭步蹲', 'sets': 3, 'reps': '12 次/腿', 'rest': '60 秒'},
            {'name': '俯卧撑', 'sets': 3, 'reps': '12-15 次', 'rest': '60 秒'},
            {'name': '卷腹', 'sets': 3, 'reps': '20 次', 'rest': '45 秒'},
            {'name': '臀桥', 'sets': 3, 'reps': '15 次', 'rest': '60 秒'},
            {'name': '侧支撑', 'sets': 3, 'reps': '30 秒/侧', 'rest': '45 秒'}
        ],
        'tips': '注重动作质量，均衡饮食，配合拉伸'
    },
    '新手': {
        'duration': '4 周',
        'frequency': '每周 3 次',
        'exercises': [
            {'name': '深蹲', 'sets': 3, 'reps': '10 次', 'rest': '60 秒'},
            {'name': '俯卧撑', 'sets': 3, 'reps': '5-10 次', 'rest': '60 秒'},
            {'name': '卷腹', 'sets': 3, 'reps': '10 次', 'rest': '45 秒'},
            {'name': '平板支撑', 'sets': 3, 'reps': '20 秒', 'rest': '45 秒'},
            {'name': '开合跳', 'sets': 3, 'reps': '20 秒', 'rest': '30 秒'}
        ],
        'tips': '循序渐进，注意动作标准，不要急于求成'
    }
}


def get_plan(goal: str) -> Dict:
    """获取健身计划"""
    return WORKOUT_PLANS.get(goal, WORKOUT_PLANS['新手'])


def get_daily_workout(goal: str = '新手') -> List[Dict]:
    """获取今日训练"""
    plan = get_plan(goal)
    exercises = plan['exercises']
    
    # 随机选择 3-5 个动作
    count = random.randint(3, min(5, len(exercises)))
    return random.sample(exercises, count)


def format_exercise(exercise: Dict, index: int) -> str:
    """格式化动作信息"""
    return f"""
{index}. {exercise['name']}
   组数：{exercise['sets']} 组
   次数：{exercise['reps']}
   休息：{exercise['rest']}
    """.strip()


def get_tips(goal: str) -> List[str]:
    """获取健身建议"""
    tips_db = {
        '减脂': [
            '控制碳水化合物摄入',
            '每天有氧 30 分钟以上',
            '多喝水，少喝含糖饮料',
            '保证 7-8 小时睡眠'
        ],
        '增肌': [
            '每公斤体重摄入 1.6-2.2g 蛋白质',
            '训练后 30 分钟内补充蛋白质',
            '每周渐进增加重量',
            '肌肉在休息时生长，保证睡眠'
        ],
        '塑形': [
            '注重动作质量而非重量',
            '配合拉伸和瑜伽',
            '均衡饮食，不要节食',
            '保持耐心，塑形需要时间'
        ],
        '新手': [
            '先学习正确动作姿势',
            '从轻重量开始',
            '训练前热身，训练后拉伸',
            '不要和别人比较，专注自己进步'
        ]
    }
    
    return tips_db.get(goal, tips_db['新手'])


def track_workout(goal: str, completed: bool = True) -> Dict:
    """记录训练"""
    return {
        'date': datetime.now().strftime('%Y-%m-%d'),
        'goal': goal,
        'completed': completed,
        'timestamp': datetime.now().isoformat()
    }


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'plan' or command == '计划':
        goal = args[0] if args else '新手'
        
        if goal not in WORKOUT_PLANS.keys():
            return f"❌ 未知目标 '{goal}'\n可用：{', '.join(WORKOUT_PLANS.keys())}"
        
        plan = get_plan(goal)
        
        lines = [
            f"💪 {goal}健身计划",
            "",
            f"📅 周期：{plan['duration']}",
            f"📆 频率：{plan['frequency']}",
            "",
            "🏋️ 训练动作:"
        ]
        
        for i, ex in enumerate(plan['exercises'], 1):
            lines.append(f"  {i}. {ex['name']} - {ex['sets']}组×{ex['reps']} (休息{ex['rest']})")
        
        lines.append("")
        lines.append(f"💡 建议：{plan['tips']}")
        
        return '\n'.join(lines)
    
    elif command == 'today' or command == '今日':
        goal = args[0] if args else '新手'
        exercises = get_daily_workout(goal)
        
        lines = [f"📅 今日训练 ({goal})\n"]
        
        for i, ex in enumerate(exercises, 1):
            lines.append(format_exercise(ex, i))
        
        lines.append("")
        lines.append("💪 加油！完成记得打卡哦~")
        
        return '\n'.join(lines)
    
    elif command == 'tips' or command == '建议':
        goal = args[0] if args else '新手'
        tips = get_tips(goal)
        
        lines = [f"💡 {goal}健身建议:"]
        for tip in tips:
            lines.append(f"├─ {tip}")
        
        return '\n'.join(lines)
    
    elif command == 'checkin' or command == '打卡':
        goal = args[0] if args else '新手'
        result = track_workout(goal)
        
        return f"""
✅ 训练打卡成功！

日期：{result['date']}
目标：{result['goal']}
状态：已完成 💪

坚持就是胜利！
        """.strip()
    
    elif command == 'goals' or command == '目标':
        goals = list(WORKOUT_PLANS.keys())
        
        lines = ["🎯 健身目标:"]
        for g in goals:
            plan = WORKOUT_PLANS[g]
            lines.append(f"├─ {g} - {plan['duration']} | {plan['frequency']}")
        
        return '\n'.join(lines)
    
    elif command == 'help' or command == '帮助':
        return """
💪 Workout Plan - 健身计划

可用命令:
  plan/计划 [目标]              - 查看健身计划
  today/今日 [目标]             - 今日训练
  tips/建议 [目标]              - 健身建议
  checkin/打卡 [目标]           - 训练打卡
  goals/目标                   - 查看所有目标
  help/帮助                    - 显示帮助

健身目标:
  新手 - 4 周 | 每周 3 次
  减脂 - 4 周 | 每周 4-5 次
  增肌 - 8 周 | 每周 4 次
  塑形 - 6 周 | 每周 3-4 次

示例:
  查看计划：plan 减脂
  今日训练：today 新手
  健身建议：tips 增肌
  训练打卡：checkin 减脂
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
