#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
📈 Stock Watcher - 股票观察助手（优化版）
功能：股价查询、自选股管理、价格提醒、涨跌统计、资讯摘要
"""

import json
import random
from pathlib import Path
from datetime import datetime, timedelta

DATA_DIR = Path(__file__).parent
WATCHLIST_FILE = DATA_DIR / "watchlist.json"
ALERTS_FILE = DATA_DIR / "alerts.json"

# ========== 扩展股票数据库 ==========

STOCKS = {
    # A 股
    "600519": {"name": "贵州茅台", "price": 1680.00, "change": 0.90, "market": "A 股", "pe": 28.5, "pb": 8.2},
    "000858": {"name": "五粮液", "price": 155.00, "change": -0.50, "market": "A 股", "pe": 22.3, "pb": 5.1},
    "002594": {"name": "比亚迪", "price": 225.00, "change": 2.30, "market": "A 股", "pe": 35.8, "pb": 6.5},
    "300750": {"name": "宁德时代", "price": 185.00, "change": 1.80, "market": "A 股", "pe": 25.2, "pb": 4.8},
    "601318": {"name": "中国平安", "price": 48.00, "change": -0.30, "market": "A 股", "pe": 8.5, "pb": 1.2},
    
    # 港股
    "00700": {"name": "腾讯控股", "price": 350.00, "change": 1.20, "market": "港股", "pe": 18.5, "pb": 3.2},
    "09988": {"name": "阿里巴巴", "price": 85.00, "change": -1.50, "market": "港股", "pe": 12.3, "pb": 1.8},
    "03690": {"name": "美团", "price": 120.00, "change": 3.20, "market": "港股", "pe": 45.2, "pb": 4.5},
    
    # 美股
    "AAPL": {"name": "苹果", "price": 175.00, "change": -0.50, "market": "美股", "pe": 28.5, "pb": 12.5},
    "TSLA": {"name": "特斯拉", "price": 250.00, "change": 2.30, "market": "美股", "pe": 65.2, "pb": 15.8},
    "NVDA": {"name": "英伟达", "price": 450.00, "change": 3.50, "market": "美股", "pe": 85.5, "pb": 22.5},
    "MSFT": {"name": "微软", "price": 380.00, "change": 0.80, "market": "美股", "pe": 35.2, "pb": 12.8},
    "GOOGL": {"name": "谷歌", "price": 140.00, "change": -0.20, "market": "美股", "pe": 25.5, "pb": 5.8},
}

# ========== 股票资讯 ==========

STOCK_NEWS = {
    "600519": [
        "贵州茅台：2025 年营收同比增长 18%",
        "白酒板块持续走强，茅台领涨",
        "茅台宣布提价计划，市场反应积极"
    ],
    "00700": [
        "腾讯：游戏业务增长强劲",
        "微信支付用户突破 10 亿",
        "腾讯投资多家 AI 初创公司"
    ],
    "AAPL": [
        "苹果发布新一代 iPhone",
        "苹果服务收入创新高",
        "供应链消息称苹果将增加产能"
    ],
    "TSLA": [
        "特斯拉交付量超预期",
        "马斯克宣布新工厂计划",
        "特斯拉股价波动较大，投资者需谨慎"
    ]
}

# ========== 板块数据 ==========

SECTORS = {
    "白酒": ["600519", "000858"],
    "新能源": ["002594", "300750"],
    "科技": ["00700", "09988", "AAPL", "NVDA", "MSFT", "GOOGL"],
    "金融": ["601318"],
    "互联网": ["00700", "09988", "03690"]
}


def load_json(filepath):
    """加载 JSON 文件"""
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"watchlist": [], "alerts": []}


def save_json(filepath, data):
    """保存 JSON 文件"""
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def simulate_price_change(symbol):
    """模拟股价变化（实际应调用 API）"""
    if symbol in STOCKS:
        # 模拟小幅波动
        change = random.uniform(-3, 3)
        STOCKS[symbol]["change"] = round(change, 2)
        # 更新价格
        base_price = STOCKS[symbol]["price"]
        STOCKS[symbol]["price"] = round(base_price * (1 + change / 100), 2)
        return STOCKS[symbol]
    return None


def get_stock_price(symbol):
    """获取股价"""
    return STOCKS.get(symbol)


def search_stock(keyword):
    """搜索股票"""
    results = []
    keyword_lower = keyword.lower()
    
    for symbol, stock in STOCKS.items():
        if keyword_lower in symbol.lower() or keyword_lower in stock["name"].lower():
            results.append((symbol, stock))
    
    return results


def add_to_watchlist(symbol):
    """添加到自选"""
    data = load_json(WATCHLIST_FILE)
    
    # 检查是否已存在
    for s in data["watchlist"]:
        if s["symbol"] == symbol:
            return False, "已在自选股中"
    
    stock = get_stock_price(symbol)
    if stock:
        data["watchlist"].append({
            "symbol": symbol,
            "name": stock["name"],
            "added_date": datetime.now().strftime("%Y-%m-%d"),
            "cost_price": None,  # 成本价
            "target_price": None  # 目标价
        })
        save_json(WATCHLIST_FILE, data)
        return True, "添加成功"
    
    return False, "股票不存在"


def remove_from_watchlist(symbol):
    """从自选移除"""
    data = load_json(WATCHLIST_FILE)
    
    before = len(data["watchlist"])
    data["watchlist"] = [s for s in data["watchlist"] if s["symbol"] != symbol]
    save_json(WATCHLIST_FILE, data)
    
    return len(data["watchlist"]) < before


def set_price_alert(symbol, target_price, alert_type="above"):
    """设置价格提醒"""
    data = load_json(ALERTS_FILE)
    
    alert = {
        "symbol": symbol,
        "target_price": target_price,
        "alert_type": alert_type,  # above/below
        "created": datetime.now().isoformat(),
        "triggered": False
    }
    
    data["alerts"].append(alert)
    save_json(ALERTS_FILE, data)
    
    return alert


def check_price_alerts():
    """检查价格提醒"""
    data = load_json(ALERTS_FILE)
    triggered = []
    
    for alert in data["alerts"]:
        if alert["triggered"]:
            continue
        
        stock = get_stock_price(alert["symbol"])
        if stock:
            if alert["alert_type"] == "above" and stock["price"] >= alert["target_price"]:
                alert["triggered"] = True
                triggered.append({
                    "symbol": alert["symbol"],
                    "name": stock["name"],
                    "current_price": stock["price"],
                    "target_price": alert["target_price"],
                    "type": "涨破"
                })
            elif alert["alert_type"] == "below" and stock["price"] <= alert["target_price"]:
                alert["triggered"] = True
                triggered.append({
                    "symbol": alert["symbol"],
                    "name": stock["name"],
                    "current_price": stock["price"],
                    "target_price": alert["target_price"],
                    "type": "跌破"
                })
    
    save_json(ALERTS_FILE, data)
    
    return triggered


def get_sector_performance(sector_name):
    """获取板块表现"""
    if sector_name not in SECTORS:
        return None
    
    symbols = SECTORS[sector_name]
    stocks = []
    
    for symbol in symbols:
        stock = get_stock_price(symbol)
        if stock:
            stocks.append(stock)
    
    if not stocks:
        return None
    
    # 计算板块平均涨跌
    avg_change = sum(s["change"] for s in stocks) / len(stocks)
    
    return {
        "name": sector_name,
        "stocks": stocks,
        "avg_change": round(avg_change, 2),
        "count": len(stocks)
    }


def get_market_summary():
    """获取市场摘要"""
    a_stocks = [s for sym, s in STOCKS.items() if s["market"] == "A 股"]
    hk_stocks = [s for sym, s in STOCKS.items() if s["market"] == "港股"]
    us_stocks = [s for sym, s in STOCKS.items() if s["market"] == "美股"]
    
    def calc_avg(stocks):
        if not stocks:
            return 0
        return round(sum(s["change"] for s in stocks) / len(stocks), 2)
    
    return {
        "a 股": calc_avg(a_stocks),
        "港股": calc_avg(hk_stocks),
        "美股": calc_avg(us_stocks)
    }


def get_stock_news(symbol):
    """获取股票资讯"""
    return STOCK_NEWS.get(symbol, ["暂无相关资讯"])


def format_stock(symbol, stock, show_details=False):
    """格式化股票信息"""
    change_icon = "🔴" if stock["change"] >= 0 else "🟢"
    
    info = f"{symbol} {stock['name']} ¥{stock['price']} {change_icon} {stock['change']:+.2f}%"
    
    if show_details:
        info += f"\n   市场：{stock['market']}"
        info += f"\n   市盈率：{stock['pe']}"
        info += f"\n   市净率：{stock['pb']}"
    
    return info


def format_watchlist(watchlist):
    """格式化自选股列表"""
    if not watchlist:
        return "暂无自选股"
    
    response = ""
    for item in watchlist:
        stock = get_stock_price(item["symbol"])
        if stock:
            change_icon = "🔴" if stock["change"] >= 0 else "🟢"
            response += f"{item['symbol']} {stock['name']} ¥{stock['price']} {change_icon} {stock['change']:+.2f}%\n"
    
    return response


def get_portfolio_stats(watchlist):
    """获取持仓统计"""
    if not watchlist:
        return None
    
    total_value = 0
    gains = []
    
    for item in watchlist:
        stock = get_stock_price(item["symbol"])
        if stock:
            total_value += stock["price"]
            gains.append(stock["change"])
    
    avg_gain = sum(gains) / len(gains) if gains else 0
    
    return {
        "count": len(watchlist),
        "total_value": round(total_value, 2),
        "avg_change": round(avg_gain, 2)
    }


def main(query):
    """主函数"""
    query_lower = query.lower()
    
    # ========== 查询股价 ==========
    
    # 查询具体股票（优先匹配）
    # 先匹配股票代码
    for symbol in STOCKS.keys():
        if symbol in query:
            stock = get_stock_price(symbol)
            response = format_stock(symbol, stock, show_details=True)
            news = get_stock_news(symbol)
            if news:
                response += f"\n\n📰 **相关资讯**：\n"
                for n in news[:2]:
                    response += f"- {n}\n"
            return response
    
    # 再匹配股票名称
    for symbol, stock in STOCKS.items():
        if stock["name"] in query or stock["name"].lower() in query_lower:
            response = format_stock(symbol, stock, show_details=True)
            news = get_stock_news(symbol)
            if news:
                response += f"\n\n📰 **相关资讯**：\n"
                for n in news[:2]:
                    response += f"- {n}\n"
            return response
    
    # 搜索匹配
    search_results = search_stock(query_lower)
    if search_results:
        symbol, stock = search_results[0]
        return format_stock(symbol, stock, show_details=True)
    
    # ========== 自选股管理 ==========
    
    # 添加自选
    if "添加" in query_lower or "加入自选" in query_lower:
        for symbol in STOCKS.keys():
            if symbol in query_lower:
                success, msg = add_to_watchlist(symbol)
                icon = "✅" if success else "⚠️"
                return f"{icon} {symbol} {msg}"
        return "❌ 未找到该股票"
    
    # 删除自选
    if "删除" in query_lower or "移除" in query_lower:
        for symbol in STOCKS.keys():
            if symbol in query_lower:
                if remove_from_watchlist(symbol):
                    return f"✅ 已从自选股移除 {symbol}"
        return "❌ 自选股中未找到该股票"
    
    # 查看自选
    if "自选" in query_lower and ("列表" in query_lower or "查看" in query_lower or "我的" in query_lower):
        data = load_json(WATCHLIST_FILE)
        if not data["watchlist"]:
            return "📈 暂无自选股"
        
        response = "📈 **自选股列表**：\n\n"
        response += format_watchlist(data["watchlist"])
        
        # 添加统计
        stats = get_portfolio_stats(data["watchlist"])
        if stats:
            response += f"\n📊 **统计**：共{stats['count']}只 | 总市值：¥{stats['total_value']} | 平均涨跌：{stats['avg_change']:+.2f}%"
        
        return response
    
    # ========== 价格提醒 ==========
    
    # 设置提醒
    if "提醒" in query_lower or "预警" in query_lower:
        import re
        # 提取股票代码和目标价
        symbol_match = re.search(r'([A-Z0-9]{6}|[A-Z]{3,4})', query)
        price_match = re.search(r'(\d+(?:\.\d+)?)\s*元', query)
        
        if symbol_match and price_match:
            symbol = symbol_match.group(1)
            target_price = float(price_match.group(1))
            
            alert_type = "below" if "跌破" in query_lower or "低于" in query_lower else "above"
            
            alert = set_price_alert(symbol, target_price, alert_type)
            direction = "涨破" if alert_type == "above" else "跌破"
            return f"✅ 已设置提醒：当{symbol} {direction}¥{target_price}时通知"
        
        return "❌ 请指定股票代码和目标价，如：'茅台涨破 1800 元提醒我'"
    
    # 检查提醒
    if "检查提醒" in query_lower or "有提醒" in query_lower:
        triggered = check_price_alerts()
        if triggered:
            response = "🔔 **触发的提醒**：\n\n"
            for t in triggered:
                response += f"{t['type']} {t['symbol']} {t['name']}\n"
                response += f"   当前：¥{t['current_price']} | 目标：¥{t['target_price']}\n"
            return response
        return "✅ 暂无触发的提醒"
    
    # ========== 板块查询 ==========
    
    for sector in SECTORS.keys():
        if sector in query_lower:
            performance = get_sector_performance(sector)
            if performance:
                response = f"📊 **{performance['name']}板块**：\n\n"
                response += f"平均涨跌：{performance['avg_change']:+.2f}%\n\n"
                for stock in performance["stocks"]:
                    symbol = [s for s, st in STOCKS.items() if st == stock][0]
                    response += format_stock(symbol, stock) + "\n"
                return response
    
    # ========== 市场摘要 ==========
    
    if "市场" in query_lower or "大盘" in query_lower or "今日" in query_lower:
        summary = get_market_summary()
        response = "📊 **市场摘要**：\n\n"
        for market, change in summary.items():
            icon = "🔴" if change >= 0 else "🟢"
            response += f"{market} {icon} {change:+.2f}%\n"
        return response
    
    # ========== 股票推荐 ==========
    
    if "推荐" in query_lower or "买什么" in query_lower:
        # 简单实现：推荐涨幅靠前的
        sorted_stocks = sorted(STOCKS.items(), key=lambda x: x[1]["change"], reverse=True)[:3]
        
        response = "📈 **今日推荐**（涨幅靠前）：\n\n"
        for symbol, stock in sorted_stocks:
            response += format_stock(symbol, stock) + "\n"
        
        response += "\n⚠️ **风险提示**：股市有风险，投资需谨慎"
        return response
    
    # ========== 默认回复 ==========
    
    return """📈 股票观察助手（优化版）

