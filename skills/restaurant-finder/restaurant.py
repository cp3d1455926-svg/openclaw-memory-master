#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Restaurant Finder - 餐厅推荐
基于位置/口味/预算的餐厅推荐
"""

import random
from typing import List, Dict

# 内置餐厅数据（示例）
RESTAURANTS = [
    {
        'id': 1,
        'name': '川香阁',
        'cuisine': '川菜',
        'price_range': '¥¥',
        'rating': 4.5,
        'location': '朝阳区',
        'features': ['辣', '聚餐', '外卖'],
        'signature': '水煮鱼、麻婆豆腐'
    },
    {
        'id': 2,
        'name': '粤味轩',
        'cuisine': '粤菜',
        'price_range': '¥¥¥',
        'rating': 4.7,
        'location': '海淀区',
        'features': ['清淡', '早茶', '商务'],
        'signature': '烧鹅、虾饺'
    },
    {
        'id': 3,
        'name': '拉面王',
        'cuisine': '西北菜',
        'price_range': '¥',
        'rating': 4.2,
        'location': '西城区',
        'features': ['快餐', '面食', '实惠'],
        'signature': '兰州拉面、肉夹馍'
    },
    {
        'id': 4,
        'name': '寿司之家',
        'cuisine': '日料',
        'price_range': '¥¥¥',
        'rating': 4.6,
        'location': '东城区',
        'features': ['生食', '精致', '约会'],
        'signature': '三文鱼刺身、鳗鱼饭'
    },
    {
        'id': 5,
        'name': '披萨小屋',
        'cuisine': '西餐',
        'price_range': '¥¥',
        'rating': 4.3,
        'location': '朝阳区',
        'features': ['披萨', '意面', '外卖'],
        'signature': '意式披萨、意大利面'
    },
    {
        'id': 6,
        'name': '火锅城',
        'cuisine': '火锅',
        'price_range': '¥¥',
        'rating': 4.4,
        'location': '丰台区',
        'features': ['辣', '聚餐', '夜宵'],
        'signature': '麻辣锅底、肥牛'
    },
    {
        'id': 7,
        'name': '素食坊',
        'cuisine': '素食',
        'price_range': '¥¥',
        'rating': 4.5,
        'location': '海淀区',
        'features': ['健康', '清淡', '养生'],
        'signature': '素斋套餐、养生汤'
    },
    {
        'id': 8,
        'name': '韩式烤肉',
        'cuisine': '韩料',
        'price_range': '¥¥',
        'rating': 4.4,
        'location': '朝阳区',
        'features': ['烤肉', '聚餐', '夜宵'],
        'signature': '五花肉、石锅拌饭'
    }
]


def get_cuisines() -> List[str]:
    """获取所有菜系"""
    cuisines = set(r.get('cuisine', '其他') for r in RESTAURANTS)
    return sorted(list(cuisines))


def get_locations() -> List[str]:
    """获取所有区域"""
    locations = set(r.get('location', '其他') for r in RESTAURANTS)
    return sorted(list(locations))


def get_price_ranges() -> List[str]:
    """获取所有价格区间"""
    return ['¥', '¥¥', '¥¥¥']


def search_restaurants(cuisine: str = None, location: str = None, 
                       price_range: str = None, features: List[str] = None) -> List[Dict]:
    """搜索餐厅"""
    results = RESTAURANTS
    
    if cuisine:
        results = [r for r in results if r.get('cuisine') == cuisine]
    
    if location:
        results = [r for r in results if r.get('location') == location]
    
    if price_range:
        results = [r for r in results if r.get('price_range') == price_range]
    
    if features:
        results = [r for r in results if any(f in r.get('features', []) for f in features)]
    
    # 按评分排序
    results.sort(key=lambda x: x.get('rating', 0), reverse=True)
    
    return results


def recommend_restaurant(budget: str = None, occasion: str = None) -> Dict:
    """推荐餐厅"""
    results = RESTAURANTS
    
    if budget:
        results = [r for r in results if r.get('price_range') == budget]
    
    if occasion:
        # 根据场合筛选
        if occasion == '聚餐':
            results = [r for r in results if '聚餐' in r.get('features', [])]
        elif occasion == '约会':
            results = [r for r in results if '约会' in r.get('features', []) or r.get('rating', 0) >= 4.5]
        elif occasion == '商务':
            results = [r for r in results if '商务' in r.get('features', [])]
        elif occasion == '快餐':
            results = [r for r in results if '快餐' in r.get('features', []) or r.get('price_range') == '¥']
    
    if not results:
        return None
    
    return random.choice(results)


def format_restaurant(restaurant: Dict) -> str:
    """格式化餐厅信息"""
    stars = '⭐' * int(restaurant.get('rating', 0))
    features = ', '.join(restaurant.get('features', []))
    
    return f"""
