#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Shopping List - 购物清单
智能分类、比价提醒、预算管理
"""

import json
import os
from datetime import datetime
from typing import List, Dict

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
LIST_FILE = os.path.join(DATA_DIR, 'shopping_list.json')
HISTORY_FILE = os.path.join(DATA_DIR, 'history.json')

# 商品分类
CATEGORIES = {
    '🥬 生鲜': ['蔬菜', '水果', '肉类', '海鲜', '鸡蛋'],
    '🥛 乳品': ['牛奶', '酸奶', '奶酪', '黄油'],
    '🍞 主食': ['面包', '米饭', '面条', '馒头'],
    '🥤 饮料': ['水', '果汁', '碳酸饮料', '茶', '咖啡'],
    '🍪 零食': ['饼干', '薯片', '糖果', '坚果'],
    '🧴 日用': ['洗发水', '沐浴露', '牙膏', '纸巾', '洗衣液'],
    '💊 药品': ['感冒药', '创可贴', '维生素', '口罩'],
    '其他': []
}


def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)


def load_list() -> List[Dict]:
    ensure_data_dir()
    if os.path.exists(LIST_FILE):
        try:
            with open(LIST_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []


def save_list(items: List[Dict]):
    ensure_data_dir()
    with open(LIST_FILE, 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2, ensure_ascii=False)


def add_item(name: str, category: str = '其他', quantity: str = '1', 
             estimated_price: float = 0, priority: str = 'normal') -> Dict:
    """添加购物项"""
    items = load_list()
    
    # 检查是否已存在
    for item in items:
        if item.get('name') == name and not item.get('purchased'):
            item['quantity'] = quantity
            item['estimated_price'] = estimated_price
            item['priority'] = priority
            item['updated_at'] = datetime.now().isoformat()
            save_list(items)
            return item
    
    # 新建
    item = {
        'id': len(items) + 1,
        'name': name,
        'category': category,
        'quantity': quantity,
        'estimated_price': estimated_price,
        'actual_price': 0,
        'priority': priority,  # high/normal/low
        'purchased': False,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    items.append(item)
    save_list(items)
    
    return item


def mark_purchased(item_id: int, actual_price: float = 0) -> Dict:
    """标记已购买"""
    items = load_list()
    
    for item in items:
        if item.get('id') == item_id:
            item['purchased'] = True
            item['actual_price'] = actual_price
            item['purchased_at'] = datetime.now().isoformat()
            save_list(items)
            return item
    
    return None


def remove_item(item_id: int) -> bool:
    """删除购物项"""
    items = load_list()
    original_len = len(items)
    
    items = [i for i in items if i.get('id') != item_id]
    
    if len(items) < original_len:
        save_list(items)
        return True
    
    return False


def get_list(show_purchased: bool = False) -> List[Dict]:
    """获取购物清单"""
    items = load_list()
    
    if not show_purchased:
        items = [i for i in items if not i.get('purchased')]
    
    # 按优先级排序
    priority_order = {'high': 0, 'normal': 1, 'low': 2}
    items.sort(key=lambda x: (priority_order.get(x.get('priority', 'normal'), 1), x.get('category', '')))
    
    return items


def get_total() -> Dict:
    """获取统计"""
    items = load_list()
    
    pending = [i for i in items if not i.get('purchased')]
    purchased = [i for i in items if i.get('purchased')]
    
    estimated_total = sum(i.get('estimated_price', 0) for i in pending)
    actual_total = sum(i.get('actual_price', 0) for i in purchased)
    
    return {
        'pending_count': len(pending),
        'purchased_count': len(purchased),
        'estimated_total': estimated_total,
        'actual_total': actual_total
    }


def clear_purchased() -> int:
    """清空已购买项"""
    items = load_list()
    original_len = len(items)
    
    items = [i for i in items if not i.get('purchased')]
    
    if len(items) < original_len:
        save_list(items)
        return original_len - len(items)
    
    return 0


def get_categories_list() -> Dict:
    """获取分类列表"""
    return CATEGORIES


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'add' or command == '添加':
        if not args:
            return "❌ 请提供商品名称"
        
        name = args[0]
        category = '其他'
        quantity = '1'
        price = 0
        priority = 'normal'
        
        # 解析参数
        for arg in args[1:]:
            if arg.startswith('#'):
                category = arg[1:]
            elif arg.isdigit():
                quantity = arg
            elif arg.replace('.', '').isdigit():
                price = float(arg)
            elif arg in ['high', 'normal', 'low', '高', '中', '低']:
                priority_map = {'高': 'high', '中': 'normal', '低': 'low'}
                priority = priority_map.get(arg, arg)
        
        item = add_item(name, category, quantity, price, priority)
        
        return f"""
