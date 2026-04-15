"""
PriorityManager - 优先级管理器
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass


class PriorityLevel(Enum):
    """优先级等级"""
    P0 = "P0"  # 核心身份，永不过期
    P1 = "P1"  # 活跃项目，90 天 TTL
    P2 = "P2"  # 临时记忆，30 天 TTL


@dataclass
class PriorityConfig:
    """优先级配置"""
    ttl_days: int
    auto_archive: bool
    importance_boost: float


PRIORITY_CONFIGS = {
    PriorityLevel.P0: PriorityConfig(ttl_days=9999, auto_archive=False, importance_boost=1.5),
    PriorityLevel.P1: PriorityConfig(ttl_days=90, auto_archive=True, importance_boost=1.2),
    PriorityLevel.P2: PriorityConfig(ttl_days=30, auto_archive=True, importance_boost=1.0),
}


class PriorityManager:
    """优先级管理器 - P0/P1/P2 记忆优先级系统"""
    
    def __init__(self):
        self.configs = PRIORITY_CONFIGS
        self.classification_prompt = """
判断以下文本应该属于哪个优先级：

P0 - 核心身份：用户的基本信息、偏好、重要关系（永不过期）
P1 - 活跃项目：正在进行的项目、任务、计划（90 天 TTL）
P2 - 临时记忆：日常对话、临时信息、短期事件（30 天 TTL）

文本：
{text}

只返回 P0、P1 或 P2，不要其他内容。
"""
        
    def parse_priority(self, content: str) -> tuple[str, str, str]:
        """解析优先级格式：- [P1][2026-04-12] 内容"""
        import re
        
        # 正则表达式匹配格式
        pattern = r'-\s*\[(P[0-2])\]\s*\[(\d{4}-\d{2}-\d{2})\]\s*(.+)'
        match = re.match(pattern, content.strip())
        
        if match:
            priority = match.group(1)
            date = match.group(2)
            text = match.group(3).strip()
            return priority, date, text
        
        # 如果没有匹配到，返回默认值
        return 'P2', datetime.now().strftime('%Y-%m-%d'), content.strip()
        
    def format_memory(self, priority: str, date: str, content: str) -> str:
        """格式化记忆"""
        return f"- [{priority}][{date}] {content}"
        
    def is_expired(self, priority: str, created_at: str) -> bool:
        """检查是否过期"""
        try:
            # 获取配置
            priority_level = PriorityLevel(priority)
            config = self.configs[priority_level]
            
            # P0 永不过期
            if config.ttl_days >= 9999:
                return False
            
            # 计算过期日期
            created_date = datetime.fromisoformat(created_at)
            expire_date = created_date + timedelta(days=config.ttl_days)
            
            # 检查是否过期
            return datetime.now() > expire_date
            
        except (ValueError, KeyError):
            # 如果优先级无效，默认不过期
            return False
        
    def get_importance_boost(self, priority: str) -> float:
        """获取重要性因子"""
        try:
            priority_level = PriorityLevel(priority)
            config = self.configs[priority_level]
            return config.importance_boost
        except (ValueError, KeyError):
            return 1.0
        
    def auto_classify(self, text: str) -> PriorityLevel:
        """自动分类优先级"""
        import re
        
        # 关键词匹配（简单实现）
        p0_keywords = ['是', '喜欢', '讨厌', '住在', '年龄', '身份', '职业', '名字']
        p1_keywords = ['项目', '开发', '任务', '计划', '目标', '进行中', '待办']
        
        text_lower = text.lower()
        
        # 检查 P0 关键词
        if any(kw in text_lower for kw in p0_keywords):
            return PriorityLevel.P0
        
        # 检查 P1 关键词
        if any(kw in text_lower for kw in p1_keywords):
            return PriorityLevel.P1
        
        # 默认 P2
        return PriorityLevel.P2
        
    def batch_classify(self, texts: List[str]) -> Dict[str, PriorityLevel]:
        """批量分类优先级"""
        results = {}
        for text in texts:
            results[text] = self.auto_classify(text)
        return results
        
    def get_ttl_days(self, priority: str) -> int:
        """获取 TTL 天数"""
        try:
            priority_level = PriorityLevel(priority)
            config = self.configs[priority_level]
            return config.ttl_days
        except (ValueError, KeyError):
            return 30
        
    def should_auto_archive(self, priority: str) -> bool:
        """是否应该自动归档"""
        try:
            priority_level = PriorityLevel(priority)
            config = self.configs[priority_level]
            return config.auto_archive
        except (ValueError, KeyError):
            return True
    
    def upgrade_priority(self, text: str, current_priority: str) -> str:
        """根据内容重要性升级优先级"""
        # 如果包含重要关键词，升级到 P0
        important_keywords = ['永远', '重要', '必须', '一定', '核心', '身份']
        if any(kw in text for kw in important_keywords):
            return 'P0'
        
        return current_priority
    
    def downgrade_priority(self, created_at: str, current_priority: str) -> str:
        """根据时间降级优先级"""
        try:
            created_date = datetime.fromisoformat(created_at)
            days_since = (datetime.now() - created_date).days
            
            # 超过 60 天的 P2 可以降级为归档
            if current_priority == 'P2' and days_since > 60:
                return 'ARCHIVE'
            
            # 超过 180 天的 P1 降级为 P2
            if current_priority == 'P1' and days_since > 180:
                return 'P2'
            
            return current_priority
            
        except (ValueError, TypeError):
            return current_priority


def demo():
    """演示示例"""
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    
    print("优先级管理器演示\n")
    
    pm = PriorityManager()
    
    # 测试解析
    test_cases = [
        "- [P0][2026-04-12] Jake，12 岁，OpenClaw 开发者",
        "- [P1][2026-04-06] Memory-Master v4.3.0 开发中",
        "- [P2][2026-04-01] 今天测试了新的压缩算法",
    ]
    
    print("1. 解析优先级格式:")
    for case in test_cases:
        priority, date, content = pm.parse_priority(case)
        print(f"   {case}")
        print(f"   -> 优先级：{priority}, 日期：{date}, 内容：{content}\n")
    
    # 测试格式化
    print("2. 格式化记忆:")
    formatted = pm.format_memory("P1", "2026-04-12", "测试内容")
    print(f"   {formatted}\n")
    
    # 测试过期检查
    print("3. 过期检查:")
    print(f"   P0 (2020-01-01): 过期={pm.is_expired('P0', '2020-01-01')}")
    print(f"   P1 (2026-04-01): 过期={pm.is_expired('P1', '2026-04-01')}")
    print(f"   P2 (2026-03-01): 过期={pm.is_expired('P2', '2026-03-01')}\n")
    
    # 测试重要性因子
    print("4. 重要性因子:")
    print(f"   P0: {pm.get_importance_boost('P0')}")
    print(f"   P1: {pm.get_importance_boost('P1')}")
    print(f"   P2: {pm.get_importance_boost('P2')}\n")
    
    # 测试自动分类
    print("5. 自动分类:")
    test_texts = [
        "我喜欢喝咖啡",
        "正在开发 Memory-Master 项目",
        "今天天气不错",
    ]
    for text in test_texts:
        priority = pm.auto_classify(text)
        print(f"   '{text}' -> {priority.value}")
    
    print("\n演示完成！")


if __name__ == "__main__":
    demo()
