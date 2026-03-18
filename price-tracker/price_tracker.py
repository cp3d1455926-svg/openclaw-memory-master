#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
💰 Price Tracker - 价格监控助手（优化版）
功能：价格监控、历史价格查询、降价提醒、多平台比价
对接电商爬虫 API
"""

import json
import re
from pathlib import Path
from datetime import datetime, timedelta

# 导入爬虫
from price_crawler import (
    get_price, get_price_history, compare_prices,
    parse_product_url, format_price_info
)

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


def add_to_watchlist(url, target_price=None):
    """添加监控商品"""
    parsed = parse_product_url(url)
    if not parsed:
        return {"error": "无法识别商品链接"}
    
    product_id = f"{parsed['platform']}:{parsed['product_id']}"
    
    # 获取商品信息
    product = get_price(url)
    
    if "error" in product:
        return {"error": product["error"]}
    
    watchlist = load_json(WATCHLIST_FILE)
    
    # 检查是否已存在
    for item in watchlist["items"]:
        if item["product_id"] == product_id:
            return {"error": "该商品已在监控列表中"}
    
    # 添加新商品
    current_price = product.get("price", 0)
    watchlist["items"].append({
        "product_id": product_id,
        "name": product.get("name", "未知商品"),
        "url": url,
        "platform": parsed["platform"],
        "current_price": current_price,
        "target_price": target_price or int(current_price * 0.9),
        "added_date": datetime.now().strftime("%Y-%m-%d"),
        "check_interval": "6h",
        "last_check": datetime.now().isoformat(),
        "price_history": []
    })
    
    save_json(WATCHLIST_FILE, watchlist)
    
    return {
        "success": True,
        "name": product.get("name", "未知商品"),
        "current_price": current_price,
        "target_price": target_price or int(current_price * 0.9)
    }


def get_watchlist():
    """获取监控列表"""
    return load_json(WATCHLIST_FILE)


def remove_from_watchlist(product_id):
    """从监控列表移除"""
    watchlist = load_json(WATCHLIST_FILE)
    
    for i, item in enumerate(watchlist["items"]):
        if item["product_id"] == product_id:
            removed = watchlist["items"].pop(i)
            save_json(WATCHLIST_FILE, watchlist)
            return True, removed["name"]
    
    return False, "未找到该商品"


def check_price_drops():
    """检查降价"""
    watchlist = load_json(WATCHLIST_FILE)
    drops = []
    
    for item in watchlist["items"]:
        product_id = item["product_id"]
        
        # 获取最新价格
        if item["platform"] == "jd":
            product = get_price(f"https://item.jd.com/{product_id.split(':')[1]}.html")
        else:
            # 简化处理
            product = {"price": item["current_price"]}
        
        old_price = item["current_price"]
        new_price = product.get("price", old_price)
        
        if new_price < old_price:
            drop = old_price - new_price
            drops.append({
                "name": item["name"],
                "product_id": product_id,
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


def get_buy_advice(product_id):
    """获取购买建议"""
    history = get_price_history(product_id)
    
    if not history:
        return "暂无历史价格数据"
    
    current = history["current_price"]
    avg = history["avg_price"]
    min_price = history["min_price"]
    
    advice = ""
    if current > avg * 1.1:
        advice = "❌ 当前价格高于平均水平，建议等等促销~"
    elif current < avg * 0.9:
        if current <= min_price * 1.05:
            advice = "✅ 当前价格接近历史最低，值得入手！🎉"
        else:
            advice = "✅ 当前价格很低，可以考虑入手！"
    else:
        advice = "😐 当前价格处于中等水平，不急可等促销。"
    
    return advice


def format_platform(platform):
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
        url_match = re.search(r'https?://[^\s]+', query)
        
        if url_match:
            url = url_match.group()
            
            # 检查是否有目标价格
            target_match = re.search(r'(\d+) 元', query)
            target_price = int(target_match.group(1)) if target_match else None
            
            result = add_to_watchlist(url, target_price)
            
            if result.get("error"):
                return f"❌ {result['error']}"
            
            return f"""✅ 已添加监控！