🍽️ {restaurant['name']}

菜系：{restaurant.get('cuisine', '其他')}
区域：{restaurant.get('location', '未知')}
价格：{restaurant.get('price_range', '未知')}
评分：{stars} ({restaurant.get('rating', 0)})
特色：{features}
招牌：{restaurant.get('signature', '无')}
    """.strip()


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'search' or command == '搜索':
        cuisine = None
        location = None
        price = None
        
        # 简单解析参数
        for arg in args:
            if arg in get_cuisines():
                cuisine = arg
            elif arg in get_locations():
                location = arg
            elif arg in get_price_ranges():
                price = arg
        
        results = search_restaurants(cuisine, location, price)
        
        if not results:
            return "😅 未找到符合条件的餐厅"
        
        lines = [f"🍽️ 找到 {len(results)} 家餐厅:"]
        for r in results[:5]:
            lines.append(f"├─ {r['name']} ({r['cuisine']}) - {r['location']} {r['price_range']} {'⭐' * int(r['rating'])}")
        
        if len(results) > 5:
            lines.append(f"└─ ... 还有{len(results) - 5}家")
        
        return '\n'.join(lines)
    
    elif command == 'recommend' or command == '推荐':
        budget = None
        occasion = None
        
        for arg in args:
            if arg in get_price_ranges():
                budget = arg
            elif arg in ['聚餐', '约会', '商务', '快餐']:
                occasion = arg
        
        restaurant = recommend_restaurant(budget, occasion)
        
        if restaurant:
            return format_restaurant(restaurant)
        else:
            return "😅 未找到合适的餐厅"
    
    elif command == 'cuisines' or command == '菜系':
        cuisines = get_cuisines()
        return "🍜 可选菜系:\n" + '\n'.join(f"├─ {c}" for c in cuisines)
    
    elif command == 'locations' or command == '区域':
        locations = get_locations()
        return "📍 可选区域:\n" + '\n'.join(f"├─ {l}" for l in locations)
    
    elif command == 'top' or command == '排行':
        results = sorted(RESTAURANTS, key=lambda x: x.get('rating', 0), reverse=True)[:5]
        
        lines = ["🏆 餐厅排行榜:"]
        for i, r in enumerate(results, 1):
            lines.append(f"{i}. {r['name']} ({r['cuisine']}) - {'⭐' * int(r['rating'])} {r['rating']}")
        
        return '\n'.join(lines)
    
    elif command == 'random' or command == '随机':
        restaurant = random.choice(RESTAURANTS)
        return format_restaurant(restaurant)
    
    elif command == 'help' or command == '帮助':
        return """
🍽️ Restaurant Finder - 餐厅推荐

可用命令:
  search/搜索 [菜系] [区域] [价格]  - 搜索餐厅
  recommend/推荐 [预算] [场合]      - 推荐餐厅
  cuisines/菜系                   - 查看菜系
  locations/区域                  - 查看区域
  top/排行                        - 餐厅排行
  random/随机                     - 随机餐厅
  help/帮助                       - 显示帮助

示例:
  搜索川菜：search 川菜
  搜索朝阳区：search 朝阳区
  推荐餐厅：recommend
  聚餐推荐：recommend 聚餐
  预算推荐：recommend ¥¥
  
菜系：川菜、粤菜、西北菜、日料、西餐、火锅、素食、韩料
区域：朝阳区、海淀区、西城区、东城区、丰台区
价格：¥ (实惠) | ¥¥ (中等) | ¥¥¥ (高档)
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
