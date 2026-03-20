#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Flashcard - 单词卡片
记忆曲线、每日背诵、单词测验
"""

import json
import os
import random
from datetime import datetime, timedelta
from typing import List, Dict

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
WORDS_FILE = os.path.join(DATA_DIR, 'words.json')
PROGRESS_FILE = os.path.join(DATA_DIR, 'progress.json')

# 内置单词库（示例）
DEFAULT_WORDS = [
    {'id': 1, 'word': 'abandon', 'phonetic': '/əˈbændən/', 'meaning': 'v. 放弃，抛弃', 'example': 'He abandoned his car in the snow.', 'level': 'CET-4'},
    {'id': 2, 'word': 'ability', 'phonetic': '/əˈbɪləti/', 'meaning': 'n. 能力，才能', 'example': 'She has the ability to learn quickly.', 'level': 'CET-4'},
    {'id': 3, 'word': 'abnormal', 'phonetic': '/æbˈnɔːrməl/', 'meaning': 'adj. 反常的，异常的', 'example': 'The weather is abnormal for this time of year.', 'level': 'CET-6'},
    {'id': 4, 'word': 'aboard', 'phonetic': '/əˈbɔːrd/', 'meaning': 'adv. 在船 (车) 上', 'example': 'Welcome aboard!', 'level': 'CET-4'},
    {'id': 5, 'word': 'absolute', 'phonetic': '/ˈæbsəluːt/', 'meaning': 'adj. 绝对的，完全的', 'example': 'I have absolute confidence in you.', 'level': 'CET-4'},
    {'id': 6, 'word': 'absorb', 'phonetic': '/əbˈzɔːrb/', 'meaning': 'v. 吸收，吸引', 'example': 'Plants absorb sunlight.', 'level': 'CET-6'},
    {'id': 7, 'word': 'abstract', 'phonetic': '/ˈæbstrækt/', 'meaning': 'adj. 抽象的 n. 摘要', 'example': 'This is an abstract concept.', 'level': 'CET-6'},
    {'id': 8, 'word': 'academic', 'phonetic': '/ˌækəˈdemɪk/', 'meaning': 'adj. 学术的，学院的', 'example': 'He has a strong academic background.', 'level': 'CET-4'},
    {'id': 9, 'word': 'accelerate', 'phonetic': '/əkˈseləreɪt/', 'meaning': 'v. 加速，促进', 'example': 'The car accelerated quickly.', 'level': 'CET-6'},
    {'id': 10, 'word': 'access', 'phonetic': '/ˈækses/', 'meaning': 'n./v. 进入，使用', 'example': 'Students need access to computers.', 'level': 'CET-4'},
]


def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)


def load_words() -> List[Dict]:
    ensure_data_dir()
    if os.path.exists(WORDS_FILE):
        try:
            with open(WORDS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return DEFAULT_WORDS.copy()
    return DEFAULT_WORDS.copy()


def save_words(words: List[Dict]):
    ensure_data_dir()
    with open(WORDS_FILE, 'w', encoding='utf-8') as f:
        json.dump(words, f, indent=2, ensure_ascii=False)


def load_progress() -> List[Dict]:
    ensure_data_dir()
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []


def save_progress(progress: List[Dict]):
    ensure_data_dir()
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)


def get_word_progress(word_id: int) -> Dict:
    """获取单词学习进度"""
    progress = load_progress()
    
    for p in progress:
        if p.get('word_id') == word_id:
            return p
    
    return {
        'word_id': word_id,
        'level': 0,  # 0-5, 5 为已掌握
        'review_count': 0,
        'next_review': datetime.now().isoformat(),
        'last_review': None
    }


def update_progress(word_id: int, correct: bool):
    """更新学习进度（艾宾浩斯记忆曲线）"""
    progress = load_progress()
    
    # 查找或创建进度记录
    word_progress = None
    for p in progress:
        if p.get('word_id') == word_id:
            word_progress = p
            break
    
    if not word_progress:
        word_progress = {
            'word_id': word_id,
            'level': 0,
            'review_count': 0,
            'next_review': datetime.now().isoformat(),
            'last_review': None
        }
        progress.append(word_progress)
    
    # 更新进度
    word_progress['review_count'] += 1
    word_progress['last_review'] = datetime.now().isoformat()
    
    if correct:
        word_progress['level'] = min(word_progress['level'] + 1, 5)
    else:
        word_progress['level'] = max(word_progress['level'] - 1, 0)
    
    # 计算下次复习时间（艾宾浩斯曲线）
    intervals = [0, 1, 2, 4, 7, 15]  # 天数
    interval = intervals[word_progress['level']]
    next_review = datetime.now() + timedelta(days=interval)
    word_progress['next_review'] = next_review.isoformat()
    
    save_progress(progress)
    
    return word_progress


def get_due_words() -> List[Dict]:
    """获取今日需要复习的单词"""
    words = load_words()
    progress = load_progress()
    now = datetime.now()
    
    due_words = []
    
    for word in words:
        word_progress = None
        for p in progress:
            if p.get('word_id') == word['id']:
                word_progress = p
                break
        
        # 新单词或到期复习
        if not word_progress:
            due_words.append(word)
        else:
            next_review = datetime.fromisoformat(word_progress['next_review'])
            if next_review <= now:
                due_words.append(word)
    
    return due_words[:20]  # 限制每日 20 个


def get_random_words(count: int = 10) -> List[Dict]:
    """随机获取单词"""
    words = load_words()
    return random.sample(words, min(count, len(words)))


def add_word(word: str, phonetic: str, meaning: str, example: str = '', level: str = 'CET-4') -> Dict:
    """添加新单词"""
    words = load_words()
    
    word_id = max([w.get('id', 0) for w in words], default=0) + 1
    
    new_word = {
        'id': word_id,
        'word': word,
        'phonetic': phonetic,
        'meaning': meaning,
        'example': example,
        'level': level,
        'created_at': datetime.now().isoformat()
    }
    
    words.append(new_word)
    save_words(words)
    
    return new_word


def get_levels() -> Dict:
    """获取等级说明"""
    return {
        0: '❌ 未学习',
        1: '🔴 生疏 (1 天后复习)',
        2: '🟠 熟悉 (2 天后复习)',
        3: '🟡 掌握 (4 天后复习)',
        4: '🟢 熟练 (7 天后复习)',
        5: '💯 已掌握 (15 天后复习)'
    }


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'today' or command == '今日':
        words = get_due_words()
        
        if not words:
            return "🎉 今日单词已全部完成！"
        
        lines = [f"📖 今日单词 ({len(words)} 个):\n"]
        
        for i, word in enumerate(words[:10], 1):
            lines.append(f"{i}. **{word['word']}** {word.get('phonetic', '')}")
            lines.append(f"   {word.get('meaning', '')}")
            if word.get('example'):
                lines.append(f"   例：{word['example']}")
            lines.append("")
        
        if len(words) > 10:
            lines.append(f"... 还有{len(words) - 10}个")
        
        lines.append("\n💡 用法：review [单词 ID] [正确/错误]")
        
        return '\n'.join(lines)
    
    elif command == 'review' or command == '复习':
        if len(args) < 2:
            return "❌ 用法：review [单词 ID] [1/0]\n1=正确，0=错误"
        
        try:
            word_id = int(args[0])
            correct = args[1] == '1'
            
            progress = update_progress(word_id, correct)
            
            words = load_words()
            word = next((w for w in words if w['id'] == word_id), None)
            
            if word:
                status = "✅ 正确" if correct else "❌ 错误"
                level_names = ['未学习', '生疏', '熟悉', '掌握', '熟练', '已掌握']
                level = level_names[progress['level']]
                
                return f"""
{status}