📦 商品：{result['name']}
💰 当前价格：¥{result['current_price']:,}
📉 目标价格：¥{result['target_price']:,}
🔔 提醒方式：降价时推送"""
        
        return "请提供商品 URL，例如：https://item.jd.com/100012345.html"
    
    # 历史价格
    if "历史" in query or "价格曲线" in query or "价格走势" in query:
        # 测试商品
        product_id = "jd:100012345"
        history_data = get_price_history(product_id)
        
        if not history_data:
            return "😅 暂无历史价格数据"
        
        response = f"""📊 **历史价格**（90 天）

💰 价格统计：
- 最高：¥{history_data['max_price']:,}
- 最低：¥{history_data['min_price']:,}
- 平均：¥{history_data['avg_price']:,}
- 当前：¥{history_data['current_price']:,}

📈 价格趋势：{history_data.get('trend', 'stable')}

💡 **购买建议**：
{get_buy_advice(product_id)}
"""
        return response
    
    # 比价
    if "比价" in query or "哪个平台便宜" in query or "多平台" in query:
        # 提取商品名
        product_name = "iPhone"
        if "iPhone" in query:
            product_name = "iPhone"
        elif "Mac" in query or "苹果" in query:
            product_name = "Mac"
        elif "耳机" in query or "Sony" in query:
            product_name = "耳机"
        
        results = compare_prices(product_name)
        
        if not results:
            return "😅 没找到该商品的比价信息"
        
        response = f"🔍 **多平台比价** {results[0]['name']}\n\n"
        
        for i, r in enumerate(results, 1):
            icon = "🏆" if i == 1 else ""
            response += f"""{icon}{i}. {format_platform(r['platform'])}
   价格：¥{r['price']:,}
   优惠：-¥{r['coupon']}
   到手：¥{r['final_price']:,}
   配送：{r['shipping']}
   库存：{'✅' if r['stock'] else '❌'}

"""
        
        savings = results[-1]['final_price'] - results[0]['final_price']
        response += f"🏆 **推荐**：{format_platform(results[0]['platform'])} 最便宜！\n"
        if savings > 0:
            response += f"💰 比最贵平台省 ¥{savings:,}"
        else:
            response += f"💰 各平台价格相近"
        
        return response
    
    # 降价提醒
    if "降价" in query or "有优惠" in query or "优惠" in query:
        drops = check_price_drops()
        
        if not drops:
            return "📊 监控的商品暂无降价~"
        
        response = "🎉 **降价提醒**\n\n"
        for drop in drops:
            icon = "✅" if drop['below_target'] else "📉"
            response += f"""{icon} {drop['name']}
💰 原价：¥{drop['old_price']:,} → 现价：¥{drop['new_price']:,}
📉 降幅：-¥{drop['drop']:,} ({drop['drop_percent']:.1f}%)
"""
            if drop['below_target']:
                response += "✅ 已低于你的目标价！\n"
            response += "\n"
        
        return response
    
    # 监控列表
    if "监控列表" in query or "我在监控" in query or "查看监控" in query:
        watchlist = get_watchlist()
        
        if not watchlist["items"]:
            return "📋 暂无监控商品，添加一个试试~"
        
        response = "📋 **监控列表**\n\n"
        for item in watchlist["items"]:
            response += f"""📦 {item['name']}
💰 ¥{item['current_price']:,} (目标：¥{item['target_price']:,})
🏪 {format_platform(item['platform'])}
📅 添加于：{item['added_date']}

"""
        return response
    
    # 取消监控
    if "取消监控" in query or "移除监控" in query or "删除监控" in query:
        # 简单实现
        return "💡 取消监控功能需要指定商品，例如：'取消监控 iPhone'\n\n（详细功能开发中...）"
    
    # 默认回复
    return """💰 价格监控助手

**功能**：
1. **监控商品** - 发送商品 URL
2. **历史价格** - "查历史价格"
3. **多平台比价** - "比价 iPhone"
4. **降价提醒** - "有降价吗"
5. **监控列表** - "监控列表"

**示例**：
- "监控 https://item.jd.com/100012345.html"
- "查历史价格"
- "比价 iPhone 15 Pro"
- "有降价吗"
- "监控列表"

**支持平台**：
🛒 京东 | 🛍️ 天猫/淘宝 | 💰 拼多多

发送商品 URL 开始监控！👻"""


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    
    print("=" * 60)
    print("💰 价格监控助手 - 测试")
    print("=" * 60)
    
    print("\n🔍 测试：比价 iPhone")
    print(main("比价 iPhone"))
    
    print("\n" + "=" * 60)
    print("📊 测试：历史价格")
    print(main("查历史价格"))
