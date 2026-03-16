#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎬 Movie Recommender - 电影推荐助手
功能：电影推荐、豆瓣评分查询、观影记录管理
"""

import json
import random
from pathlib import Path
from datetime import datetime

# 数据文件路径
DATA_DIR = Path(__file__).parent
WATCHED_FILE = DATA_DIR / "watched.json"
WANT_TO_WATCH_FILE = DATA_DIR / "want_to_watch.json"

# 电影数据库（示例数据，实际可对接豆瓣 API）
MOVIE_DATABASE = {
    "科幻": [
        {"title": "星际穿越", "year": 2014, "rating": 9.4, "director": "诺兰", "desc": "地球环境恶化，探险者穿越虫洞寻找新家园"},
        {"title": "盗梦空间", "year": 2010, "rating": 9.4, "director": "诺兰", "desc": "进入他人梦境植入思想的科幻动作片"},
        {"title": "黑客帝国", "year": 1999, "rating": 9.1, "director": "沃卓斯基", "desc": "程序员发现世界是虚拟的矩阵"},
        {"title": "降临", "year": 2016, "rating": 7.8, "director": "维伦纽瓦", "desc": "语言学家与外星人的第一次接触"},
        {"title": "火星救援", "year": 2015, "rating": 8.5, "director": "雷德利·斯科特", "desc": "宇航员被独自留在火星求生"},
    ],
    "爱情": [
        {"title": "泰坦尼克号", "year": 1997, "rating": 9.4, "director": "卡梅隆", "desc": "穷画家和贵族女的凄美爱情"},
        {"title": "爱在黎明破晓前", "year": 1995, "rating": 8.8, "director": "林克莱特", "desc": "火车上偶遇的两人共度一夜"},
        {"title": "怦然心动", "year": 2010, "rating": 9.1, "director": "莱纳", "desc": "青梅竹马的纯真爱情"},
    ],
    "悬疑": [
        {"title": "肖申克的救赎", "year": 1994, "rating": 9.7, "director": "德拉邦特", "desc": "银行家蒙冤入狱后的救赎之路"},
        {"title": "看不见的客人", "year": 2016, "rating": 8.8, "director": "奥里奥尔·保罗", "desc": "企业家被控谋杀，律师为他辩护"},
        {"title": "控方证人", "year": 1957, "rating": 9.6, "director": "怀尔德", "desc": "经典悬疑法庭戏"},
    ],
    "喜剧": [
        {"title": "三傻大闹宝莱坞", "year": 2009, "rating": 9.2, "director": "拉库马·希拉尼", "desc": "三个大学生挑战教育体制"},
        {"title": "触不可及", "year": 2011, "rating": 9.3, "director": "奥利维埃·纳卡什", "desc": "富豪与街头青年的友情故事"},
        {"title": "绿皮书", "year": 2018, "rating": 8.9, "director": "彼得·法雷利", "desc": "黑人钢琴家与白人司机的公路之旅"},
    ],
    "治愈": [
        {"title": "海蒂和爷爷", "year": 2015, "rating": 9.3, "director": "阿兰·葛斯彭纳", "desc": "孤儿海蒂与阿尔卑斯山爷爷的故事"},
        {"title": "寻梦环游记", "year": 2017, "rating": 8.7, "director": "李·昂克里奇", "desc": "小男孩进入亡灵世界寻梦"},
        {"title": "小森林", "year": 2014, "rating": 9.0, "director": "森淳一", "desc": "女孩回到乡村自给自足的生活"},
    ],
}

# 心情对应类型
MOOD_MAP = {
    "开心": ["喜剧", "治愈"],
    "难过": ["治愈", "爱情"],
    "放松": ["治愈", "喜剧"],
    "刺激": ["科幻", "悬疑"],
    "烧脑": ["科幻", "悬疑"],
    "累": ["治愈", "喜剧"],
}


def load_json(filepath):
    """加载 JSON 文件"""
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_json(filepath, data):
    """保存 JSON 文件"""
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def recommend_by_mood(mood):
    """根据心情推荐电影"""
    types = MOOD_MAP.get(mood, ["治愈", "喜剧"])
    recommendations = []
    for t in types:
        if t in MOVIE_DATABASE:
            recommendations.extend(MOVIE_DATABASE[t])
    
    # 随机选 3-5 部
    count = min(random.randint(3, 5), len(recommendations))
    return random.sample(recommendations, count)


def recommend_by_type(movie_type):
    """根据类型推荐电影"""
    if movie_type in MOVIE_DATABASE:
        movies = MOVIE_DATABASE[movie_type]
        count = min(5, len(movies))
        return random.sample(movies, count)
    return []


def search_movie(title):
    """搜索电影"""
    results = []
    for m_type, movies in MOVIE_DATABASE.items():
        for movie in movies:
            if title.lower() in movie["title"].lower():
                results.append(movie)
    return results


def add_watched(title, rating=5, comment=""):
    """添加已看电影"""
    watched = load_json(WATCHED_FILE)
    watched.append({
        "title": title,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "rating": rating,
        "comment": comment
    })
    save_json(WATCHED_FILE, watched)


def add_want_to_watch(title):
    """添加想看列表"""
    want_to_watch = load_json(WANT_TO_WATCH_FILE)
    # 避免重复
    if not any(m["title"] == title for m in want_to_watch):
        want_to_watch.append({
            "title": title,
            "added_date": datetime.now().strftime("%Y-%m-%d")
        })
        save_json(WANT_TO_WATCH_FILE, want_to_watch)


def format_movie(movie):
    """格式化电影信息"""
    return f"""🎬 《{movie['title']}》({movie['year']})
⭐ 豆瓣评分：{movie['rating']}
🎯 导演：{movie['director']}
📝 简介：{movie['desc']}"""


def main(query):
    """主函数"""
    query = query.lower()
    
    # 心情推荐
    for mood in MOOD_MAP.keys():
        if mood in query:
            movies = recommend_by_mood(mood)
            response = f"😊 根据你的**{mood}**心情，推荐这{len(movies)}部电影：\n\n"
            for i, m in enumerate(movies, 1):
                response += f"{i}. {format_movie(m)}\n\n"
            return response
    
    # 类型推荐
    for t in MOVIE_DATABASE.keys():
        if t in query:
            movies = recommend_by_type(t)
            response = f"🎭 **{t}**电影推荐：\n\n"
            for i, m in enumerate(movies, 1):
                response += f"{i}. {format_movie(m)}\n\n"
            return response
    
    # 搜索电影
    if "查" in query or "评分" in query:
        # 提取电影名（简单实现，可优化）
        for m_type, movies in MOVIE_DATABASE.items():
            for movie in movies:
                if movie["title"] in query:
                    return f"🔍 找到电影：\n\n{format_movie(movie)}"
    
    # 默认回复
    return """🎬 我可以帮你：
1. **根据心情推荐** - "今天有点累，推荐电影"
2. **根据类型推荐** - "推荐科幻电影"
3. **查询评分** - "查一下星际穿越的评分"
4. **记录观影** - "我刚看了 XXX，评分 5 分"
5. **想看清单** - "把 XXX 加入想看"

告诉我你想做什么？👻"""


if __name__ == "__main__":
    # 测试
    print(main("今天有点累，推荐电影"))