单词：{word['word']}
当前等级：{level}
复习次数：{progress['review_count']}
下次复习：{progress['next_review'][:10]}
                """.strip()
            else:
                return "❌ 未找到单词"
        except ValueError:
            return "❌ 参数错误"
    
    elif command == 'random' or command == '随机':
        count = int(args[0]) if args and args[0].isdigit() else 10
        words = get_random_words(count)
        
        lines = [f"🎲 随机单词 ({len(words)} 个):\n"]
        
        for word in words:
            lines.append(f"**{word['word']}** {word.get('phonetic', '')}")
            lines.append(f"{word.get('meaning', '')}")
            lines.append("")
        
        return '\n'.join(lines)
    
    elif command == 'add' or command == '添加':
        if len(args) < 3:
            return "❌ 用法：add [单词] [音标] [释义] [例句] [级别]"
        
        word = add_word(
            word=args[0],
            phonetic=args[1],
            meaning=' '.join(args[2:3]) if len(args) > 2 else '',
            example=' '.join(args[3:4]) if len(args) > 3 else '',
            level=args[4] if len(args) > 4 else 'CET-4'
        )
        
        return f"✅ 已添加单词：{word['word']}"
    
    elif command == 'stats' or command == '统计':
        progress = load_progress()
        words = load_words()
        
        total = len(words)
        learned = len(progress)
        mastered = sum(1 for p in progress if p.get('level', 0) >= 5)
        due = len(get_due_words())
        
        return f"""
📊 学习统计

总单词数：{total}
已学习：{learned}
已掌握：{mastered}
待复习：{due}
完成率：{learned/total*100:.1f}%
        """.strip()
    
    elif command == 'levels' or command == '等级':
        levels = get_levels()
        
        lines = ["📈 记忆等级:"]
        for level, desc in levels.items():
            lines.append(f"├─ Lv.{level}: {desc}")
        
        return '\n'.join(lines)
    
    elif command == 'help' or command == '帮助':
        return """
📖 Flashcard - 单词卡片

可用命令:
  today/今日                 - 今日待复习单词
  review/复习 [ID] [1/0]      - 复习单词 (1 正确/0 错误)
  random/随机 [数量]          - 随机单词
  add/添加 [单词] [音标] [释义]  - 添加单词
  stats/统计                 - 学习统计
  levels/等级                - 等级说明
  help/帮助                  - 显示帮助

示例:
  今日单词：today
  复习单词：review 1 1
  随机单词：random 10
  添加单词：add hello /həˈloʊ/ 你好 Hello! CET-4
  
记忆曲线:
  1 天后 → 2 天后 → 4 天后 → 7 天后 → 15 天后
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
