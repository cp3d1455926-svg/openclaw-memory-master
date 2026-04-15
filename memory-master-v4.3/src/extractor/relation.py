"""
RelationExtractor - 关系提取器
"""

from typing import List, Dict
from dataclasses import dataclass
from enum import Enum
import os
import json
from datetime import datetime
try:
    from .entity import Entity, EntityType
except ImportError:
    from entity import Entity, EntityType


class RelationType(Enum):
    """关系类型"""
    WORKS_ON = "works_on"              # 人物 - 项目
    CREATED = "created"                # 人物 - 文档/项目
    BELONGS_TO = "belongs_to"          # 任务 - 项目
    RELATED_TO = "related_to"          # 概念 - 概念
    PARTICIPATED = "participated"      # 人物 - 事件
    MENTIONED = "mentioned"            # 实体 - 文档
    DEPENDS_ON = "depends_on"          # 任务 - 任务
    CONTAINS = "contains"              # 项目 - 任务
    LOCATED_AT = "located_at"          # 事件 - 地点
    COLLABORATED_WITH = "collaborated_with"  # 人物 - 人物
    SUPERVISED = "supervised"          # 人物 - 人物
    REFERENCED = "referenced"          # 文档 - 文档
    DERIVED_FROM = "derived_from"      # 概念 - 概念


@dataclass
class Relation:
    """关系"""
    id: str
    source_entity_id: str
    target_entity_id: str
    relation_type: RelationType
    description: str
    metadata: Dict
    created_at: str