✅ 已添加到购物清单

商品：{item['name']}
分类：{item['category']}
数量：{item['quantity']}
预估价：¥{item['estimated_price']:.2f}
优先级：{'🔴 高' if priority == 'high' else '🟡 中' if priority == 'normal' else '🟢 低'}
        """.strip()
    
    elif command == 'list' or command == '清单':
        items = get_list()
        
        if not items:
            return "🛒 购物清单是空的"
        
        # 按分类分组
        by_category = {}
        for item in items:
            cat = item.get('category', '其他')
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(item)
        
        lines = ["🛒 购物清单:"]
        total = 0
        
        for cat, cat_items in by_category.items():
            lines.append(f"\n{cat}")
            for item in cat_items:
                priority_icon = '🔴' if item['priority'] == 'high' else '🟡' if item['priority'] == 'normal' else '🟢'
                lines.append(f"├─ {priority_icon} {item['name']} ×{item['quantity']} ¥{item['estimated_price']:.2f}")
                total += item['estimated_price']
        
        lines.append(f"\n💰 预估总计：¥{total:.2f}")
        lines.append(f"📦 共{len(items)}件商品")
        
        return '\n'.join(lines)
    
    elif command == 'buy' or command == '购买':
        if not args:
            return "❌ 请提供商品 ID"
        
        try:
            item_id = int(args[0])
            actual_price = float(args[1]) if len(args) > 1 else 0
            
            item = mark_purchased(item_id, actual_price)
            
            if item:
                return f"✅ 已标记：{item['name']} 已购买 ¥{actual_price:.2f}"
            else:
                return f"❌ 未找到商品 #{item_id}"
        except ValueError:
            return "❌ 参数错误"
    
    elif command == 'remove' or command == '删除':
        if not args:
            return "❌ 请提供商品 ID"
        
        try:
            item_id = int(args[0])
            if remove_item(item_id):
                return f"✅ 已删除商品 #{item_id}"
            else:
                return f"❌ 未找到商品 #{item_id}"
        except ValueError:
            return "❌ 参数错误"
    
    elif command == 'done' or command == '完成':
        count = clear_purchased()
        return f"✅ 已清空{count}件已购买商品"
    
    elif command == 'stats' or command == '统计':
        stats = get_total()
        
        return f"""
📊 购物统计

待购买：{stats['pending_count']} 件
已购买：{stats['purchased_count']} 件

预估：¥{stats['estimated_total']:.2f}
实际：¥{stats['actual_total']:.2f}
        """.strip()
    
    elif command == 'categories' or command == '分类':
        cats = get_categories_list()
        
        lines = ["📂 商品分类:"]
        for icon, cat_items in cats.items():
            lines.append(f"\n{icon}")
            if cat_items:
                for sub in cat_items:
                    lines.append(f"├─ {sub}")
            else:
                lines.append("└─ (自定义)")
        
        return '\n'.join(lines)
    
    elif command == 'help' or command == '帮助':
        return """
🛒 Shopping List - 购物清单

可用命令:
  add/添加 [商品] [#分类] [数量] [价格] [优先级]  - 添加商品
  list/清单                                   - 查看清单
  buy/购买 [ID] [实际价格]                     - 标记购买
  remove/删除 [ID]                            - 删除商品
  done/完成                                   - 清空已购买
  stats/统计                                  - 查看统计
  categories/分类                             - 查看分类
  help/帮助                                   - 显示帮助

优先级：high/高 | normal/中 | low/低

示例:
  添加商品：add 苹果 #水果 5 10
  添加商品：add 牛奶 #乳品 2 15 high
  查看清单：list
  标记购买：buy 1 9.5
  查看统计：stats
  
分类:
  🥬 生鲜 | 🥛 乳品 | 🍞 主食 | 🥤 饮料
  🍪 零食 | 🧴 日用 | 💊 药品 | 其他
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
