#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
💰 Price Tracker - 价格监控助手
功能：价格监控、历史价格查询、降价提醒、多平台比价
"""

import json
import random
from pathlib import Path
from datetime import datetime, timedelta

# 数据文件路径
DATA_DIR = Path(__file__).parent
WATCHLIST_FILE = DATA_DIR / "watchlist.json"
PRICE_HISTORY_FILE = DATA_DIR / "price_history.json"


def load_json(filepath):
    """加载 JSON 文件"""
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"items": [], "notifications": {"enabled": True, "channel": "wecom", "min_drop": 100}}


def save_json(filepath, data):
    """保存 JSON 文件"""
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# 模拟商品数据库（实际应爬虫或 API）
PRODUCT_DB = {
    "jd:100012345": {
        "name": "Apple iPhone 15 Pro 256GB 原色钛金属",
        "platform": "jd",
        "current_price": 7999,
        "original_price": 8999,
        "stock": True,
        "shipping": "次日达",
        "coupon": 200,  # Plus 券
    },
    "tb:628394756": {
        "name": "Apple iPhone 15 Pro 256GB 原色钛金属",
        "platform": "tmall",
        "current_price": 7899,
        "original_price": 8999,
        "stock": True,
        "shipping": "3 天达",
        "coupon": 300,  # 店铺券
    },
    "pdd:394857261": {
        "name": "Apple iPhone 15 Pro 256GB 原色钛金属",
        "platform": "pdd",
        "current_price": 7599,
        "original_price": 8999,
        "stock": True,
        "shipping": "5 天达",
        "coupon": 0,  # 已补贴
    },
}

# 模拟历史价格
def generate_price_history(base_price, days=90):
    """生成模拟历史价格"""
    history = []
    today = datetime.now()
    
    for i in range(days):
        date = today - timedelta(days=i)
        # 随机波动 ±5%
        fluctuation = random.uniform(-0.05, 0.05)
        price = int(base_price * (1 + fluctuation))
        
        # 促销日更低
        if i in [1, 15, 30, 60]:  # 模拟促销
            price = int(base_price * 0.85)
        
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "price": price
        })
    
    return list(reversed(history))


def parse_url(url):
    """解析商品 URL"""
    if "jd.com" in url:
        # 提取商品 ID
        import re
        match = re.search(r'/(\d+)\.html', url)
        if match:
            return f"jd:{match.group(1)}"
    elif "tmall.com" in url or "taobao.com" in url:
        import re
        match = re.search(r'id=(\d+)', url)
        if match:
            return f"tb:{match.group(1)}"
    elif "pinduoduo.com" in url:
        return f"pdd:{random.randint(100000000, 999999999)}"
    
    return None


def get_product_info(product_id):
    """获取商品信息"""
    if product_id in PRODUCT_DB:
        return PRODUCT_DB[product_id]
    
    # 默认返回 iPhone 15 Pro
    return PRODUCT_DB["jd:100012345"]


def add_to_watchlist(url, target_price=None):
    """添加监控商品"""
    product_id = parse_url(url)
    if not product_id:
        return {"error": "无法解析商品 URL"}
    
    product = get_product_info(product_id)
    
    watchlist = load_json(WATCHLIST_FILE)
    
    # 检查是否已存在
    for item in watchlist["items"]:
        if item["product_id"] == product_id:
            return {"error": "该商品已在监控列表中"}
    
    # 添加新商品
    watchlist["items"].append({
        "product_id": product_id,
        "name": product["name"],
        "url": url,
        "platform": product["platform"],
        "current_price": product["current_price"],
        "target_price": target_price or int(product["current_price"] * 0.9),
        "added_date": datetime.now().strftime("%Y-%m-%d"),
        "check_interval": "6h",
        "last_check": datetime.now().isoformat(),
        "price_history": []
    })
    
    save_json(WATCHLIST_FILE, watchlist)
    
    return {
        "success": True,
        "name": product["name"],
        "current_price": product["current_price"],
        "target_price": target_price or int(product["current_price"] * 0.9)
    }


def get_price_history(product_id):
    """获取历史价格"""
    product = get_product_info(product_id)
    history = generate_price_history(product["current_price"])
    
    # 统计
    prices = [h["price"] for h in history]
    min_price = min(prices)
    max_price = max(prices)
    avg_price = sum(prices) // len(prices)
    
    return {
        "history": history,
        "min_price": min_price,
        "max_price": max_price,
        "avg_price": avg_price,
        "current_price": product["current_price"]
    }


def compare_prices(product_name):
    """多平台比价"""
    results = []
    
    for pid, product in PRODUCT_DB.items():
        if product_name.lower() in product["name"].lower():
            final_price = product["current_price"] - product["coupon"]
            results.append({
                "platform": product["platform"],
                "price": product["current_price"],
                "coupon": product["coupon"],
                "final_price": final_price,
                "shipping": product["shipping"],
                "stock": product["stock"]
            })
    
    # 按最终价格排序
    results.sort(key=lambda x: x["final_price"])
    
    return results


def check_price_drops():
    """检查降价"""
    watchlist = load_json(WATCHLIST_FILE)
    drops = []
    
    for item in watchlist["items"]:
        product = get_product_info(item["product_id"])
        old_price = item["current_price"]
        new_price = product["current_price"]
        
        if new_price < old_price:
            drop = old_price - new_price
            drops.append({
                "name": item["name"],
                "old_price": old_price,
                "new_price": new_price,
                "drop": drop,
                "drop_percent": drop / old_price * 100,
                "below_target": new_price <= item["target_price"]
            })
            
            # 更新监控列表
            item["current_price"] = new_price
            item["last_check"] = datetime.now().isoformat()
    
    if drops:
        save_json(WATCHLIST_FILE, watchlist)
    
    return drops


def format_price_platform(platform):
    """格式化平台名称"""
    platforms = {
        "jd": "🛒 京东",
        "tmall": "🛍️ 天猫",
        "tb": "🛍️ 淘宝",
        "pdd": "💰 拼多多",
        "amazon": "📦 亚马逊"
    }
    return platforms.get(platform, platform)


def main(query):
    """主函数"""
    query = query.strip()
    
    # 监控商品
    if "监控" in query or "http" in query:
        # 提取 URL
        import re
        url_match = re.search(r'https?://[^\s]+', query)
        
        if url_match:
            url = url_match.group()
            
            # 检查是否有目标价格
            target_match = re.search(r'(\d+)元', query)
            target_price = int(target_match.group(1)) if target_match else None
            
            result = add_to_watchlist(url, target_price)
            
            if result.get("error"):
                return f"❌ {result['error']}"
            
            return f"""✅ 已添加监控！
