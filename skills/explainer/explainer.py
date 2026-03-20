#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Explainer - 概念解释
复杂概念简单化讲解、类比说明、示例演示
"""

import random
from typing import List, Dict

# 内置概念库
CONCEPTS = {
    '区块链': {
        'simple': '区块链就像一个公共账本，每个人都有一本副本，任何人都可以看到交易记录，但没有人能单独修改它。',
        'analogy': '就像班级里的记账本，每笔班费支出都记在上面，全班人手一份，谁想改都得经过大家同意。',
        'example': '比特币转账：A 转给 B 100 元，这个记录被打包进区块，添加到链上，所有人都能看到。',
        'keywords': ['去中心化', '分布式账本', '不可篡改', '共识机制']
    },
    '人工智能': {
        'simple': '人工智能是让计算机像人一样思考和学习的技术。',
        'analogy': '就像教小孩子认东西，给他看很多猫的照片，他慢慢就学会识别什么是猫了。',
        'example': '语音助手（如 Siri）、推荐系统（如抖音推荐）、自动驾驶等。',
        'keywords': ['机器学习', '深度学习', '神经网络', '自然语言处理']
    },
    '云计算': {
        'simple': '云计算是通过互联网提供计算服务（服务器、存储、数据库等），按需使用，按量付费。',
        'analogy': '就像用电，不用自己建发电厂，用多少付多少，云计算就是用多少计算资源付多少钱。',
        'example': '阿里云、腾讯云、AWS 等，企业不用买服务器，租用云服务即可。',
        'keywords': ['IaaS', 'PaaS', 'SaaS', '弹性扩展']
    },
    'API': {
        'simple': 'API 是应用程序之间的接口，让不同软件可以互相通信。',
        'analogy': '就像餐厅的服务员，你（用户）不用进厨房（系统内部），通过服务员（API）点菜就能得到食物。',
        'example': '微信支付 API：网站调用它就能让你用微信付款。',
        'keywords': ['接口', '请求', '响应', 'RESTful']
    },
    '大数据': {
        'simple': '大数据是指数量巨大、类型复杂的数据集合，需要特殊工具来处理和分析。',
        'analogy': '就像从一堆沙子中找到特定颜色的颗粒，传统工具太慢，需要专门的设备。',
        'example': '淘宝分析你的购物习惯推荐商品、地图分析交通数据规划路线。',
        'keywords': ['5V 特征', '数据挖掘', '实时分析', '数据可视化']
    },
}


def get_concept(name: str) -> Dict:
    """获取概念解释"""
    return CONCEPTS.get(name, None)


def search_concepts(keyword: str) -> List[str]:
    """搜索概念"""
    results = []
    for name in CONCEPTS.keys():
        if keyword.lower() in name.lower():
            results.append(name)
    return results


def explain_concept(name: str, level: str = 'simple') -> str:
    """解释概念"""
    concept = get_concept(name)
    
    if not concept:
        return None
    
    if level == 'simple':
        return concept['simple']
    elif level == 'analogy':
        return concept['analogy']
    elif level == 'example':
        return concept['example']
    elif level == 'full':
        return f"""
📖 {name}

🔹 简单解释:
{concept['simple']}

🔹 类比说明:
{concept['analogy']}

🔹 实际例子:
{concept['example']}

🔑 关键词: {', '.join(concept['keywords'])}
        """.strip()
    else:
        return concept['simple']


def get_random_concept() -> str:
    """随机获取一个概念"""
    name = random.choice(list(CONCEPTS.keys()))
    return explain_concept(name, 'full')


def add_concept(name: str, simple: str, analogy: str, example: str, keywords: List[str]) -> Dict:
    """添加新概念"""
    CONCEPTS[name] = {
        'simple': simple,
        'analogy': analogy,
        'example': example,
        'keywords': keywords
    }
    
    return {'name': name, 'status': 'added'}


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'explain' or command == '解释':
        if not args:
            return "❌ 请提供概念名称"
        
        name = args[0]
        level = args[1] if len(args) > 1 else 'full'
        
        result = explain_concept(name, level)
        
        if result:
            return result
        else:
            available = ', '.join(CONCEPTS.keys())
            return f"❌ 未找到概念 '{name}'\n可用：{available}"
    
    elif command == 'search' or command == '搜索':
        keyword = ' '.join(args) if args else ''
        
        if not keyword:
            return "❌ 请提供搜索关键词"
        
        results = search_concepts(keyword)
        
        if results:
            return f"🔍 找到 {len(results)} 个概念:\n" + '\n'.join(f"├─ {r}" for r in results)
        else:
            return f"😅 未找到包含 '{keyword}' 的概念"
    
    elif command == 'random' or command == '随机':
        return get_random_concept()
    
    elif command == 'list' or command == '列表':
        concepts = list(CONCEPTS.keys())
        
        lines = ["📚 概念列表:"]
        for name in concepts:
            lines.append(f"├─ {name}")
        
        return '\n'.join(lines)
    
    elif command == 'add' or command == '添加':
        return """
📝 添加概念

格式：add [概念名] [简单解释] [类比] [例子] [关键词 1, 关键词 2, ...]

示例：
add 机器学习 让计算机从数据中学习的技术 就像教小孩认东西 垃圾邮件过滤 监督学习，无监督学习，深度学习
        """.strip()
    
    elif command == 'help' or command == '帮助':
        return """
📖 Explainer - 概念解释

可用命令:
  explain/解释 [概念] [级别]     - 解释概念
  search/搜索 [关键词]          - 搜索概念
  random/随机                  - 随机概念
  list/列表                    - 所有概念
  add/添加                     - 添加概念
  help/帮助                    - 显示帮助

解释级别:
  simple - 简单解释
  analogy - 类比说明
  example - 实际例子
  full - 完整解释（默认）

示例:
  解释概念：explain 区块链
  完整解释：explain 区块链 full
  搜索概念：search 数据
  随机学习：random
  
可用概念:
{concepts}
        """.replace('{concepts}', ', '.join(CONCEPTS.keys()))
    
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
