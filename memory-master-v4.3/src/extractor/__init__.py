"""
实体关系提取模块 - 从文本中自动识别实体和关系
"""

from .entity import EntityExtractor
from .relation import RelationExtractor

__all__ = ["EntityExtractor", "RelationExtractor"]
