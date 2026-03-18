#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""测试价格爬虫"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

from price_crawler import get_jd_price, get_price_history, compare_prices, format_price_info

print("=" * 60)
print("💰 电商价格爬虫 - 测试")
print("=" * 60)

print("\n🔍 测试：京东 iPhone 15 Pro")
result = get_jd_price("100012345")
print(format_price_info(result))

print("\n📊 测试：历史价格")
history = get_price_history("jd:100012345")
if history:
    print(f"最低价：¥{history['min_price']:,}")
    print(f"最高价：¥{history['max_price']:,}")
    print(f"平均价：¥{history['avg_price']:,}")
    print(f"当前价：¥{history['current_price']:,}")
    print(f"趋势：{history['trend']}")

print("\n🔍 测试：比价 iPhone")
results = compare_prices("iPhone")
for i, r in enumerate(results, 1):
    print(f"{i}. {r['platform']} - ¥{r['final_price']:,}")

print("\n✅ 测试完成!")