class RelationExtractor:
    """关系提取器 - 从文本中自动识别实体间的关系"""
    
    def __init__(self, model: str = "qwen3.5-plus"):
        self.model = model
        self.extraction_prompt = """
你是一个关系提取专家。从以下文本中识别实体间的关系。

已知实体：
{entities}

文本：
{text}

可能的关系类型：
- works_on: 人物在某个项目上工作
- created: 人物创建了文档/项目
- belongs_to: 任务属于某个项目
- related_to: 概念之间相关
- participated: 人物参与了事件
- collaborated_with: 人物之间合作
- depends_on: 任务依赖于另一个任务
- contains: 项目包含任务
- referenced: 文档引用另一个文档

请以 JSON 格式返回：
```json
[
  {{
    "source_entity": "源实体名称",
    "target_entity": "目标实体名称",
    "relation_type": "关系类型",
    "description": "关系描述"
  }}
]
```

只返回 JSON，不要其他内容。
"""
        
    def extract(self, text: str, entities: List[Entity]) -> List[Relation]:
        """从文本中提取关系"""
        import json
        from datetime import datetime
        
        # 格式化实体列表
        entities_str = "\n".join([
            f"- {e.name} ({e.type.value}): {e.description}"
            for e in entities
        ])
        
        # 调用 LLM
        prompt = self.extraction_prompt.format(
            entities=entities_str,
            text=text
        )
        response = self._call_llm(prompt)
        
        # 解析 JSON
        try:
            relations_data = json.loads(response)
        except json.JSONDecodeError:
            # 尝试提取 JSON 部分
            start = response.find('[\n')
            end = response.rfind(']') + 1
            if start != -1 and end != -1:
                relations_data = json.loads(response[start:end])
            else:
                return []
        
        # 转换为 Relation 对象
        relations = []
        entity_map = {e.name.lower(): e for e in entities}
        
        for data in relations_data:
            source_name = data.get('source_entity', '').lower()
            target_name = data.get('target_entity', '').lower()
            
            # 查找实体
            source_entity = entity_map.get(source_name)
            target_entity = entity_map.get(target_name)
            
            if not source_entity or not target_entity:
                continue
            
            try:
                relation_type = RelationType(data.get('relation_type', 'related_to'))
            except ValueError:
                relation_type = RelationType.RELATED_TO
            
            relation = Relation(
                id=self._generate_id(source_entity.id, target_entity.id),
                source_entity_id=source_entity.id,
                target_entity_id=target_entity.id,
                relation_type=relation_type,
                description=data.get('description', ''),
                metadata={
                    'source_text': text[:100]
                },
                created_at=datetime.now().isoformat()
            )
            relations.append(relation)
        
        return relations
        
    def extract_batch(self, texts: List[str], all_entities: List[Entity]) -> List[Relation]:
        """批量提取关系"""
        all_relations = []
        for text in texts:
            relations = self.extract(text, all_entities)
            all_relations.extend(relations)
        return self.merge_relations(all_relations)
        
    def merge_relations(self, relations: List[Relation]) -> List[Relation]:
        """合并重复关系"""
        seen = {}
        merged = []
        
        for relation in relations:
            key = f"{relation.source_entity_id}_{relation.target_entity_id}_{relation.relation_type.value}"
            if key not in seen:
                seen[key] = relation
                merged.append(relation)
            else:
                # 合并元数据
                existing = seen[key]
                for k, v in relation.metadata.items():
                    if k not in existing.metadata:
                        existing.metadata[k] = v
        
        return merged
        
    def validate(self, relation: Relation) -> bool:
        """验证关系"""
        # 基本验证
        if not relation.source_entity_id or not relation.target_entity_id:
            return False
        
        # 不能是自环
        if relation.source_entity_id == relation.target_entity_id:
            return False
        
        # 关系类型必须有效
        if relation.relation_type not in RelationType:
            return False
        
        return True
        
    def infer_missing(self, entities: List[Entity], relations: List[Relation]) -> List[Relation]:
        """推断缺失的关系（传递闭包等）"""
        inferred = []
        
        # 构建邻接表
        graph = {}
        for rel in relations:
            if rel.source_entity_id not in graph:
                graph[rel.source_entity_id] = []
            graph[rel.source_entity_id].append((rel.target_entity_id, rel.relation_type))
        
        # 传递闭包推断（简单实现）
        # 如果 A works_on B, B contains C, 则推断 A works_on C
        for source_id, targets in graph.items():
            for target_id, rel_type in targets:
                if target_id in graph:
                    for next_target, next_rel_type in graph[target_id]:
                        if rel_type == RelationType.WORKS_ON and next_rel_type == RelationType.CONTAINS:
                            # 推断新的关系
                            inferred_relation = Relation(
                                id=self._generate_id(source_id, next_target),
                                source_entity_id=source_id,
                                target_entity_id=next_target,
                                relation_type=RelationType.WORKS_ON,
                                description="推断关系：通过传递性",
                                metadata={'inferred': True},
                                created_at=datetime.now().isoformat()
                            )
                            inferred.append(inferred_relation)
        
        return inferred
    
    def _generate_id(self, source_id: str, target_id: str) -> str:
        """生成关系 ID"""
        import hashlib
        import time
        timestamp = str(time.time())
        hash_obj = hashlib.md5(f"{source_id}{target_id}{timestamp}".encode())
        return f"rel_{hash_obj.hexdigest()[:12]}"
    
    def _call_llm(self, prompt: str) -> str:
        """调用 LLM"""
        try:
            # 尝试使用 OpenClaw
            from sessions_send import sessions_send
            response = sessions_send(
                message=f"请提取关系：{prompt}",
                timeoutSeconds=30
            )
            return response.get('content', '[]')
        except ImportError:
            # 使用 API
            try:
                import requests
                api_key = os.getenv('DASHSCOPE_API_KEY', '')
                headers = {
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json'
                }
                payload = {
                    'model': self.model,
                    'messages': [{'role': 'user', 'content': prompt}],
                    'max_tokens': 1000
                }
                response = requests.post(
                    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
                    headers=headers,
                    json=payload
                )
                result = response.json()
                return result['output']['text']
            except Exception as e:
                print(f"⚠️ LLM 调用失败：{e}")
                return "[]"
        except Exception as e:
            print(f"⚠️ 关系提取失败：{e}")
            return "[]"


def demo():
    """演示示例"""
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    
    print("关系提取器演示\n")
    
    # 创建示例实体
    entities = [
        Entity(
            id="entity_001",
            name="Jake",
            type=EntityType.PERSON,
            description="12 岁，OpenClaw 开发者",
            metadata={},
            created_at="2026-04-12"
        ),
        Entity(
            id="entity_002",
            name="Memory-Master",
            type=EntityType.PROJECT,
            description="OpenClaw 的记忆系统",
            metadata={},
            created_at="2026-04-06"
        ),
        Entity(
            id="entity_003",
            name="实体提取器开发",
            type=EntityType.TASK,
            description="v4.3.0 的核心功能",
            metadata={},
            created_at="2026-04-12"
        ),
    ]
    
    # 测试文本
    text = "Jake 正在开发 Memory-Master 项目，需要完成实体提取器的开发。"
    
    print(f"测试文本：{text}\n")
    print("已知实体:")
    for e in entities:
        print(f"  - {e.name} ({e.type.value})")
    
    print("\n预期提取的关系:")
    print("  - Jake works_on Memory-Master")
    print("  - Jake 需要完成 实体提取器开发 (depends_on)")
    print("  - 实体提取器开发 belongs_to Memory-Master")
    
    print("\n演示完成！")


if __name__ == "__main__":
    demo()
