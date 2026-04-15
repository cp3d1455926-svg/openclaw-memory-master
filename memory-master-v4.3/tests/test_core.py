"""
Memory-Master v4.3.0 单元测试
"""

import pytest
import sys
import os

# 添加 src 到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from extractor.entity import EntityExtractor, EntityType
from extractor.relation import RelationExtractor, RelationType
from priority.manager import PriorityManager, PriorityLevel


class TestEntityExtractor:
    """测试实体提取器"""
    
    def test_entity_types(self):
        """测试实体类型枚举"""
        assert EntityType.PERSON.value == "Person"
        assert EntityType.PROJECT.value == "Project"
        assert EntityType.TASK.value == "Task"
        assert EntityType.EVENT.value == "Event"
        assert EntityType.DOCUMENT.value == "Document"
        assert EntityType.CONCEPT.value == "Concept"
    
    def test_extractor_init(self):
        """测试提取器初始化"""
        ee = EntityExtractor()
        assert ee.model == "qwen3.5-plus"
        
    def test_merge_entities(self):
        """测试实体合并"""
        ee = EntityExtractor()
        entities = [
            ee.extract.__globals__['Entity'](
                id="1",
                name="Jake",
                type=EntityType.PERSON,
                description="开发者",
                metadata={"age": 12},
                created_at="2026-04-12"
            ),
            ee.extract.__globals__['Entity'](
                id="2",
                name="Jake",
                type=EntityType.PERSON,
                description="12 岁",
                metadata={"project": "Memory-Master"},
                created_at="2026-04-12"
            ),
        ]
        merged = ee.merge_entities(entities)
        assert len(merged) == 1
        assert "age" in merged[0].metadata or "project" in merged[0].metadata


class TestRelationExtractor:
    """测试关系提取器"""
    
    def test_relation_types(self):
        """测试关系类型枚举"""
        assert RelationType.WORKS_ON.value == "works_on"
        assert RelationType.CREATED.value == "created"
        assert RelationType.BELONGS_TO.value == "belongs_to"
        assert len(RelationType) == 13  # 13 种关系
    
    def test_extractor_init(self):
        """测试提取器初始化"""
        re = RelationExtractor()
        assert re.model == "qwen3.5-plus"
    
    def test_validate_relation(self):
        """测试关系验证"""
        re = RelationExtractor()
        from extractor.relation import Relation
        
        # 有效关系
        valid_rel = Relation(
            id="rel_001",
            source_entity_id="entity_001",
            target_entity_id="entity_002",
            relation_type=RelationType.WORKS_ON,
            description="测试关系",
            metadata={},
            created_at="2026-04-12"
        )
        assert re.validate(valid_rel) == True
        
        # 自环关系（无效）
        invalid_rel = Relation(
            id="rel_002",
            source_entity_id="entity_001",
            target_entity_id="entity_001",
            relation_type=RelationType.WORKS_ON,
            description="自环",
            metadata={},
            created_at="2026-04-12"
        )
        assert re.validate(invalid_rel) == False


class TestPriorityManager:
    """测试优先级管理器"""
    
    def test_priority_levels(self):
        """测试优先级枚举"""
        assert PriorityLevel.P0.value == "P0"
        assert PriorityLevel.P1.value == "P1"
        assert PriorityLevel.P2.value == "P2"
    
    def test_parse_priority(self):
        """测试优先级解析"""
        pm = PriorityManager()
        priority, date, content = pm.parse_priority("- [P1][2026-04-12] 测试内容")
        assert priority == "P1"
        assert date == "2026-04-12"
        assert content == "测试内容"
        
    def test_format_memory(self):
        """测试优先级格式化"""
        pm = PriorityManager()
        formatted = pm.format_memory("P1", "2026-04-12", "测试内容")
        assert "[P1]" in formatted
        assert "2026-04-12" in formatted
        assert "测试内容" in formatted
        
    def test_is_expired(self):
        """测试过期检查"""
        pm = PriorityManager()
        # P2 超过 30 天应该过期
        assert pm.is_expired("P2", "2026-03-01") == True
        # P1 在 90 天内不过期
        assert pm.is_expired("P1", "2026-04-01") == False
        # P0 永不过期
        assert pm.is_expired("P0", "2020-01-01") == False
        
    def test_get_importance_boost(self):
        """测试重要性因子"""
        pm = PriorityManager()
        assert pm.get_importance_boost("P0") == 1.5
        assert pm.get_importance_boost("P1") == 1.2
        assert pm.get_importance_boost("P2") == 1.0
    
    def test_auto_classify(self):
        """测试自动分类"""
        pm = PriorityManager()
        # P0: 身份相关
        assert pm.auto_classify("我喜欢喝咖啡") == PriorityLevel.P0
        # P1: 项目相关
        assert pm.auto_classify("正在开发 Memory-Master 项目") == PriorityLevel.P1
        # P2: 日常对话
        assert pm.auto_classify("今天天气不错") == PriorityLevel.P2
    
    def test_get_ttl_days(self):
        """测试 TTL 天数"""
        pm = PriorityManager()
        assert pm.get_ttl_days("P0") == 9999
        assert pm.get_ttl_days("P1") == 90
        assert pm.get_ttl_days("P2") == 30
    
    def test_should_auto_archive(self):
        """测试自动归档配置"""
        pm = PriorityManager()
        assert pm.should_auto_archive("P0") == False
        assert pm.should_auto_archive("P1") == True
        assert pm.should_auto_archive("P2") == True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