**功能**：

💹 股价查询
1. 查询股价 - "查询贵州茅台股价"
2. 股票详情 - "600519 的详细信息"
3. 市场摘要 - "今日市场表现"

📋 自选股管理
4. 添加自选 - "添加茅台到自选"
5. 删除自选 - "删除腾讯"
6. 查看自选 - "我的自选股列表"

🔔 价格提醒
7. 设置提醒 - "茅台涨破 1800 元提醒我"
8. 检查提醒 - "有触发的提醒吗"

📊 板块查询
9. 板块表现 - "白酒板块怎么样"
10. 板块列表 - "科技股有哪些"

💡 股票推荐
11. 今日推荐 - "今天买什么股票"

**支持市场**：A 股、港股、美股

⚠️ **风险提示**：股市有风险，投资需谨慎

告诉我你想查哪只股票？👻"""


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    
    print("=" * 60)
    print("📈 股票观察助手 - 测试")
    print("=" * 60)
    
    print("\n测试 1: 查询股价")
    print(main("查询贵州茅台"))
    
    print("\n" + "=" * 60)
    print("测试 2: 市场摘要")
    print(main("今日市场表现"))
    
    print("\n" + "=" * 60)
    print("测试 3: 板块查询")
    print(main("白酒板块怎么样"))