📦 商品：{result['name']}
💰 当前价格：¥{result['current_price']}
📉 目标价格：¥{result['target_price']}
🔔 提醒方式：降价时推送"""
        
        return "请提供商品 URL，例如：https://item.jd.com/100012345.html"
    
    # 历史价格
    if "历史" in query or "价格曲线" in query:
        # 示例商品
        product_id = "jd:100012345"
        history_data = get_price_history(product_id)
        
        response = f"""📊 **历史价格**（90 天）

💰 价格统计：
- 最高：¥{history_data['max_price']}
- 最低：¥{history_data['min_price']}
- 平均：¥{history_data['avg_price']}
- 当前：¥{history_data['current_price']}

📅 促销记录：
- 双 12: ¥{history_data['min_price']} (12-12)
- 年货节：¥{int(history_data['avg_price'] * 0.9)} (01-10)

💡 **购买建议**：
"""
        if history_data['current_price'] > history_data['avg_price']:
            response += "当前价格高于平均水平，建议等等促销~"
        elif history_data['current_price'] < history_data['avg_price'] * 0.9:
            response += "当前价格很低，值得入手！🎉"
        else:
            response += "当前价格处于中等水平，不急可等促销。"
        
        return response
    
    # 比价
    if "比价" in query or "哪个平台便宜" in query:
        results = compare_prices("iPhone 15 Pro")
        
        response = "🔍 **多平台比价** iPhone 15 Pro 256GB\n\n"
        
        for i, r in enumerate(results, 1):
            icon = "🏆" if i == 1 else ""
            response += f"""{icon}{i}. {format_price_platform(r['platform'])}
   价格：¥{r['price']}
   优惠：-¥{r['coupon']}
   到手：¥{r['final_price']}
   配送：{r['shipping']}
   库存：{'✅' if r['stock'] else '❌'}

"""
        
        response += f"🏆 **推荐**：{format_price_platform(results[0]['platform'])} 最便宜！"
        return response
    
    # 检查降价
    if "降价" in query or "有优惠" in query:
        drops = check_price_drops()
        
        if not drops:
            return "📊 监控的商品暂无降价~"
        
        response = "🎉 **降价提醒**\n\n"
        for drop in drops:
            icon = "✅" if drop['below_target'] else "📉"
            response += f"""{icon} {drop['name']}
💰 原价：¥{drop['old_price']} → 现价：¥{drop['new_price']}
📉 降幅：-¥{drop['drop']} ({drop['drop_percent']:.1f}%)
"""
            if drop['below_target']:
                response += "✅ 已低于你的目标价！\n"
            response += "\n"
        
        return response
    
    # 监控列表
    if "监控列表" in query or "我在监控" in query:
        watchlist = load_json(WATCHLIST_FILE)
        
        if not watchlist["items"]:
            return "📋 暂无监控商品，添加一个试试~"
        
        response = "📋 **监控列表**\n\n"
        for item in watchlist["items"]:
            response += f"""📦 {item['name']}
💰 ¥{item['current_price']} (目标：¥{item['target_price']})
🔗 {item['url'][:50]}...
📅 添加于：{item['added_date']}

"""
        return response
    
    # 默认回复
    return """💰 价格监控助手

**功能**：
1. **监控商品** - 发送商品 URL
2. **历史价格** - "查历史价格"
3. **多平台比价** - "比价 iPhone 15 Pro"
4. **降价提醒** - "有降价吗"
5. **监控列表** - "监控列表"

**示例**：
- "监控 https://item.jd.com/100012345.html"
- "查历史价格"
- "比价 iPhone"
- "有降价吗"

发送商品 URL 开始监控！👻"""


if __name__ == "__main__":
    # 测试
    print(main("比价 iPhone"))
