#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎵 Music Helper - 音乐助手
功能：音乐推荐、歌词获取、歌单管理
"""

import json
import random
from pathlib import Path
from datetime import datetime

# 数据文件路径
DATA_DIR = Path(__file__).parent
FAVORITES_FILE = DATA_DIR / "favorites.json"
PLAYLISTS_FILE = DATA_DIR / "playlists.json"

# 音乐数据库（示例数据，实际可对接网易云 API）
MUSIC_DATABASE = {
    "流行": [
        {"title": "晴天", "artist": "周杰伦", "album": "叶惠美", "year": 2003, "rating": 9.8},
        {"title": "十年", "artist": "陈奕迅", "album": "黑白灰", "year": 2003, "rating": 9.5},
        {"title": "起风了", "artist": "买辣椒也用券", "album": "单", "year": 2017, "rating": 9.3},
        {"title": "光年之外", "artist": "邓紫棋", "album": "单", "year": 2016, "rating": 9.2},
    ],
    "摇滚": [
        {"title": "海阔天空", "artist": "Beyond", "album": "乐与怒", "year": 1993, "rating": 9.9},
        {"title": "追梦赤子心", "artist": "GALA", "album": "追梦痴子心", "year": 2011, "rating": 9.4},
        {"title": "追梦", "artist": "唐朝乐队", "album": "梦回唐朝", "year": 1992, "rating": 9.3},
    ],
    "民谣": [
        {"title": "成都", "artist": "赵雷", "album": "无法长大", "year": 2016, "rating": 9.5},
        {"title": "南山南", "artist": "马頔", "album": "孤岛", "year": 2014, "rating": 9.2},
        {"title": "斑马斑马", "artist": "宋冬野", "album": "安和桥北", "year": 2013, "rating": 9.3},
    ],
    "纯音乐": [
        {"title": "Summer", "artist": "久石让", "album": "菊次郎的夏天", "year": 1999, "rating": 9.9},
        {"title": "雨的印记", "artist": "李闰珉", "album": "First Love", "year": 2001, "rating": 9.7},
        {"title": "卡农", "artist": "帕赫贝尔", "album": "经典", "year": 1680, "rating": 9.8},
        {"title": "风居住的街道", "artist": "矶村由纪子", "album": "風の住む街", "year": 1991, "rating": 9.7},
        {"title": "神秘园之歌", "artist": "Secret Garden", "album": "Songs from a Secret Garden", "year": 1995, "rating": 9.6},
    ],
    "电子": [
        {"title": "Faded", "artist": "Alan Walker", "album": "单", "year": 2015, "rating": 9.4},
        {"title": "Unity", "artist": "TheFatRat", "album": "单", "year": 2014, "rating": 9.3},
    ],
    "古典": [
        {"title": "月光奏鸣曲", "artist": "贝多芬", "album": "钢琴奏鸣曲", "year": 1801, "rating": 9.8},
        {"title": "致爱丽丝", "artist": "贝多芬", "album": "单", "year": 1810, "rating": 9.7},
        {"title": "蓝色多瑙河", "artist": "约翰·施特劳斯", "album": "圆舞曲", "year": 1866, "rating": 9.6},
    ],
}

# 场景对应类型
SCENE_MAP = {
    "学习": ["纯音乐", "古典"],
    "工作": ["纯音乐", "电子"],
    "睡眠": ["纯音乐", "古典"],
    "运动": ["摇滚", "电子"],
    "通勤": ["流行", "民谣"],
    "派对": ["电子", "摇滚"],
}

# 心情对应类型
MOOD_MAP = {
    "开心": ["流行", "电子"],
    "难过": ["民谣", "流行"],
    "放松": ["纯音乐", "民谣"],
    "兴奋": ["摇滚", "电子"],
    "治愈": ["纯音乐", "民谣"],
    "emo": ["民谣", "流行"],
}

# 示例歌词（简化版）
LYRICS_DB = {
    "晴天": """故事的小黄花 从出生那年就飘着
童年的荡秋千 随记忆一直晃到现在
Re So So Si Do Si La So La Si Si Si Si La Si La So
吹着前奏 望着天空 我想起花瓣试着掉落""",
    
    "十年": """如果那两个字没有颤抖
我不会发现我难受
怎么说出口 也不过是分手""",
    
    "海阔天空": """今天我 寒夜里看雪飘过
怀着冷却了的心窝漂远方
风雨里追赶 雾里分不清影踪
天空海阔你与我 可会变""",
    
    "成都": """让我掉下眼泪的 不止昨夜的酒
让我依依不舍的 不止你的温柔
余路还要走多久 你攥着我的手
让我感到为难的 是挣扎的自由""",
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


def recommend_by_scene(scene):
    """根据场景推荐"""
    types = SCENE_MAP.get(scene, ["纯音乐"])
    recommendations = []
    for t in types:
        if t in MUSIC_DATABASE:
            recommendations.extend(MUSIC_DATABASE[t])
    return recommendations[:5]


def recommend_by_mood(mood):
    """根据心情推荐"""
    types = MOOD_MAP.get(mood, ["流行"])
    recommendations = []
    for t in types:
        if t in MUSIC_DATABASE:
            recommendations.extend(MUSIC_DATABASE[t])
    return recommendations[:5]


def recommend_by_type(music_type):
    """根据类型推荐"""
    if music_type in MUSIC_DATABASE:
        return MUSIC_DATABASE[music_type][:5]
    return []


def search_song(title):
    """搜索歌曲"""
    results = []
    for m_type, songs in MUSIC_DATABASE.items():
        for song in songs:
            if title.lower() in song["title"].lower():
                results.append(song)
    return results


def get_lyrics(title):
    """获取歌词"""
    for song_title, lyrics in LYRICS_DB.items():
        if song_title in title:
            return lyrics
    return "暂无歌词，可尝试搜索完整歌词~"


def add_favorite(title, artist):
    """添加收藏"""
    favorites = load_json(FAVORITES_FILE)
    favorites.append({
        "title": title,
        "artist": artist,
        "added_date": datetime.now().strftime("%Y-%m-%d"),
        "play_count": 1
    })
    save_json(FAVORITES_FILE, favorites)


def create_playlist(name, songs):
    """创建歌单"""
    playlists = load_json(PLAYLISTS_FILE)
    playlists.append({
        "name": name,
        "songs": songs,
        "created_date": datetime.now().strftime("%Y-%m-%d")
    })
    save_json(PLAYLISTS_FILE, playlists)


def format_song(song):
    """格式化歌曲信息"""
    return f"🎵 《{song['title']}》- {song['artist']} ⭐{song['rating']}"


def main(query):
    """主函数"""
    query = query.lower()
    
    # 场景推荐
    for scene in SCENE_MAP.keys():
        if scene in query:
            songs = recommend_by_scene(scene)
            response = f"🎧 适合**{scene}**的音乐：\n\n"
            for i, s in enumerate(songs, 1):
                response += f"{i}. {format_song(s)}\n"
            return response
    
    # 心情推荐
    for mood in MOOD_MAP.keys():
        if mood in query:
            songs = recommend_by_mood(mood)
            response = f"😊 根据你的**{mood}**心情，推荐：\n\n"
            for i, s in enumerate(songs, 1):
                response += f"{i}. {format_song(s)}\n"
            return response
    
    # 类型推荐
    for t in MUSIC_DATABASE.keys():
        if t in query:
            songs = recommend_by_type(t)
            response = f"🎵 **{t}**音乐推荐：\n\n"
            for i, s in enumerate(songs, 1):
                response += f"{i}. {format_song(s)}\n"
            return response
    
    # 搜索歌曲
    if "查" in query or "歌词" in query:
        for m_type, songs in MUSIC_DATABASE.items():
            for song in songs:
                if song["title"] in query:
                    info = f"🎵 《{song['title']}》\n"
                    info += f"🎤 歌手：{song['artist']}\n"
                    info += f"📀 专辑：{song['album']} ({song['year']})\n"
                    info += f"⭐ 评分：{song['rating']}\n"
                    
                    if "歌词" in query:
                        info += f"\n📝 歌词：\n{get_lyrics(song['title'])}"
                    
                    return info
    
    # 收藏
    if "收藏" in query or "喜欢" in query:
        for m_type, songs in MUSIC_DATABASE.items():
            for song in songs:
                if song["title"] in query:
                    add_favorite(song["title"], song["artist"])
                    return f"✅ 已收藏《{song['title']}》- {song['artist']}"
    
    # 默认回复
    return """🎵 我可以帮你：
1. **根据场景推荐** - "学习时听什么"
2. **根据心情推荐** - "难过的歌"
3. **根据类型推荐** - "推荐摇滚"
4. **查询歌曲** - "查一下晴天的歌词"
5. **收藏歌曲** - "收藏晴天"

告诉我你想做什么？👻"""


if __name__ == "__main__":
    # 测试
    print(main("学习的时候听什么"))
